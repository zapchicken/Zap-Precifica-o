import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { InsumoCombobox } from '../components/InsumoCombobox'
import { supabase } from '@/lib/supabase'
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
    insumo_id: string
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
  foto?: string
  insumos: Array<{
    id?: string
    insumo_id: string
    nome: string
    codigo?: string
    quantidade: number
    unidade: string
    custo: number
    tipo?: 'insumo'
  }>
}

export default function Bases() {
  const navigate = useNavigate()
  const { bases, loading, createBase, updateBase, deleteBase } = useBases()
  const { insumos } = useInsumos()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingBase, setViewingBase] = useState<BaseComInsumos | null>(null)
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Estados do formulário
  const [formData, setFormData] = useState<BaseInsert>({
    nome: '',
    codigo: '',
    tipo_produto: 'peso',
    quantidade_total: 0,
    unidade_produto: 'kg',
    rendimento: '',
    custo_total_batelada: 0,
    modo_preparo: '',
    observacoes: '',
    tempo_preparo: 0,
    ativo: true,
    insumos: []
  })


  const [editingBase, setEditingBase] = useState<BaseComInsumos | null>(null)
  const [deleteBaseId, setDeleteBaseId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [insumosSelecionados, setInsumosSelecionados] = useState<Array<{
    insumo_id: string
    nome: string
    quantidade: number
    unidade: string
    custo: number
    tipo: 'insumo'
  }>>([])

  // Filtrar bases
  const filteredBases = bases.filter(base =>
    base.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    base.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      tipo_produto: 'peso',
      quantidade_total: 0,
      unidade_produto: 'kg',
      rendimento: '',
      custo_total_batelada: 0,
      modo_preparo: '',
      observacoes: '',
      tempo_preparo: 0,
      ativo: true,
      insumos: []
    })
    setInsumosSelecionados([])
    setEditingBase(null)
  }

  // Gerar código automático sequencial
  const gerarCodigoAutomatico = async () => {
    try {
      // Buscar o último código usado
      const { data: ultimaBase, error } = await supabase
        .from('bases')
        .select('codigo')
        .like('codigo', 'BAS%')
        .order('codigo', { ascending: false })
        .limit(1)
        .single()

      let proximoNumero = 1
      
      if (ultimaBase && !error) {
        // Extrair número do último código (ex: BAS003 -> 3)
        const match = ultimaBase.codigo.match(/BAS(\d+)/)
        if (match) {
          proximoNumero = parseInt(match[1]) + 1
        }
      }

      // Gerar código com 3 dígitos (BAS001, BAS002, etc.)
      const codigo = `BAS${proximoNumero.toString().padStart(3, '0')}`
      setFormData(prev => ({ ...prev, codigo }))
    } catch (err) {
      console.error('Erro ao gerar código:', err)
      // Fallback para timestamp se houver erro
      const timestamp = Date.now().toString().slice(-6)
      const codigo = `BAS${timestamp}`
      setFormData(prev => ({ ...prev, codigo }))
    }
  }

  // Abrir diálogo para criar nova base
  const handleCreateNew = () => {
    resetForm()
    gerarCodigoAutomatico() // Gerar código automaticamente
    setIsDialogOpen(true)
  }

  // Abrir diálogo para editar base
  const handleEdit = (base: BaseComInsumos) => {
    setEditingBase(base)
    setFormData({
      nome: base.nome,
      codigo: base.codigo,
      tipo_produto: base.tipo_produto,
      quantidade_total: base.quantidade_total,
      unidade_produto: base.unidade_produto,
      rendimento: base.rendimento,
      custo_total_batelada: base.custo_total_batelada,
      modo_preparo: base.modo_preparo,
      observacoes: base.observacoes || '',
      tempo_preparo: base.tempo_preparo,
      ativo: base.ativo,
      insumos: []
    })
    
    // Carregar insumos selecionados
    const insumosCarregados = base.insumos.map(insumo => ({
      insumo_id: insumo.insumo_id || '',
      nome: insumo.nome,
      quantidade: insumo.quantidade,
      unidade: insumo.unidade,
      custo: insumo.custo,
      tipo: 'insumo' as const
    }))
    
    setInsumosSelecionados(insumosCarregados)
    setIsDialogOpen(true)
  }

  // Adicionar insumo (função não usada mais)
  const handleAddInsumo = (insumo: any) => {
    // Esta função não é mais usada - insumos são adicionados diretamente na tabela
  }


  // Remover insumo
  const handleRemoveInsumo = (index: number) => {
    setInsumosSelecionados(prev => prev.filter((_, i) => i !== index))
  }

  // Calcular custo total
  const calcularCustoTotal = () => {
    return insumosSelecionados.reduce((total, insumo) => total + (insumo.quantidade * insumo.custo), 0)
  }

  // Calcular quantidade total automaticamente
  const calcularQuantidadeTotal = () => {
    return insumosSelecionados.reduce((total, insumo) => total + insumo.quantidade, 0)
  }

  // Atualizar quantidade total automaticamente quando insumos mudarem
  useEffect(() => {
    const quantidadeTotal = calcularQuantidadeTotal()
    setFormData(prev => ({ ...prev, quantidade_total: quantidadeTotal }))
  }, [insumosSelecionados])



  // Validações obrigatórias
  const validarFormulario = () => {
    const erros: string[] = []

    // Validação de campos obrigatórios
    if (!formData.nome.trim()) {
      erros.push('Nome é obrigatório')
    }
    if (!formData.codigo.trim()) {
      erros.push('Código é obrigatório')
    }
    if (!formData.unidade_produto.trim()) {
      erros.push('Unidade é obrigatória')
    }
    if (formData.rendimento && Number(formData.rendimento) <= 0) {
      erros.push('Rendimento deve ser maior que zero')
    }

    // Validação de insumos
    const insumosValidos = insumosSelecionados.filter(insumo => 
      insumo.insumo_id && insumo.insumo_id.trim() !== ''
    )
    
    if (insumosValidos.length === 0) {
      erros.push('Adicione pelo menos um insumo')
    }

    // Validação de quantidades
    for (const insumo of insumosValidos) {
      if (insumo.quantidade <= 0) {
        erros.push(`Quantidade do insumo "${insumo.nome}" deve ser maior que zero`)
      }
      if (insumo.custo < 0) {
        erros.push(`Custo do insumo "${insumo.nome}" não pode ser negativo`)
      }
    }

    return erros
  }

  // Salvar base
  const handleSave = async () => {
    try {
      console.log('Iniciando salvamento da base...')
      console.log('FormData:', formData)
      console.log('Insumos selecionados:', insumosSelecionados)
      
      // Validar formulário
      const erros = validarFormulario()
      if (erros.length > 0) {
        console.log('Erros de validação:', erros)
        toast({
          title: 'Erro de Validação',
          description: erros.join(', '),
          variant: 'destructive'
        })
        return
      }

      const insumosData = insumosSelecionados
        .filter(insumo => insumo.insumo_id && insumo.insumo_id.trim() !== '')
        .map(insumo => ({
          insumo_id: insumo.insumo_id.toString(),
          quantidade: Number(insumo.quantidade),
          unidade: insumo.unidade,
          custo: Number(insumo.custo)
        }))

      console.log('Insumos filtrados:', insumosData)

      const baseData = {
        nome: formData.nome,
        codigo: formData.codigo,
        tipo_produto: formData.tipo_produto,
        quantidade_total: calcularQuantidadeTotal(),
        unidade_produto: formData.unidade_produto,
        rendimento: formData.rendimento,
        custo_total_batelada: calcularCustoTotal(),
        modo_preparo: formData.modo_preparo,
        observacoes: formData.observacoes || null,
        tempo_preparo: formData.tempo_preparo,
        ativo: formData.ativo,
        foto: null,
        data_ficha: new Date().toISOString().split('T')[0]
      }

      console.log('Base data:', baseData)

      if (editingBase) {
        console.log('Atualizando base existente...')
        await updateBase(editingBase.id, baseData, insumosData)
      } else {
        console.log('Criando nova base...')
        await createBase(baseData, insumosData)
      }

      resetForm()
      setIsDialogOpen(false)
      toast({
        title: 'Sucesso',
        description: editingBase ? 'Base atualizada com sucesso!' : 'Base criada com sucesso!',
        variant: 'default'
      })
    } catch (error) {
      console.error('Erro ao salvar base:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar base. Verifique os dados e tente novamente.',
        variant: 'destructive'
      })
    }
  }

  // Deletar base
  const handleDelete = async (id: string) => {
    try {
      await deleteBase(id)
      setIsDeleteDialogOpen(false)
      setDeleteBaseId(null)
    } catch (error) {
      console.error('Erro ao deletar base:', error)
    }
  }

  // Visualizar base
  const handleView = (base: BaseComInsumos) => {
    setViewingBase(base)
    setIsViewDialogOpen(true)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bases</h1>
            <p className="text-muted-foreground">
              Gerencie suas bases e produtos intermediários
            </p>
          </div>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Base
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar bases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Bases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              Bases ({filteredBases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBases.map((base) => (
                    <TableRow key={base.id}>
                      <TableCell className="font-medium">{base.codigo}</TableCell>
                      <TableCell>{base.nome}</TableCell>
                      <TableCell>
                        <Badge variant={base.tipo_produto === 'peso' ? 'default' : 'secondary'}>
                          {base.tipo_produto === 'peso' ? 'Peso' : 'Unidade'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {base.quantidade_total.toFixed(3)} {base.unidade_produto}
                      </TableCell>
                      <TableCell>
                        R$ {base.custo_total_batelada.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={base.ativo ? 'default' : 'destructive'}>
                          {base.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(base)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(base)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteBaseId(base.id)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog para Criar/Editar Base */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>
                {editingBase ? 'Editar Base' : 'Nova Base'}
              </DialogTitle>
              <DialogDescription id="dialog-description">
                {editingBase ? 'Edite as informações da base' : 'Crie uma nova base'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome da base"
                    className={!formData.nome.trim() ? 'border-red-500' : ''}
                  />
                  {!formData.nome.trim() && (
                    <p className="text-xs text-red-500 mt-1">Nome é obrigatório</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <div className="flex gap-2">
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Código da base"
                    className={!formData.codigo.trim() ? 'border-red-500' : ''}
                  />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={gerarCodigoAutomatico}
                      className="whitespace-nowrap"
                    >
                      Gerar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tipo_produto">Tipo de Produto *</Label>
                  <RadioGroup
                    value={formData.tipo_produto}
                    onValueChange={(value: 'peso' | 'unidade') => 
                      setFormData(prev => ({ ...prev, tipo_produto: value }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="peso" id="peso" />
                      <Label htmlFor="peso">Peso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unidade" id="unidade" />
                      <Label htmlFor="unidade">Unidade</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="quantidade_total">Quantidade Total *</Label>
                  <Input
                    id="quantidade_total"
                    type="number"
                    step="0.001"
                    value={calcularQuantidadeTotal().toFixed(3)}
                    disabled
                    placeholder="Calculado automaticamente"
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Soma automática das quantidades dos insumos
                  </p>
                </div>
                <div>
                  <Label htmlFor="unidade_produto">Unidade *</Label>
                  <Input
                    id="unidade_produto"
                    value={formData.unidade_produto}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidade_produto: e.target.value }))}
                    placeholder="kg, unidade, etc."
                    className={!formData.unidade_produto.trim() ? 'border-red-500' : ''}
                  />
                  {!formData.unidade_produto.trim() && (
                    <p className="text-xs text-red-500 mt-1">Unidade é obrigatória</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rendimento">Rendimento</Label>
                  <Input
                    id="rendimento"
                    type="number"
                    step="0.001"
                    value={formData.rendimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, rendimento: e.target.value }))}
                    placeholder="Ex: 10.000"
                  />
                </div>
                <div>
                  <Label htmlFor="tempo_preparo">Tempo de Preparo (min)</Label>
                  <Input
                    id="tempo_preparo"
                    type="number"
                    step="1"
                    value={formData.tempo_preparo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempo_preparo: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Custos */}
              <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="custo_unitario">Custo Unitário (R$)</Label>
                  <Input
                    id="custo_unitario"
                    type="number"
                    step="0.01"
                    value={formData.quantidade_total > 0 ? (formData.custo_total_batelada / formData.quantidade_total).toFixed(2) : '0.00'}
                    onChange={(e) => {
                      const custoUnitario = parseFloat(e.target.value) || 0
                      const custoBatelada = custoUnitario * formData.quantidade_total
                      setFormData(prev => ({ 
                        ...prev, 
                        custo_total_batelada: custoBatelada 
                      }))
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="custo_batelada">Custo da Batelada (R$)</Label>
                  <Input
                    id="custo_batelada"
                    type="number"
                    step="0.01"
                    value={calcularCustoTotal().toFixed(2)}
                    disabled
                    placeholder="Calculado automaticamente"
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Soma automática dos custos dos insumos
                  </p>
                </div>
              </div>


              {/* Insumos */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold">Insumos</Label>
                  <div className="flex gap-2">
                    {insumos.length === 0 && (
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => navigate('/insumos')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Cadastrar Insumos
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Adicionar nova linha vazia na tabela
                        setInsumosSelecionados(prev => [...prev, {
                          insumo_id: '',
                          nome: '',
                          quantidade: 0,
                          unidade: '',
                          custo: 0,
                          tipo: 'insumo' as const
                        }])
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Insumo
                    </Button>
                  </div>
                </div>

                {/* Mensagem quando não há insumos */}
                {insumos.length === 0 && (
                  <div className="border rounded-lg p-6 text-center bg-muted/30">
                    <div className="text-muted-foreground mb-4">
                      <Package2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-lg font-medium">Nenhum insumo cadastrado</p>
                      <p className="text-sm">Cadastre insumos primeiro para poder adicioná-los às bases</p>
                    </div>
                    <Button
                      onClick={() => navigate('/insumos')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ir para Página de Insumos
                    </Button>
                  </div>
                )}

                {/* Tabela de Insumos */}
                {insumos.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    {/* Cabeçalho da Tabela */}
                    <div className="grid grid-cols-6 gap-4 p-3 bg-muted border-b">
                      <div className="text-sm font-medium">Código</div>
                      <div className="text-sm font-medium col-span-2">Nome</div>
                      <div className="text-sm font-medium">Qtd.</div>
                      <div className="text-sm font-medium">Unidade</div>
                      <div className="text-sm font-medium">Custo (R$)</div>
                      <div className="text-sm font-medium">Ações</div>
                    </div>


                    {/* Insumos Selecionados */}
                    {insumosSelecionados.map((insumo, index) => (
                      <div key={`insumo-${index}`} className="grid grid-cols-6 gap-4 p-3 border-b">
                        <div>
                          <Input
                            value={insumo.insumo_id ? insumos.find(i => i.id.toString() === insumo.insumo_id)?.codigo_insumo || '---' : ''}
                            onChange={(e) => {
                              // Campo código não é editável - preenchido automaticamente
                            }}
                            className="text-sm"
                            placeholder="Código"
                            disabled
                          />
                        </div>
                        <div className="col-span-2">
                          <InsumoCombobox
                            items={insumos.map(item => ({
                              ...item,
                              fornecedor: item.fornecedor_id,
                              nome: item.nome_comercial || item.nome || 'Sem nome',
                              codigo: item.codigo_insumo || '---'
                            }))}
                            selectedLabel={insumo.nome}
                            onSelect={(item) => {
                              const novosInsumos = [...insumosSelecionados]
                              // CALCULAR CUSTO UNITÁRIO CORRETO: preço × fator de correção
                              const custoUnitario = parseFloat(item.preco_por_unidade?.toString() || '0') * parseFloat(item.fator_correcao?.toString() || '1')
                              
                              novosInsumos[index] = {
                                ...novosInsumos[index],
                                insumo_id: item.id.toString(),
                                nome: item.nome || '',
                                unidade: item.unidade_medida || '',
                                custo: custoUnitario,
                                tipo: 'insumo' as const
                              }
                              setInsumosSelecionados(novosInsumos)
                            }}
                            placeholder="Buscar insumo"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            step="0.001"
                            value={insumo.quantidade}
                            onChange={(e) => {
                              const novosInsumos = [...insumosSelecionados]
                              novosInsumos[index].quantidade = parseFloat(e.target.value) || 0
                              setInsumosSelecionados(novosInsumos)
                            }}
                            className="text-sm"
                            placeholder="0.000"
                            min="0"
                          />
                        </div>
                        <div>
                          <Input
                            value={insumo.unidade}
                            onChange={(e) => {
                              const novosInsumos = [...insumosSelecionados]
                              novosInsumos[index].unidade = e.target.value
                              setInsumosSelecionados(novosInsumos)
                            }}
                            className="text-sm"
                            placeholder="Unidade"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            step="0.01"
                            value={insumo.custo}
                            onChange={(e) => {
                              const novosInsumos = [...insumosSelecionados]
                              novosInsumos[index].custo = parseFloat(e.target.value) || 0
                              setInsumosSelecionados(novosInsumos)
                            }}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveInsumo(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {insumosSelecionados.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Custo Total:</span>
                      <span className="text-lg font-bold">R$ {calcularCustoTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modo de Preparo e Observações */}
              <div>
                <Label htmlFor="modo_preparo">Modo de Preparo</Label>
                <Textarea
                  id="modo_preparo"
                  value={formData.modo_preparo}
                  onChange={(e) => setFormData(prev => ({ ...prev, modo_preparo: e.target.value }))}
                  placeholder="Descreva o modo de preparo..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingBase ? 'Atualizar' : 'Criar'} Base
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para Visualizar Base */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl" aria-describedby="view-dialog-description">
            <DialogHeader>
              <DialogTitle>Detalhes da Base</DialogTitle>
              <DialogDescription id="view-dialog-description">
                Visualize os detalhes da base selecionada
              </DialogDescription>
            </DialogHeader>

            {viewingBase && (
              <div className="space-y-6">
                {/* Informações Principais */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código PDV</Label>
                    <p className="text-base font-semibold">{viewingBase.codigo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nome do Produto</Label>
                    <p className="text-base font-semibold">{viewingBase.nome}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                    <p className="text-base">{viewingBase.tipo_produto === 'peso' ? 'PESO' : 'UNIDADE'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data da Ficha</Label>
                    <p className="text-base">{new Date(viewingBase.data_ficha).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tempo de Preparo</Label>
                    <p className="text-base">{viewingBase.tempo_preparo} min</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Rendimento</Label>
                    <p className="text-base">{viewingBase.rendimento} porções</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Custo Total</Label>
                  <p className="text-2xl font-bold text-green-600">R$ {viewingBase.custo_total_batelada.toFixed(2)}</p>
                </div>

                {/* Ingredientes e Materiais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ingredientes e Materiais</h3>
                  
                  {/* Insumos */}
                  {viewingBase.insumos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 text-sm">📦</span>
                        </div>
                        <Label className="text-base font-medium text-green-600">Insumos</Label>
                      </div>
                      <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                        {viewingBase.insumos.map((insumo, index) => {
                          const insumoCompleto = insumos.find(i => i.id === insumo.insumo_id)
                          return (
                            <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                              <span className="text-sm font-medium">{insumo.nome}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">{insumo.quantidade.toFixed(3)} {insumo.unidade}</span>
                                <span className="text-sm font-semibold text-green-600">R$ {insumo.custo.toFixed(2)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>


        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent aria-describedby="delete-dialog-description">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription id="delete-dialog-description">
                Tem certeza que deseja excluir esta base? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteBaseId && handleDelete(deleteBaseId)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  )
}

