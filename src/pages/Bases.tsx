import React, { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription 
} from '../components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { useToast } from '../hooks/use-toast'
import { 
  Plus, 
  Search, 
  Package2, 
  Edit, 
  Trash2, 
  Calculator, 
  ImageIcon, 
  Clock,
  Camera,
  X,
  Eye
} from 'lucide-react'
import { useBases } from '../hooks/useBases'
import { useInsumos } from '../hooks/useInsumos'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog'
import { uploadAndCompressImage, deleteImageFromStorage } from '../lib/imageUpload'

// Tipos
interface BaseInsert {
  nome: string
  codigo: string
  tipo_produto: 'peso' | 'unidade'
  quantidade_total: number
  unidade_produto: string
  rendimento: string
  custo_total_batelada: number
  modo_preparo: string
  observacoes?: string
  tempo_preparo: number
  ativo: boolean
  insumos: Array<{
    insumo_id: number
    quantidade: number
    custo: number
  }>
}

interface BaseComInsumos {
  id: string
  nome: string
  codigo: string
  tipo_produto: 'peso' | 'unidade'
  quantidade_total: number
  unidade_produto: string
  rendimento: string
  custo_total_batelada: number
  modo_preparo: string
  observacoes?: string
  tempo_preparo: number
  ativo: boolean
  data_ficha: string
  insumos: Array<{
    nome: string
    codigo?: string
    quantidade: number
    unidade: string
    custo: number
  }>
}

