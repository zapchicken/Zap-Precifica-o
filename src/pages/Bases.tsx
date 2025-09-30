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

  // Abrir diálogo para criar nova base
  const handleCreateNew = () => {
    resetForm()
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
        insumo_id: insumo.insumo_id,
        quantidade: insumo.quantidade,
        unidade: insumo.unidade,
        custo: insumo.custo
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBase ? 'Editar Base' : 'Nova Base'}
              </DialogTitle>
              <DialogDescription>
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
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Código da base"
                  />
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

              {/* Insumos Selecionados */}
              <div>
                <Label>Insumos Selecionados</Label>
                <div className="space-y-2 mt-2">
                  {insumosSelecionados.map((insumo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{insumo.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {insumo.quantidade} {insumo.unidade} × R$ {insumo.custo.toFixed(2)} = R$ {(insumo.quantidade * insumo.custo).toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveInsumo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
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