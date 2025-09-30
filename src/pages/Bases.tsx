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
  foto?: string
  insumos: Array<{
    id?: string
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

  const [insumosSelecionados, setInsumosSelecionados] = useState<Array<{
    insumo_id: number
    nome: string
    quantidade: number
    unidade: string
    custo: number
    tipo: 'insumo'
  }>>([])

  const [editingBase, setEditingBase] = useState<BaseComInsumos | null>(null)
  const [deleteBaseId, setDeleteBaseId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [novoInsumo, setNovoInsumo] = useState({
    tipo: 'insumo',
    codigo: '',
    nome: '',
    quantidade: 0,
    unidade: '',
    custo: 0
  })
  const [insumosSugeridos, setInsumosSugeridos] = useState<any[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

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
      insumo_id: parseInt(insumo.id || '0'),
      nome: insumo.nome,
      quantidade: insumo.quantidade,
      unidade: insumo.unidade,
      custo: insumo.custo,
      tipo: 'insumo' as const
    }))
    
    setInsumosSelecionados(insumosCarregados)
    setIsDialogOpen(true)
  }

  // Adicionar insumo
  const handleAddInsumo = (insumo: any) => {
    const custoCalculado = insumo.quantidade * insumo.custo * (insumo.fator_correcao || 1)
    
    setInsumosSelecionados(prev => [...prev, {
      insumo_id: insumo.id,
      nome: insumo.nome,
      quantidade: insumo.quantidade,
      unidade: insumo.unidade,
      custo: custoCalculado,
      tipo: 'insumo'
    }])
  }

  // Buscar insumos para autocomplete
  const buscarInsumos = (termo: string) => {
    if (termo.length < 1) {
      setInsumosSugeridos([])
      setMostrarSugestoes(false)
      return
    }

    const sugestoes = insumos.filter(insumo =>
      insumo.nome.toLowerCase().includes(termo.toLowerCase()) ||
      (insumo.codigo_insumo && insumo.codigo_insumo.toLowerCase().includes(termo.toLowerCase()))
    ).slice(0, 10) // Aumentar para 10 sugestões como na foto

    setInsumosSugeridos(sugestoes)
    setMostrarSugestoes(sugestoes.length > 0)
  }

  // Selecionar insumo das sugestões
  const selecionarInsumo = (insumo: any) => {
    setNovoInsumo(prev => ({
      ...prev,
      nome: insumo.nome,
      codigo: insumo.codigo_insumo || '',
      unidade: insumo.unidade_medida,
      custo: insumo.preco_por_unidade * (insumo.fator_correcao || 1)
    }))
    setMostrarSugestoes(false)
    setInsumosSugeridos([])
  }

  // Adicionar insumo da tabela
  const handleAdicionarInsumoTabela = () => {
    // Verificar se há insumos disponíveis
    if (insumos.length === 0) {
      toast({
        title: 'Nenhum insumo cadastrado',
        description: 'Você será redirecionado para a página de Insumos para cadastrar novos insumos.',
        variant: 'destructive'
      })
      // Navegar para a página de Insumos
      navigate('/insumos')
      return
    }

    if (!novoInsumo.nome || novoInsumo.quantidade <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha o nome e quantidade do insumo',
        variant: 'destructive'
      })
      return
    }

    // Buscar insumo pelo nome
    const insumoEncontrado = insumos.find(i => 
      i.nome.toLowerCase().includes(novoInsumo.nome.toLowerCase())
    )

    if (!insumoEncontrado) {
      toast({
        title: 'Erro',
        description: 'Insumo não encontrado',
        variant: 'destructive'
      })
      return
    }

    const insumoParaAdicionar = {
      insumo_id: insumoEncontrado.id,
      nome: insumoEncontrado.nome,
      quantidade: novoInsumo.quantidade,
      unidade: novoInsumo.unidade || insumoEncontrado.unidade_medida,
      custo: insumoEncontrado.preco_por_unidade * (insumoEncontrado.fator_correcao || 1),
      tipo: 'insumo' as const
    }

    handleAddInsumo(insumoParaAdicionar)
    
    // Limpar campos
    setNovoInsumo({
      tipo: 'insumo',
      codigo: '',
      nome: '',
      quantidade: 0,
      unidade: '',
      custo: 0
    })
  }

  // Remover insumo
  const handleRemoveInsumo = (index: number) => {
    setInsumosSelecionados(prev => prev.filter((_, i) => i !== index))
  }

  // Calcular custo total
  const calcularCustoTotal = () => {
    return insumosSelecionados.reduce((total, insumo) => total + (insumo.quantidade * insumo.custo), 0)
  }

  // Salvar base
  const handleSave = async () => {
    try {
      const insumosData = insumosSelecionados.map(insumo => ({
        insumo_id: insumo.insumo_id.toString(),
        quantidade: Number(insumo.quantidade),
        unidade: insumo.unidade,
        custo: Number(insumo.custo)
      }))

      const baseData = {
        nome: formData.nome,
        codigo: formData.codigo,
        tipo_produto: formData.tipo_produto,
        quantidade_total: formData.quantidade_total,
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

      if (editingBase) {
        await updateBase(editingBase.id, baseData, insumosData)
      } else {
        await createBase(baseData, insumosData)
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar base:', error)
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
                        {base.quantidade_total} {base.unidade_produto}
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
                  />
                </div>
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                      placeholder="Código da base"
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
                    step="0.01"
                    value={formData.quantidade_total}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade_total: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="unidade_produto">Unidade *</Label>
                  <Input
                    id="unidade_produto"
                    value={formData.unidade_produto}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidade_produto: e.target.value }))}
                    placeholder="kg, unidade, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rendimento">Rendimento</Label>
                  <Input
                    id="rendimento"
                    value={formData.rendimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, rendimento: e.target.value }))}
                    placeholder="Ex: 10 porções"
                  />
                </div>
                <div>
                  <Label htmlFor="tempo_preparo">Tempo de Preparo (min)</Label>
                  <Input
                    id="tempo_preparo"
                    type="number"
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
                    value={formData.custo_total_batelada}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      custo_total_batelada: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

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
                      onClick={handleAdicionarInsumoTabela}
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
                  <div className="grid grid-cols-7 gap-4 p-3 bg-muted border-b">
                    <div className="text-sm font-medium">Tipo</div>
                    <div className="text-sm font-medium">Código</div>
                    <div className="text-sm font-medium">Nome</div>
                    <div className="text-sm font-medium">Qtd.</div>
                    <div className="text-sm font-medium">Unidade</div>
                    <div className="text-sm font-medium">Custo (R$)</div>
                    <div className="text-sm font-medium">Ações</div>
                  </div>

                  {/* Linha para Adicionar Novo Insumo */}
                  <div className="grid grid-cols-7 gap-4 p-3 bg-muted/30">
                    <div>
                      <Input
                        value={novoInsumo.tipo}
                        onChange={(e) => setNovoInsumo(prev => ({ ...prev, tipo: e.target.value }))}
                        placeholder="Insumo"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        value={novoInsumo.codigo}
                        onChange={(e) => setNovoInsumo(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Código auto"
                        className="text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        value={novoInsumo.nome}
                        onChange={(e) => {
                          setNovoInsumo(prev => ({ ...prev, nome: e.target.value }))
                          buscarInsumos(e.target.value)
                        }}
                        onFocus={() => {
                          // Mostrar sugestões ao focar no campo
                          if (insumos.length > 0) {
                            setInsumosSugeridos(insumos.slice(0, 10))
                            setMostrarSugestoes(true)
                          }
                        }}
                        onBlur={() => {
                          // Delay para permitir clique nas sugestões
                          setTimeout(() => setMostrarSugestoes(false), 200)
                        }}
                        placeholder="Buscar insumo"
                        className="text-sm border-orange-500"
                      />
                      
                      {/* Dropdown de Sugestões */}
                      {mostrarSugestoes && insumosSugeridos.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {/* Header do dropdown */}
                          <div className="p-2 border-b bg-gray-50">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Search className="h-4 w-4" />
                              Buscar insumo
                            </div>
                          </div>
                          
                          {/* Lista de sugestões */}
                          <div className="py-1">
                            {insumosSugeridos.map((insumo, index) => (
                              <div
                                key={insumo.id}
                                className="px-3 py-2 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => selecionarInsumo(insumo)}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">{insumo.nome}</div>
                                    {insumo.codigo_insumo && (
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {insumo.codigo_insumo}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                      R$ {insumo.preco_por_unidade.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      / {insumo.unidade_medida}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.001"
                        value={novoInsumo.quantidade}
                        onChange={(e) => setNovoInsumo(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.000"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        value={novoInsumo.unidade}
                        onChange={(e) => setNovoInsumo(prev => ({ ...prev, unidade: e.target.value }))}
                        placeholder="Unidade"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        value={novoInsumo.custo}
                        onChange={(e) => setNovoInsumo(prev => ({ ...prev, custo: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNovoInsumo({
                          tipo: 'insumo',
                          codigo: '',
                          nome: '',
                          quantidade: 0,
                          unidade: '',
                          custo: 0
                        })}
                        className="border-orange-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Insumos Selecionados */}
                  {insumosSelecionados.map((insumo, index) => (
                    <div key={index} className="grid grid-cols-7 gap-4 p-3 border-b">
                      <div className="text-sm">{insumo.tipo}</div>
                      <div className="text-sm">-</div>
                      <div className="text-sm font-medium">{insumo.nome}</div>
                      <div className="text-sm">{insumo.quantidade}</div>
                      <div className="text-sm">{insumo.unidade}</div>
                      <div className="text-sm">R$ {insumo.custo.toFixed(2)}</div>
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Base</DialogTitle>
            </DialogHeader>

            {viewingBase && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm">{viewingBase.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Código</Label>
                    <p className="text-sm">{viewingBase.codigo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p className="text-sm">{viewingBase.tipo_produto === 'peso' ? 'Peso' : 'Unidade'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantidade</Label>
                    <p className="text-sm">{viewingBase.quantidade_total} {viewingBase.unidade_produto}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custo Total</Label>
                    <p className="text-sm">R$ {viewingBase.custo_total_batelada.toFixed(2)}</p>
                  </div>
                </div>

                {viewingBase.insumos.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Insumos</Label>
                    <div className="space-y-2 mt-2">
                      {viewingBase.insumos.map((insumo, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span>{insumo.nome}</span>
                          <span>{insumo.quantidade} {insumo.unidade} × R$ {insumo.custo.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>


        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
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