export default function Bases() {
  const { bases, loading, createBase, updateBase, deleteBase, desativarBase, reativarBase, verificarDependenciasBase, gerarProximoCodigo } = useBases()
  const { insumos } = useInsumos()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingBase, setViewingBase] = useState<BaseComInsumos | null>(null)
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    tipo_produto: 'peso' as 'peso' | 'unidade',
    quantidade_total: 0,
    unidade_produto: 'kg',
    rendimento: '',
    modo_preparo: '',
    observacoes: '',
    tempo_preparo: 0,
    ativo: true,
    custo_total_batelada: 0,
    foto: ''
  })

  const [insumosSelecionados, setInsumosSelecionados] = useState<Array<{
    id: string | number
    nome: string
    quantidade: number
    unidade: string
    custo: number
  }>>([])  

  const [editingBase, setEditingBase] = useState<BaseComInsumos | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [baseParaExcluir, setBaseParaExcluir] = useState<BaseComInsumos | null>(null)
  const [dependenciasBase, setDependenciasBase] = useState<{temDependencias: boolean, fichas: string[], insumos: string[]} | null>(null)

  // Função de upload de imagem
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      const file = files[0]
      
      if (file.type.startsWith('image/')) {
        try {
          // Mostrar loading
          toast({
            title: "Upload em andamento...",
            description: `Enviando ${file.name}...`,
          })

          // Fazer upload para Supabase Storage
          const result = await uploadAndCompressImage(file, 'bases')
          
          if (result.success && result.url) {
            // Adicionar URL da imagem ao formData
            setFormData(prev => ({ 
              ...prev, 
              foto: result.url! 
            }))
            
            toast({
              title: "Sucesso!",
              description: `Imagem ${file.name} enviada com sucesso!`,
            })
          } else {
            toast({
              title: "Erro no upload",
              description: result.error || "Erro desconhecido",
              variant: "destructive"
            })
          }
        } catch (error: any) {
          toast({
            title: "Erro no upload",
            description: `Erro ao enviar ${file.name}: ${error.message}`,
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Arquivo inválido",
          description: `${file.name} não é uma imagem válida`,
          variant: "destructive"
        })
      }
      
      // Limpar input
      event.target.value = ''
    }
  }

  // Função para remover foto
  const removePhoto = async () => {
    if (formData.foto && formData.foto.startsWith('http')) {
      try {
        const result = await deleteImageFromStorage(formData.foto)
        if (!result.success) {
          // Erro ao remover imagem do Storage
        }
      } catch (error) {
        // Erro ao remover imagem do Storage
      }
    }
    
    setFormData(prev => ({ ...prev, foto: '' }))
  }

  // Funções do formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      tipo_produto: 'peso',
      quantidade_total: 0,
      unidade_produto: 'kg',
      rendimento: '',
      modo_preparo: '',
      observacoes: '',
      tempo_preparo: 0,
      ativo: true,
      custo_total_batelada: 0,
      foto: ''
    })
    setInsumosSelecionados([])
    setEditingBase(null)
  }

  const formatarCodigo = (value: string): string => {
    const numeros = value.replace(/\D/g, '').slice(0, 3)
    return numeros ? `BAS${numeros}` : ''
  }

  const gerarCodigoAutomatico = () => {
    try {
      const novoCodigo = gerarProximoCodigo()
      setFormData(prev => ({ ...prev, codigo: novoCodigo }))
      toast({
        title: 'Código gerado',
        description: `Código ${novoCodigo} foi gerado automaticamente.`
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o código automaticamente.',
        variant: 'destructive'
      })
    }
  }

  const calcularCustoTotal = () => {
    const custoTotal = insumosSelecionados.reduce((acc, insumo) => {
      const custoItem = insumo.quantidade * insumo.custo
      return acc + custoItem
    }, 0)
    return custoTotal
  }

  const calcularCustoPorUnidade = () => {
    const custoTotal = calcularCustoTotal()
    if (formData.quantidade_total > 0) {
      return custoTotal / formData.quantidade_total
    }
    return 0
  }

  // Função para calcular quantidade produzida baseada nos insumos por peso
  const calcularQuantidadeProduzida = () => {
    const unidadesPorPeso = ['kg', 'litro', 'grama', 'ml', 'l', 'g']
    
    return insumosSelecionados.reduce((total, insumo) => {
      const insumoCompleto = insumos.find(i => i.id === insumo.id)
      if (insumoCompleto && unidadesPorPeso.includes(insumoCompleto.unidade_medida.toLowerCase())) {
        return total + insumo.quantidade
      }
      return total
    }, 0)
  }


  // Atualizar automaticamente o custo total da batelada baseado nos insumos
  useEffect(() => {
    const custoCalculado = calcularCustoTotal()
      setFormData(prev => ({
        ...prev,
        custo_total_batelada: custoCalculado
      }))
  }, [insumosSelecionados])

  // Atualizar automaticamente a quantidade produzida quando for tipo 'peso'
  useEffect(() => {
    if (formData.tipo_produto === 'peso') {
      const quantidadeCalculada = calcularQuantidadeProduzida()
      if (quantidadeCalculada > 0) {
        setFormData(prev => ({
          ...prev,
          quantidade_total: quantidadeCalculada
        }))
      }
    }
  }, [insumosSelecionados, formData.tipo_produto, insumos])


  const handleSave = async () => {
    const custoTotalCalculado = calcularCustoTotal()

    if (
      !formData.nome ||
      !formData.codigo ||
      !formData.tipo_produto ||
      !formData.quantidade_total ||
      !formData.unidade_produto ||
      !formData.modo_preparo
    ) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      })
      return
    }


    try {
      const baseData: Omit<BaseInsert, 'insumos'> = {
        nome: formData.nome,
        codigo: formData.codigo,
        tipo_produto: formData.tipo_produto,
        quantidade_total: formData.quantidade_total,
        unidade_produto: formData.unidade_produto,
        rendimento: formData.rendimento,
        custo_total_batelada: custoTotalCalculado,
        modo_preparo: formData.modo_preparo,
        observacoes: formData.observacoes,
        tempo_preparo: formData.tempo_preparo || 0,
        ativo: formData.ativo
      }
      
      const insumosData = insumosSelecionados.map(insumo => {
        const insumoCompleto = insumos.find(i => i.id === insumo.id)
        return {
          insumo_id: insumo.id,
          quantidade: insumo.quantidade,
          unidade: insumoCompleto?.unidade_medida || '',
          custo_unitario: insumo.custo
        }
      })

      
      if (editingBase) {
        await updateBase(editingBase.id, baseData, insumosData)
        toast({ title: 'Sucesso', description: 'Base atualizada com sucesso!' })
      } else {
        await createBase(baseData, insumosData)
        toast({ title: 'Sucesso', description: 'Base criada com sucesso!' })
      }
      
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar base. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (base: BaseComInsumos) => {
    setEditingBase(base)
    setFormData({
      nome: base.nome,
      codigo: base.codigo,
      tipo_produto: base.tipo_produto,
      quantidade_total: base.quantidade_total,
      unidade_produto: base.unidade_produto,
      rendimento: base.rendimento,
      modo_preparo: base.modo_preparo,
      observacoes: base.observacoes || '',
      tempo_preparo: base.tempo_preparo,
      ativo: base.ativo,
      custo_total_batelada: base.custo_total_batelada,
      foto: ''
    })
    setInsumosSelecionados(
      base.insumos.map(insumo => ({
        id: insumos.find(i => i.nome === insumo.nome)?.id || 0,
        nome: insumo.nome,
        quantidade: insumo.quantidade,
        unidade: insumo.unidade,
        custo: insumo.custo
      }))
    )
    setIsDialogOpen(true)
  }

  const handleDelete = async (baseId: string) => {
    try {
      const dependencias = await verificarDependenciasBase(baseId)
      setDependenciasBase(dependencias)
      setBaseParaExcluir(bases.find(b => b.id === baseId) || null)
      setIsDeleteModalOpen(true)
    } catch (error) {
      // Erro ao verificar dependências
    }
  }

  const confirmarExclusao = async () => {
    if (!baseParaExcluir) return
    
    try {
      // Se há dependências, não permitir exclusão física
      if (dependenciasBase?.temDependencias) {
        toast({
          title: "Erro",
          description: "Não é possível excluir uma base que possui dependências. Use a opção 'Desativar'.",
          variant: "destructive"
        })
        return
      }
      
      await deleteBase(baseParaExcluir.id)
      setIsDeleteModalOpen(false)
      setBaseParaExcluir(null)
      setDependenciasBase(null)
    } catch (error) {
      // Erro ao excluir base
    }
  }

  const confirmarDesativacao = async () => {
    if (!baseParaExcluir) return
    
    try {
      await desativarBase(baseParaExcluir.id)
      setIsDeleteModalOpen(false)
      setBaseParaExcluir(null)
      setDependenciasBase(null)
    } catch (error) {
      // Erro ao desativar base
    }
  }

  const handleAddInsumo = () => {
    setInsumosSelecionados(prev => [...prev, { 
      id: '',
      nome: '', 
      quantidade: 1, 
      unidade: '',
      custo: 0 
    }])
  }

  const handleRemoveInsumo = (index: number) => {
    setInsumosSelecionados(prev => prev.filter((_, i) => i !== index))
  }

  const handleInsumoChange = (index: number, field: string, value: any) => {
    const updated = [...insumosSelecionados]
    if (field === 'insumo_id') {
      const insumo = insumos.find(i => i.id === value)
      if (insumo) {
        const custoCalculado = insumo.preco_por_unidade * (insumo.fator_correcao || 1)
        
        updated[index] = {
          ...updated[index],
          id: insumo.id,
          nome: insumo.nome,
          custo: custoCalculado,
          unidade: insumo.unidade_medida
        }
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setInsumosSelecionados(updated)
  }

  const filteredBases = bases.filter(base => {
    const searchLower = searchTerm.toLowerCase()
    return (
      base.nome.toLowerCase().includes(searchLower) ||
      base.codigo.toLowerCase().includes(searchLower) ||
      base.tipo_produto.toLowerCase().includes(searchLower) ||
      base.unidade_produto.toLowerCase().includes(searchLower) ||
      (base.rendimento && base.rendimento.toLowerCase().includes(searchLower)) ||
      (base.observacoes && base.observacoes.toLowerCase().includes(searchLower))
    )
  })

  // Renderização
  return (
    <>
      <Layout>
      <div className="container mx-auto p-6 space-y-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bases/Produtos Intermediários</h1>
            <p className="text-muted-foreground">Gerencie suas receitas de bases e produtos intermediários</p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg"
          >
            📋 Filtrar
          </button>
          
          {/* Campo de Busca */}
          <div
            className={`${
              isMenuOpen ? 'block' : 'hidden'
            } md:block absolute top-16 left-4 right-4 bg-white p-4 rounded-lg shadow-xl z-40 md:static md:shadow-none`}
          >
            <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código, tipo, unidade, rendimento ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    📊 {filteredBases.length} de {bases.length} bases encontradas
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Base/Produto Intermediário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <DialogHeader className="bg-orange-500 text-white p-4 -m-6 mb-6 rounded-t-lg">
                    <DialogTitle className="flex items-center gap-2">
                      <Package2 className="h-5 w-5" /> Nova Base / Produto Intermediário
                    </DialogTitle>
                    <DialogDescription className="text-orange-100">
                      Cadastre bases (por kg ou litro) ou subprodutos (por unidade) para usar nas receitas dos pratos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código do Produto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => {
                          const codigoFormatado = formatarCodigo(e.target.value)
                          setFormData(prev => ({ ...prev, codigo: codigoFormatado }))
                        }}
                        placeholder="Ex: BAS003"
                        maxLength={6}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={gerarCodigoAutomatico}>
                        Auto
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Códigos são gerados automaticamente no formato BASXXX (001-999)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Produto Intermediário *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Licor de Frango Empanado"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Status</Label>
                  <RadioGroup
                    value={formData.ativo ? 'ativo' : 'inativo'}
                    onValueChange={value => {
                      setFormData(prev => ({ ...prev, ativo: value === 'ativo' }))
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="ativo" id="ativo" />
                      <Label htmlFor="ativo" className="font-medium text-green-600">
                        Ativo
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="inativo" id="inativo" />
                      <Label htmlFor="inativo" className="font-medium text-red-600">
                        Inativo
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">Bases inativas não aparecerão nas listas de seleção</p>
                </div>

                {/* Tipo de Produto */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Tipo de Produto *</Label>
                  <RadioGroup
                    value={formData.tipo_produto}
                    onValueChange={(value: 'peso' | 'unidade') => {
                      setFormData(prev => ({
                        ...prev,
                        tipo_produto: value,
                        unidade_produto: value === 'peso' ? 'kg' : 'unidades'
                      }))
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-md">
                      <RadioGroupItem value="peso" id="peso" />
                      <Label htmlFor="peso" className="font-medium">
                        Por Peso (kg/litro)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-md">
                      <RadioGroupItem value="unidade" id="unidade" />
                      <Label htmlFor="unidade" className="font-medium">
                        Por Unidade
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Quantidade e Custo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade_total">
                      Quantidade Produzida ({formData.unidade_produto})
                    </Label>
                    <Input
                      id="quantidade_total"
                      type="number"
                      step="0.001"
                      value={formData.quantidade_total}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, quantidade_total: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder={formData.tipo_produto === 'peso' ? '5.000' : '70.000'}
                      disabled={formData.tipo_produto === 'peso'}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.tipo_produto === 'peso' 
                        ? 'Calculado automaticamente pela soma dos insumos por peso (kg/litro)'
                        : 'Informe a quantidade que será produzida com esta receita'
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custoTotalBatelada">
                      Custo Total da Batelada (R$) *
                    </Label>
                    <Input
                      id="custoTotalBatelada"
                      type="number"
                      step="0.01"
                      value={formData.custo_total_batelada}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, custo_total_batelada: parseFloat(e.target.value) }))
                      }
                      placeholder="42.50"
                    />
                  </div>
                </div>

                {/* Custo Calculado */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Custo Calculado</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formData.tipo_produto === 'peso'
                      ? `R$ ${calcularCustoPorUnidade().toFixed(2)} por ${formData.unidade_produto || 'kg'}`
                      : `R$ ${calcularCustoPorUnidade().toFixed(2)} por unidade`}
                  </p>
                  <p className="text-sm text-blue-700">
                    Baseado no custo total dos insumos: R$ {calcularCustoTotal().toFixed(2)}
                  </p>
                </div>

                {/* Insumos Usados */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Insumos Usados na Produção</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddInsumo}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Insumo
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Insumo</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Custo do Insumo</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {insumosSelecionados.map((insumo, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <select
                                value={insumo.id}
                                onChange={e => {
                                  const value = e.target.value
                                  handleInsumoChange(index, 'insumo_id', value)
                                }}
                                className="w-full border border-input rounded-md p-2 bg-background"
                              >
                                <option value="">Selecione um insumo</option>
                                {insumos.map(i => (
                                  <option key={i.id} value={i.id}>
                                    {i.nome} ({i.codigo_insumo})
                                  </option>
                                ))}
                              </select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.001"
                                value={insumo.quantidade}
                                onChange={e => handleInsumoChange(index, 'quantidade', parseFloat(e.target.value))}
                                placeholder="0.250"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={insumos.find(i => i.id === insumo.id)?.unidade_medida || ''}
                                disabled
                                placeholder="kg"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={insumo.custo}
                                onChange={e => handleInsumoChange(index, 'custo', parseFloat(e.target.value))}
                                placeholder="3.50"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveInsumo(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Modo de Preparo */}
                <div className="space-y-2">
                  <Label>Modo de Preparo *</Label>
                  <Textarea
                    value={formData.modo_preparo}
                    onChange={e => setFormData(prev => ({ ...prev, modo_preparo: e.target.value }))}
                    placeholder="Descreva o passo a passo..."
                    rows={4}
                  />
                </div>

                {/* Foto */}
                <div className="space-y-2">
                        <Label>
                    <ImageIcon className="inline h-4 w-4 mr-2" />
                    Foto da Base/Produto
                  </Label>
                        
                        {formData.foto ? (
                          <div className="space-y-2">
                            <div className="relative">
                              <img 
                                src={formData.foto} 
                                alt="Foto da base" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removePhoto}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-green-600">
                              ✅ Imagem carregada com sucesso
                            </p>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="photo-upload-base"
                            />
                            <label htmlFor="photo-upload-base" className="cursor-pointer">
                              <div className="flex flex-col items-center gap-2">
                                <Camera className="h-8 w-8 text-gray-400" />
                                <p className="text-sm text-gray-500">Clique para adicionar foto</p>
                                <p className="text-xs text-gray-400">Ou arraste uma imagem</p>
                              </div>
                            </label>
                          </div>
                        )}
                        
                  <p className="text-xs text-muted-foreground">
                          💡 Upload direto para o Supabase Storage - máximo 5MB
                  </p>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Informações adicionais..."
                    rows={2}
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                      {editingBase ? 'Atualizar' : 'Salvar'} Base/Produto
                    </Button>
                  </div>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
            </div>
          </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Bases</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{bases.length}</div>
              <p className="text-xs text-muted-foreground">Bases e produtos intermediários cadastrados</p>
            </CardContent>
          </Card>
        </div>


        {/* Tabela de Bases */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bases/Produtos Intermediários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Foto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Rendimento</TableHead>
                    <TableHead>Custo por Unidade</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBases.map(base => (
                    <TableRow key={base.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{base.codigo}</TableCell>
                      <TableCell>{base.nome}</TableCell>
                      <TableCell>
                        <Badge
                          variant={base.tipo_produto === 'peso' ? 'default' : 'secondary'}
                          className={base.tipo_produto === 'peso' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                        >
                          {base.tipo_produto === 'peso' ? 'Por Peso' : 'Por Unidade'}
                        </Badge>
                      </TableCell>
                      <TableCell>{base.rendimento}</TableCell>
                      <TableCell>
                        R${' '}
                        {base.quantidade_total && base.custo_total_batelada
                          ? (base.custo_total_batelada / base.quantidade_total).toFixed(2)
                          : '0.00'}
                      </TableCell>
                      <TableCell>R$ {base.custo_total_batelada?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(base)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(base)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(base.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredBases.map(base => (
                <Card key={base.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg whitespace-normal">{base.nome}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{base.codigo}</Badge>
                          <Badge
                            variant={base.tipo_produto === 'peso' ? 'default' : 'secondary'}
                            className={base.tipo_produto === 'peso' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                          >
                            {base.tipo_produto === 'peso' ? 'Por Peso' : 'Por Unidade'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="min-h-[48px] min-w-[48px]" onClick={() => handleEdit(base)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="min-h-[48px] min-w-[48px]" onClick={() => handleEdit(base)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="min-h-[48px] min-w-[48px]" onClick={() => handleDelete(base.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground block">Rend.</span>
                        <p className="font-medium">{base.rendimento || 'N/A'}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground block">Custo por Und.</span>
                        <p className="font-medium">
                          R$ {base.quantidade_total && base.custo_total_batelada
                            ? (base.custo_total_batelada / base.quantidade_total).toFixed(2)
                            : '0.00'}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground block">Custo Total</span>
                        <p className="font-medium">R$ {base.custo_total_batelada?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground block">Foto</span>
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>

    {/* Modal de Confirmação de Exclusão */}
    <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <AlertDialogContent className="z-50">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            {baseParaExcluir && (
              <div className="space-y-4">
                <p>
                  Você está prestes a excluir a base <strong>"{baseParaExcluir.nome}"</strong>.
                </p>
                
                {dependenciasBase?.temDependencias && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-medium text-yellow-800 mb-2">
                      ⚠️ Esta base está sendo usada em:
                    </p>
                    {dependenciasBase.fichas.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-yellow-700">Fichas técnicas:</p>
                        <ul className="text-sm text-yellow-600 ml-4">
                          {dependenciasBase.fichas.map((ficha, index) => (
                            <li key={index}>• {ficha}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dependenciasBase.insumos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Insumos associados:</p>
                        <ul className="text-sm text-yellow-600 ml-4">
                          {dependenciasBase.insumos.map((insumo, index) => (
                            <li key={index}>• {insumo}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-gray-600">
                  {dependenciasBase?.temDependencias 
                    ? "Escolha uma das opções abaixo:"
                    : "Esta ação não pode ser desfeita."
                  }
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {dependenciasBase?.temDependencias ? (
            <>
              <Button variant="outline" onClick={confirmarDesativacao}>
                Desativar Base
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmarExclusao}
                disabled={true}
                title="Não é possível excluir uma base com dependências"
              >
                Excluir Permanentemente
              </Button>
            </>
          ) : (
            <AlertDialogAction onClick={confirmarExclusao} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}