import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useInsumos } from '@/hooks/useInsumos'
import * as XLSX from 'xlsx'
import type { InsumoInsert } from '@/integrations/supabase/types'

interface InsumoExcelRow {
  nome: string
  codigo_insumo?: string
  categoria: string
  unidade_medida: string
  tipo_embalagem?: string
  preco_por_unidade: number
  fator_correcao?: number
  quantidade_minima_compra?: number
  deposito?: string
  observacoes?: string
  ativo?: boolean
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function UploadInsumosExcel() {
  const { toast } = useToast()
  const { createInsumo } = useInsumos()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [data, setData] = useState<InsumoExcelRow[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const CATEGORIAS_VALIDAS = [
    'ALIMENTOS',
    'BEBIDAS', 
    'EMBALAGENS',
    'HORTIFRUTI',
    'MATERIAL DE LIMPEZA',
    'TEMPEROS',
    'UTILIDADES'
  ]

  const UNIDADES_VALIDAS = [
    'kg', 'g', 'litro', 'ml', 'unidade', 'caixa', 'pacote', 'saco', 'lata', 'pote'
  ]

  const DEPOSITOS_VALIDOS = [
    'Depósito Principal',
    'Depósito Seco', 
    'Depósito Congelados',
    'Câmara Fria',
    'Depósito Padaria',
    'Balcão',
    'Cozinha',
    'Freezers',
    'Corredor'
  ]

  const validateRow = (row: InsumoExcelRow, index: number): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Campos obrigatórios
    if (!row.nome || row.nome.trim() === '') {
      errors.push('Nome é obrigatório')
    }

    if (!row.categoria || row.categoria.trim() === '') {
      errors.push('Categoria é obrigatória')
    } else if (!CATEGORIAS_VALIDAS.includes(row.categoria.toUpperCase())) {
      warnings.push(`Categoria "${row.categoria}" não está na lista padrão`)
    }

    if (!row.unidade_medida || row.unidade_medida.trim() === '') {
      errors.push('Unidade de medida é obrigatória')
    } else if (!UNIDADES_VALIDAS.includes(row.unidade_medida.toLowerCase())) {
      warnings.push(`Unidade "${row.unidade_medida}" não está na lista padrão`)
    }

    if (!row.preco_por_unidade || isNaN(row.preco_por_unidade) || row.preco_por_unidade <= 0) {
      errors.push('Preço por unidade deve ser um número maior que zero')
    }

    // Validações opcionais
    if (row.fator_correcao && (isNaN(row.fator_correcao) || row.fator_correcao <= 0)) {
      errors.push('Fator de correção deve ser um número maior que zero')
    }

    if (row.quantidade_minima_compra && (isNaN(row.quantidade_minima_compra) || row.quantidade_minima_compra < 0)) {
      errors.push('Quantidade mínima de compra deve ser um número maior ou igual a zero')
    }

    if (row.deposito && !DEPOSITOS_VALIDOS.includes(row.deposito)) {
      warnings.push(`Depósito "${row.deposito}" não está na lista padrão`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Converter para formato esperado
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]
        
        const insumosData: InsumoExcelRow[] = rows.map((row, index) => {
          const insumo: any = {}
          headers.forEach((header, colIndex) => {
            const value = row[colIndex]
            const cleanHeader = header?.toString().toLowerCase().replace(/\s+/g, '_')
            
            switch (cleanHeader) {
              case 'nome':
                insumo.nome = value?.toString() || ''
                break
              case 'codigo_insumo':
              case 'código':
              case 'codigo':
                insumo.codigo_insumo = value?.toString() || ''
                break
              case 'categoria':
                insumo.categoria = value?.toString() || ''
                break
              case 'unidade_medida':
              case 'unidade':
                insumo.unidade_medida = value?.toString() || ''
                break
              case 'tipo_embalagem':
              case 'embalagem':
                insumo.tipo_embalagem = value?.toString() || ''
                break
              case 'preco_por_unidade':
              case 'preço':
              case 'preco':
                insumo.preco_por_unidade = parseFloat(value) || 0
                break
              case 'fator_correcao':
              case 'fator':
                insumo.fator_correcao = parseFloat(value) || 1
                break
              case 'quantidade_minima_compra':
              case 'qtd_minima':
                insumo.quantidade_minima_compra = parseInt(value) || 0
                break
              case 'deposito':
              case 'depósito':
                insumo.deposito = value?.toString() || ''
                break
              case 'observacoes':
              case 'observações':
              case 'obs':
                insumo.observacoes = value?.toString() || ''
                break
              case 'ativo':
                insumo.ativo = value === 'SIM' || value === 'S' || value === 'TRUE' || value === true || value === 1
                break
            }
          })
          return insumo
        })

        // Validar dados
        const validations = insumosData.map((row, index) => validateRow(row, index + 2)) // +2 porque começa na linha 2 (header + 1)
        
        setData(insumosData)
        setValidationResults(validations)
        
        toast({
          title: "Arquivo processado",
          description: `${insumosData.length} insumos encontrados no arquivo`,
        })

      } catch (error) {
        console.error('Erro ao processar arquivo:', error)
        toast({
          title: "Erro",
          description: "Erro ao processar o arquivo Excel",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const handleUpload = async () => {
    if (data.length === 0) return

    setUploading(true)
    setProgress(0)

    const validData = data.filter((_, index) => validationResults[index]?.isValid)
    
    if (validData.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum insumo válido para upload",
        variant: "destructive"
      })
      setUploading(false)
      return
    }

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < validData.length; i++) {
      try {
        const insumoData: InsumoInsert = {
          nome: validData[i].nome,
          codigo_insumo: validData[i].codigo_insumo || null,
          categoria: validData[i].categoria,
          unidade_medida: validData[i].unidade_medida,
          tipo_embalagem: validData[i].tipo_embalagem || null,
          preco_por_unidade: validData[i].preco_por_unidade,
          fator_correcao: validData[i].fator_correcao || 1.0,
          quantidade_minima_compra: validData[i].quantidade_minima_compra || 0,
          deposito: validData[i].deposito || null,
          observacoes: validData[i].observacoes || null,
          ativo: validData[i].ativo !== undefined ? validData[i].ativo : true
        }

        await createInsumo(insumoData)
        successCount++
      } catch (error) {
        console.error('Erro ao criar insumo:', error)
        errorCount++
      }

      setProgress(((i + 1) / validData.length) * 100)
    }

    setUploading(false)
    
    toast({
      title: "Upload concluído",
      description: `${successCount} insumos criados com sucesso${errorCount > 0 ? `, ${errorCount} erros` : ''}`,
    })

    if (successCount > 0) {
      setOpen(false)
      setData([])
      setValidationResults([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const downloadTemplate = () => {
    const templateData = [
      ['nome', 'codigo_insumo', 'categoria', 'unidade_medida', 'tipo_embalagem', 'preco_por_unidade', 'fator_correcao', 'quantidade_minima_compra', 'deposito', 'observacoes', 'ativo'],
      ['Frango', 'FRG001', 'ALIMENTOS', 'kg', 'Pacote 1kg', 15.50, 1.0, 10, 'Depósito Principal', 'Produto fresco', 'SIM'],
      ['Arroz', 'ARR001', 'ALIMENTOS', 'kg', 'Saco 5kg', 8.90, 1.0, 5, 'Depósito Seco', 'Arroz tipo 1', 'SIM']
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Insumos')
    XLSX.writeFile(wb, 'template_insumos.xlsx')
  }

  const validCount = validationResults.filter(r => r.isValid).length
  const invalidCount = validationResults.length - validCount

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload de Insumos via Excel
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel (.xlsx) para importar insumos em lote
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Selecionar Arquivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Selecionar Arquivo Excel
                </Button>
                <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Baixar Template
                </Button>
              </div>
              
              {data.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{data.length}</strong> insumos encontrados no arquivo. 
                    <strong className="text-green-600"> {validCount}</strong> válidos, 
                    <strong className="text-red-600"> {invalidCount}</strong> com erros.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          {data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Preview dos Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Depósito</TableHead>
                        <TableHead>Erros</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, index) => {
                        const validation = validationResults[index]
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {validation?.isValid ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{row.nome}</TableCell>
                            <TableCell>{row.codigo_insumo || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={CATEGORIAS_VALIDAS.includes(row.categoria?.toUpperCase()) ? "default" : "secondary"}>
                                {row.categoria}
                              </Badge>
                            </TableCell>
                            <TableCell>{row.unidade_medida}</TableCell>
                            <TableCell>R$ {row.preco_por_unidade?.toFixed(2)}</TableCell>
                            <TableCell>{row.deposito || '-'}</TableCell>
                            <TableCell>
                              {validation?.errors.length > 0 && (
                                <div className="text-red-600 text-xs">
                                  {validation.errors.join(', ')}
                                </div>
                              )}
                              {validation?.warnings.length > 0 && (
                                <div className="text-yellow-600 text-xs">
                                  {validation.warnings.join(', ')}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Fazendo Upload...</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}% concluído
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={data.length === 0 || validCount === 0 || uploading}
            className="flex items-center gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload {validCount} Insumos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
