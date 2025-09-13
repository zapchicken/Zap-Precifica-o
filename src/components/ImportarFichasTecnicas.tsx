import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  FileText
} from "lucide-react"
import * as XLSX from 'xlsx'

interface FichaTecnicaImport {
  codigo_pdv: string
  produto: string
  categoria: string
  tempo_preparo: number
  rendimento: number
  custo_unitario: number
  modo_preparo: string
  insumos: Array<{
    nome: string
    quantidade: number
    unidade: string
    custo: number
  }>
}

interface ImportResult {
  success: boolean
  total: number
  imported: number
  errors: string[]
  fichas: FichaTecnicaImport[]
}

interface ImportarFichasTecnicasProps {
  onImportSuccess?: () => void
}

export default function ImportarFichasTecnicas({ onImportSuccess }: ImportarFichasTecnicasProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/templates/template_fichas_tecnicas.csv'
    link.download = 'template_fichas_tecnicas.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Template baixado",
      description: "Arquivo template_fichas_tecnicas.csv foi baixado com sucesso!"
    })
  }

  // Função para salvar fichas técnicas no banco de dados
  const salvarFichasNoBanco = async (fichas: FichaTecnicaImport[]): Promise<{ sucesso: number, erros: string[] }> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    let sucesso = 0
    const erros: string[] = []

    for (const ficha of fichas) {
      try {
        // Inserir ficha técnica
        const { data: fichaData, error: fichaError } = await supabase
          .from('fichas_tecnicas')
          .insert([{
            nome: ficha.produto,
            codigo: ficha.codigo_pdv,
            categoria: ficha.categoria || 'LANCHES',
            tempo_preparo: ficha.tempo_preparo,
            rendimento: ficha.rendimento,
            custo_total_producao: ficha.custo_unitario,
            modo_preparo: ficha.modo_preparo,
            data_ficha: new Date().toISOString().split('T')[0],
            ativo: true,
            user_id: user.id
          }])
          .select()
          .single()

        if (fichaError) {
          erros.push(`Erro ao salvar ${ficha.produto}: ${fichaError.message}`)
          continue
        }

        // Se há insumos, salvar na tabela de relacionamento
        if (ficha.insumos && ficha.insumos.length > 0) {
          for (const insumo of ficha.insumos) {
            // Buscar insumo pelo nome
            const { data: insumoData } = await supabase
              .from('insumos')
              .select('id')
              .eq('nome', insumo.nome)
              .eq('user_id', user.id)
              .single()

            if (insumoData) {
              await supabase
                .from('fichas_insumos')
                .insert([{
                  ficha_id: fichaData.id,
                  insumo_id: insumoData.id,
                  quantidade: insumo.quantidade,
                  unidade: insumo.unidade,
                  custo_unitario: insumo.custo,
                  custo_total: insumo.quantidade * insumo.custo,
                  user_id: user.id
                }])
            }
          }
        }

        sucesso++
      } catch (error: any) {
        erros.push(`Erro ao processar ${ficha.produto}: ${error.message}`)
      }
    }

    return { sucesso, erros }
  }

  const processFile = async (file: File): Promise<ImportResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          let workbook: XLSX.WorkBook
          
          if (file.name.endsWith('.csv')) {
            workbook = XLSX.read(data, { type: 'binary' })
          } else {
            workbook = XLSX.read(data, { type: 'array' })
          }
          
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          const fichas: FichaTecnicaImport[] = []
          const errors: string[] = []
          
          jsonData.forEach((row: any, index: number) => {
            try {
              const rowNumber = index + 2 // +2 porque índice começa em 0 e linha 1 é cabeçalho
              
              // Validações obrigatórias
              if (!row.codigo_pdv) {
                errors.push(`Linha ${rowNumber}: Código PDV é obrigatório`)
                return
              }
              
              if (!row.produto) {
                errors.push(`Linha ${rowNumber}: Nome do produto é obrigatório`)
                return
              }
              
              // Processar insumos
              const insumos = []
              for (let i = 1; i <= 10; i++) {
                const nome = row[`insumo_${i}_nome`]
                const quantidade = row[`insumo_${i}_quantidade`]
                const unidade = row[`insumo_${i}_unidade`]
                const custo = row[`insumo_${i}_custo`]
                
                if (nome && quantidade && unidade && custo) {
                  insumos.push({
                    nome: nome.toString().trim(),
                    quantidade: parseFloat(quantidade),
                    unidade: unidade.toString().trim(),
                    custo: parseFloat(custo)
                  })
                }
              }
              
              // Permitir fichas sem insumos (serão preenchidas depois)
              // if (insumos.length === 0) {
              //   errors.push(`Linha ${rowNumber}: Pelo menos um insumo é obrigatório`)
              //   return
              // }
              
              const ficha: FichaTecnicaImport = {
                codigo_pdv: row.codigo_pdv.toString().trim(),
                produto: row.produto.toString().trim(),
                categoria: row.categoria?.toString().trim() || null,
                tempo_preparo: parseInt(row.tempo_preparo) || 0,
                rendimento: parseFloat(row.rendimento) || 1,
                custo_unitario: parseFloat(row.custo_unitario) || 0,
                modo_preparo: row.modo_preparo?.toString().trim() || '',
                insumos
              }
              
              fichas.push(ficha)
            } catch (error) {
              errors.push(`Linha ${index + 2}: Erro ao processar dados - ${error}`)
            }
          })
          
          resolve({
            success: errors.length === 0,
            total: jsonData.length,
            imported: fichas.length,
            errors,
            fichas
          })
          
        } catch (error) {
          resolve({
            success: false,
            total: 0,
            imported: 0,
            errors: [`Erro ao ler arquivo: ${error}`],
            fichas: []
          })
        }
      }
      
      if (file.name.endsWith('.csv')) {
        reader.readAsBinaryString(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setProgress(0)
    setResult(null)

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const importResult = await processFile(file)
      
      // Se o processamento foi bem-sucedido, salvar no banco
      if (importResult.success && importResult.fichas.length > 0) {
        setProgress(95)
        const salvarResult = await salvarFichasNoBanco(importResult.fichas)
        
        // Atualizar resultado com informações de salvamento
        importResult.imported = salvarResult.sucesso
        importResult.errors = [...importResult.errors, ...salvarResult.erros]
        importResult.success = salvarResult.sucesso > 0
      }
      
      clearInterval(progressInterval)
      setProgress(100)
      setResult(importResult)

      if (importResult.success) {
        toast({
          title: "Importação concluída",
          description: `${importResult.imported} fichas técnicas salvas no banco de dados com sucesso!`
        })
      } else {
        toast({
          title: "Importação com erros",
          description: `${importResult.imported} fichas salvas, ${importResult.errors.length} erros encontrados`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro durante a importação do arquivo",
        variant: "destructive"
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const resetImport = () => {
    setResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4" />
          Importar Fichas Técnicas
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Fichas Técnicas
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Download Template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                1. Baixar Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Baixe o template com as colunas corretas e exemplos de fichas técnicas.
              </p>
              <Button variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4" />
                Baixar Template (.csv)
              </Button>
            </CardContent>
          </Card>

          {/* Upload File */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                2. Enviar Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione o arquivo .xlsx ou .csv com as fichas técnicas preenchidas.
              </p>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                
                {importing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processando arquivo...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total de linhas:</span>
                    <span className="ml-2">{result.total}</span>
                  </div>
                  <div>
                    <span className="font-medium">Fichas importadas:</span>
                    <span className="ml-2 text-success">{result.imported}</span>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Erros encontrados:</p>
                        <ul className="list-disc list-inside text-xs space-y-1 max-h-32 overflow-y-auto">
                          {result.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={resetImport} variant="outline" size="sm">
                    Nova Importação
                  </Button>
                  {result.success && (
                    <Button onClick={() => {
                      setIsOpen(false)
                      if (onImportSuccess) {
                        onImportSuccess()
                      }
                    }} size="sm">
                      Concluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}