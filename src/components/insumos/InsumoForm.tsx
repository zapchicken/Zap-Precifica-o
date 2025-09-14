import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Plus, Save, X, Calculator } from 'lucide-react'
import { useFornecedores } from '@/hooks/useFornecedores'
import { useInsumos } from '@/hooks/useInsumos'
import type { InsumoInsert, InsumoUpdate, Insumo } from '@/integrations/supabase/types'
import { Switch } from '@/components/ui/switch'

interface InsumoFormProps {
  insumo?: Insumo
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const CATEGORIAS = [
  'ALIMENTOS',
  'BEBIDAS',
  'EMBALAGENS',
  'HORTIFRUTI',
  'MATERIAL DE LIMPEZA',
  'TEMPEROS',
  'UTILIDADES'
]

const UNIDADES_MEDIDA = [
  'kg',
  'g',
  'litro',
  'ml',
  'unidade',
  'caixa',
  'pacote',
  'saco',
  'lata',
  'pote'
]

const DEPOSITOS = [
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

// Função para calcular expressões matemáticas básicas
const calcularExpressao = (expressao: string): number | null => {
  try {
    // Remove espaços e converte vírgulas em pontos
    const expressaoLimpa = expressao.replace(/\s/g, '').replace(/,/g, '.')
    
    // Verifica se contém apenas números, operadores básicos e parênteses
    if (!/^[0-9+\-*/().]+$/.test(expressaoLimpa)) {
      return null
    }
    
    // Calcula a expressão usando eval (cuidado com segurança)
    const resultado = eval(expressaoLimpa)
    
    // Verifica se o resultado é um número válido
    if (typeof resultado === 'number' && !isNaN(resultado) && isFinite(resultado)) {
      return Math.round(resultado * 100) / 100 // Arredonda para 2 casas decimais
    }
    
    return null
  } catch (error) {
    return null
  }
}

export function InsumoForm({ insumo, onSuccess, trigger }: InsumoFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [precoInput, setPrecoInput] = useState('')
  const { fornecedores } = useFornecedores()
  const { createInsumo, updateInsumo } = useInsumos()
  
  const [formData, setFormData] = useState<InsumoInsert>({
    nome: '',
    codigo_insumo: '',
    fornecedor_id: null,
    categoria: '',
    unidade_medida: '',
    tipo_embalagem: '',
    preco_por_unidade: 0,
    fator_correcao: 1.0,
    quantidade_minima_compra: 0,
    deposito: '',
    observacoes: '',
    ativo: true
  })

  useEffect(() => {
    if (insumo) {
      setFormData({
        nome: insumo.nome,
        codigo_insumo: insumo.codigo_insumo || '',
        fornecedor_id: insumo.fornecedor_id,
        categoria: insumo.categoria,
        unidade_medida: insumo.unidade_medida,
        tipo_embalagem: insumo.tipo_embalagem || '',
        preco_por_unidade: insumo.preco_por_unidade,
        fator_correcao: insumo.fator_correcao,
        quantidade_minima_compra: insumo.quantidade_minima_compra,
        deposito: insumo.deposito || '',
        observacoes: insumo.observacoes || '',
        ativo: insumo.ativo
      })
      setPrecoInput(insumo.preco_por_unidade.toString())
    } else {
      setPrecoInput('')
    }
  }, [insumo])

  const handlePrecoChange = (value: string) => {
    setPrecoInput(value)
    
    // Tenta calcular a expressão
    const resultado = calcularExpressao(value)
    if (resultado !== null) {
      setFormData(prev => ({ ...prev, preco_por_unidade: resultado }))
    } else {
      // Se não conseguir calcular, tenta converter para número
      const numero = parseFloat(value.replace(',', '.'))
      if (!isNaN(numero)) {
        setFormData(prev => ({ ...prev, preco_por_unidade: numero }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (insumo) {
        await updateInsumo(insumo.id, formData)
      } else {
        await createInsumo(formData)
      }
      
      setOpen(false)
      onSuccess?.()
      
      // Reset form if creating new
      if (!insumo) {
        setFormData({
          nome: '',
          codigo_insumo: '',
          fornecedor_id: null,
          categoria: '',
          unidade_medida: '',
          tipo_embalagem: '',
          preco_por_unidade: 0,
          fator_correcao: 1.0,
          quantidade_minima_compra: 0,
          deposito: '',
          observacoes: '',
          ativo: true
        })
        setPrecoInput('')
      }
    } catch (error) {
      console.error('Erro ao salvar insumo:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarCodigoInsumo = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    if (numeros) {
      return `INS${numeros.padStart(3, '0')}`
    }
    return ''
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Insumo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {insumo ? 'Editar Insumo' : 'Adicionar Novo Insumo'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do insumo abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome do Insumo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Insumo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Frango Inteiro Congelado"
                className="min-h-[48px]"
                required
              />
            </div>

            {/* Código do Insumo */}
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Insumo</Label>
              <Input
                id="codigo"
                value={formData.codigo_insumo || ''}
                onChange={(e) => {
                  const valor = e.target.value
                  if (valor === '' || /^INS\d{0,3}$/.test(valor) || /^\d{0,3}$/.test(valor)) {
                    setFormData(prev => ({ ...prev, codigo_insumo: valor }))
                  }
                }}
                onBlur={(e) => {
                  const valor = e.target.value
                  if (valor && valor !== '') {
                    const codigoFormatado = formatarCodigoInsumo(valor)
                    setFormData(prev => ({ ...prev, codigo_insumo: codigoFormatado }))
                  }
                }}
                placeholder="Ex: INS001 ou digite apenas 1"
                className="min-h-[48px]"
              />
            </div>

            {/* Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Select 
                value={formData.fornecedor_id || 'none'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, fornecedor_id: value === 'none' ? null : value }))}
              >
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Selecionar fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum fornecedor</SelectItem>
                  {fornecedores
                    .filter(f => f.status === 'ativo')
                    .map(fornecedor => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.razao_social}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unidade de Medida */}
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade de Medida *</Label>
              <Select 
                value={formData.unidade_medida} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unidade_medida: value }))}
              >
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Selecionar unidade" />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_MEDIDA.map(unidade => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Embalagem */}
            <div className="space-y-2">
              <Label htmlFor="embalagem">Tipo de Embalagem</Label>
              <Input
                id="embalagem"
                value={formData.tipo_embalagem || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_embalagem: e.target.value }))}
                placeholder="Ex: Caixa com 10 kg"
              />
            </div>

            {/* Preço por Unidade */}
            <div className="space-y-2">
              <Label htmlFor="preco" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Preço por Unidade (R$) *
                <span className="text-xs text-muted-foreground">
                  (Ex: 10+5, 20*1.1, 100/4)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="preco"
                  type="text"
                  value={precoInput}
                  onChange={(e) => handlePrecoChange(e.target.value)}
                  placeholder="Ex: 10.50 ou 10+5 ou 20*1.1"
                  required
                  className="pr-10"
                />
                {precoInput && calcularExpressao(precoInput) !== null && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-sm font-medium">
                    = {calcularExpressao(precoInput)}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Digite números ou expressões matemáticas: +, -, *, /, (, )
              </p>
            </div>

            {/* Fator de Correção */}
            <div className="space-y-2">
              <Label htmlFor="fator">Fator de Correção</Label>
              <Input
                id="fator"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.fator_correcao}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 1.0
                  // Arredonda para 1 casa decimal
                  const roundedValue = Math.round(value * 10) / 10
                  setFormData(prev => ({ ...prev, fator_correcao: roundedValue }))
                }}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground">
                💡 Exemplo: 1.0 (padrão), 1.2 (20% a mais), 0.8 (20% a menos)
              </p>
            </div>

            {/* Quantidade Mínima de Compra */}
            <div className="space-y-2">
              <Label htmlFor="quantidade_minima">Quantidade Mínima de Compra</Label>
              <Input
                id="quantidade_minima"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantidade_minima_compra}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  // Arredonda para 2 casas decimais
                  const roundedValue = Math.round(value * 100) / 100
                  setFormData(prev => ({ ...prev, quantidade_minima_compra: roundedValue }))
                }}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                💡 Exemplo: 5.5 kg, 2.25 litros, 10.75 unidades
              </p>
            </div>

            {/* Depósito */}
            <div className="space-y-2">
              <Label htmlFor="deposito">Depósito</Label>
              <Select 
                value={formData.deposito || 'none'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, deposito: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar depósito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum depósito</SelectItem>
                  {DEPOSITOS.map(deposito => (
                    <SelectItem key={deposito} value={deposito}>
                      {deposito}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Ativo/Inativo */}
            <div className="space-y-2">
              <Label htmlFor="ativo">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo" className="text-sm">
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </Label>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre o insumo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}