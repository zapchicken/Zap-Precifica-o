import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  DollarSign
} from "lucide-react"
import * as XLSX from 'xlsx'

interface PrecoImport {
  codigo_pdv: string
  preco_venda: number
}

interface ImportResult {
  success: boolean
  total: number
  imported: number
  errors: string[]
  precos: PrecoImport[]
}

interface ImportarPrecosProps {
  produtos: any[]
  onImportSuccess?: () => void
}

export default function ImportarPrecos({ produtos, onImportSuccess }: ImportarPrecosProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const downloadTemplate = () => {
    const csvContent = [
      'codigo_pdv,preco_venda',
      '001,15,90',
      '002,22,50',
      '003,8,75'
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'template_precos_venda.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Template baixado",
      description: "Arquivo template_precos_venda.csv foi baixado com sucesso!"
    })
  }

  // Função para salvar preços no banco de dados
  const salvarPrecosNoBanco = async (precos: PrecoImport[]): Promise<{ sucesso: number, erros: string[] }> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    let sucesso = 0
    const erros: string[] = []

    for (const preco of precos) {
      try {
        // Buscar produto pelo código PDV
        const produtoExistente = produtos.find(p => p.codigo_pdv === preco.codigo_pdv)
        
        if (!produtoExistente) {
          erros.push(`Produto com código PDV "${preco.codigo_pdv}" não encontrado`)
          continue
        }

        // Atualizar preço de venda
        const { error } = await supabase
          .from('produtos')
          .update({ 
            preco_venda: preco.preco_venda,
            updated_at: new Date().toISOString()
          })
          .eq('id', produtoExistente.id)
          .eq('user_id', user.id)

        if (error) {
          erros.push(`Erro ao atualizar ${produtoExistente.nome}: ${error.message}`)
          continue
        }

        sucesso++
      } catch (error) {
        erros.push(`Erro ao processar ${preco.codigo_pdv}: ${error}`)
      }
    }

    return { sucesso, erros }
  }

  // Função para processar arquivo
  const processarArquivo = (data: any[]): ImportResult => {
    const precos: PrecoImport[] = []
    const errors: string[] = []

    data.forEach((row, index) => {
      try {
        // Aceitar tanto codigo_pdv quanto codigo_pd
        const codigoPdv = row.codigo_pdv?.toString().trim() || row.codigo_pd?.toString().trim()
        let precoVendaStr = row.preco_venda?.toString().trim() || ''
        
        // Converter vírgula para ponto (formato brasileiro para americano)
        precoVendaStr = precoVendaStr.replace(',', '.')
        const precoVenda = parseFloat(precoVendaStr)

        if (!codigoPdv) {
          errors.push(`Linha ${index + 2}: Código PDV é obrigatório. Chaves encontradas: ${Object.keys(row).join(', ')}`)
          return
        }

        if (isNaN(precoVenda) || precoVenda <= 0) {
          errors.push(`Linha ${index + 2}: Preço de venda deve ser um número maior que zero (aceita vírgula ou ponto como separador decimal)`)
          return
        }

        precos.push({
          codigo_pdv: codigoPdv,
          preco_venda: precoVenda
        })
      } catch (error) {
        errors.push(`Linha ${index + 2}: Erro ao processar - ${error}`)
      }
    })

    return {
      success: precos.length > 0,
      total: data.length,
      imported: precos.length,
      errors,
      precos
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setProgress(0)
    setResult(null)

    try {
      setProgress(25)
      
      // Ler arquivo
      const data = await readFile(file)
      setProgress(50)

      // Processar dados
      const processResult = processarArquivo(data)
      setProgress(75)

      if (processResult.precos.length === 0) {
        setResult(processResult)
        setProgress(100)
        return
      }

      // Salvar no banco
      const { sucesso, erros } = await salvarPrecosNoBanco(processResult.precos)
      setProgress(100)

      const finalResult: ImportResult = {
        ...processResult,
        imported: sucesso,
        errors: [...processResult.errors, ...erros]
      }

      setResult(finalResult)

      if (sucesso > 0) {
        toast({
          title: "Importação concluída!",
          description: `${sucesso} preços atualizados com sucesso${erros.length > 0 ? `, ${erros.length} erros` : ''}`,
          variant: "default"
        })

        // Chamar callback de sucesso
        if (onImportSuccess) {
          onImportSuccess()
        }
      } else {
        toast({
          title: "Nenhum preço atualizado",
          description: "Verifique se os códigos PDV estão corretos",
          variant: "destructive"
        })
      }

    } catch (error) {
      toast({
        title: "Erro na importação",
        description: `Erro ao processar arquivo: ${error}`,
        variant: "destructive"
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Função para ler arquivo
  const readFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          let jsonData: any[] = []

          if (file.name.endsWith('.csv')) {
            // Processar CSV
            const text = data as string
            const lines = text.split('\n').filter(line => line.trim())
            
            // Detectar separador automaticamente (vírgula ou ponto e vírgula)
            const firstLine = lines[0]
            const separator = firstLine.includes(';') ? ';' : ','
            
            const headers = firstLine.split(separator).map(h => h.trim().toLowerCase().replace(/\r/g, ''))
            
            jsonData = lines.slice(1).map(line => {
              const values = line.split(separator)
              const obj: any = {}
              headers.forEach((header, index) => {
                obj[header] = values[index]?.trim().replace(/\r/g, '')
              })
              return obj
            }).filter(obj => Object.values(obj).some(val => val && val.toString().trim() !== ''))
          } else {
            // Processar Excel
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            
            // Converter para formato objeto
            const headers = (jsonData[0] as any[]).map(h => h.toString().toLowerCase().trim())
            jsonData = jsonData.slice(1).map((row: any[]) => {
              const obj: any = {}
              headers.forEach((header, index) => {
                obj[header] = row[index]?.toString().trim()
              })
              return obj
            }).filter(obj => Object.values(obj).some(val => val && val.toString().trim() !== ''))
          }
          
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const resetImport = () => {
    setResult(null)
    setProgress(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={resetImport}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Preços
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Importar Preços de Venda
          </DialogTitle>
          <DialogDescription>
            Importe preços de venda em lote através de arquivos CSV ou Excel. Os produtos serão identificados pelo código.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Instruções de Importação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Como funciona:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• O arquivo deve conter as colunas: <strong>codigo_pdv</strong> (ou <strong>codigo_pd</strong>) e <strong>preco_venda</strong></li>
                  <li>• Os produtos são identificados pelo código PDV (aceita 'codigo_pdv' ou 'codigo_pd')</li>
                  <li>• Preços aceitam vírgula (15,90) ou ponto (15.90) como separador decimal</li>
                  <li>• CSV aceita vírgula (,) ou ponto e vírgula (;) como separador de colunas</li>
                  <li>• Apenas produtos existentes terão seus preços atualizados</li>
                  <li>• Formatos aceitos: CSV (.csv) e Excel (.xlsx, .xls)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Exemplo do arquivo:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  codigo_pdv,preco_venda<br/>
                  001,15,90<br/>
                  002,22,50<br/>
                  003,8,75
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 <strong>Dica:</strong> Use vírgula como separador decimal (formato brasileiro) ou ponto (formato americano)<br/>
                  📝 <strong>Coluna código:</strong> Aceita 'codigo_pdv' ou 'codigo_pd'<br/>
                  🔧 <strong>Separador CSV:</strong> Aceita vírgula (,) ou ponto e vírgula (;)
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSpreadsheet className="h-4 w-4" />
                Selecionar Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Processando...' : 'Selecionar Arquivo'}
              </Button>
            </CardContent>
          </Card>

          {/* Progress */}
          {importing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da importação</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultado */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {result.imported > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{result.total}</div>
                    <div className="text-sm text-muted-foreground">Total de linhas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                    <div className="text-sm text-muted-foreground">Preços atualizados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                    <div className="text-sm text-muted-foreground">Erros</div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Erros encontrados:</strong>
                        <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                          {result.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {result.errors.length > 10 && (
                            <li>• ... e mais {result.errors.length - 10} erros</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
