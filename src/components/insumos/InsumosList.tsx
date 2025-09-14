import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Search, Package, Filter } from 'lucide-react'
import { useInsumos } from '@/hooks/useInsumos'
import { InsumoForm } from './InsumoForm'
import type { Insumo } from '@/integrations/supabase/types'

export function InsumosList() {
  const { insumos, loading, deleteInsumo, refetch } = useInsumos()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('todas')
  const [fornecedorFilter, setFornecedorFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

  const insumosForUI = insumos.map(item => ({
    ...item,
    fornecedor: (item as any).fornecedores?.razao_social || null,
    nome: item.nome_comercial || item.nome || 'Sem nome',
    codigo: item.codigo_insumo || '---'
  }))

  const insumosFiltrados = insumosForUI.filter(insumo => {
    // Busca aprimorada por texto - solução temporária
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || 
                         insumo.nome.toLowerCase().includes(searchLower) ||
                         (insumo.codigo?.toLowerCase().includes(searchLower)) ||
                         (insumo.categoria?.toLowerCase().includes(searchLower)) ||
                         (insumo.fornecedor?.toLowerCase().includes(searchLower)) ||
                         (insumo.observacoes?.toLowerCase().includes(searchLower))
    
    const matchesCategoria = categoriaFilter === 'todas' || insumo.categoria === categoriaFilter
    const matchesFornecedor = fornecedorFilter === 'todos' || 
                             (insumo.fornecedor === fornecedorFilter) ||
                             (!insumo.fornecedor && fornecedorFilter === 'sem_fornecedor')
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'ativo' && insumo.ativo) ||
                         (statusFilter === 'inativo' && !insumo.ativo)
    
    return matchesSearch && matchesCategoria && matchesFornecedor && matchesStatus
  })

  // Filtrar categorias válidas (não vazias)
  const categorias = Array.from(new Set(
    insumosForUI
      .map(i => i.categoria)
      .filter(categoria => categoria && categoria.trim() !== '')
  )).sort()
  
  // Filtrar fornecedores válidos (não vazios)
  const fornecedores = Array.from(new Set(
    insumosForUI
      .filter(i => i.fornecedor)
      .map(i => i.fornecedor!)
      .filter(nome => nome && nome.trim() !== '')
  )).sort()

  const handleDelete = async (insumo: Insumo) => {
    try {
      await deleteInsumo(insumo.id)
    } catch (error) {
      console.error('Erro ao excluir insumo:', error)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Carregando insumos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Insumos</h1>
          <p className="text-muted-foreground">
            Gerencie seus insumos e matérias-primas
          </p>
        </div>
        <InsumoForm onSuccess={handleRefresh} />
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Busca Principal - Solução Temporária */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">🔍 Busca Rápida (Solução Temporária)</h3>
            </div>
            <div className="relative">
              <Input
                placeholder="Digite qualquer texto para buscar em nome, código, categoria, fornecedor ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-12 text-lg h-12 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-blue-600">
                💡 Busca em: Nome, Código, Categoria, Fornecedor e Observações
              </p>
              <p className="text-sm font-medium text-blue-800">
                📊 {insumosFiltrados.length} de {insumosForUI.length} insumos encontrados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Filtro por Categoria */}
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="min-h-[48px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.length > 0 && categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Fornecedor */}
            <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
              <SelectTrigger className="min-h-[48px]">
                <SelectValue placeholder="Todos os fornecedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os fornecedores</SelectItem>
                <SelectItem value="sem_fornecedor">Sem fornecedor</SelectItem>
                {fornecedores.length > 0 && fornecedores.map(fornecedor => (
                  <SelectItem key={fornecedor} value={fornecedor}>
                    {fornecedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-h-[48px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Apenas ativos</SelectItem>
                <SelectItem value="inativo">Apenas inativos</SelectItem>
              </SelectContent>
            </Select>

            {/* Limpar Filtros */}
            <Button 
              variant="outline" 
              className="min-h-[48px]"
              onClick={() => {
                setSearchTerm('')
                setCategoriaFilter('todas')
                setFornecedorFilter('todos')
                setStatusFilter('todos')
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{insumosForUI.length}</div>
            <p className="text-sm text-muted-foreground">Total de Insumos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{insumosFiltrados.length}</div>
            <p className="text-sm text-muted-foreground">Insumos Filtrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {insumosForUI.filter(i => i.ativo).length}
            </div>
            <p className="text-sm text-muted-foreground">Insumos Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              R$ {insumosForUI.reduce((total, i) => total + (i.quantidade_comprar * i.preco_por_unidade * i.fator_correcao), 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Valor Total Compras</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Insumos</CardTitle>
        </CardHeader>
        <CardContent>
          {insumosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchTerm || categoriaFilter !== 'todas' || fornecedorFilter !== 'todos'
                  ? 'Nenhum insumo encontrado para os filtros selecionados.'
                  : 'Nenhum insumo cadastrado ainda.'}
              </p>
              {!searchTerm && categoriaFilter === 'todas' && fornecedorFilter === 'todos' && (
                <InsumoForm 
                  trigger={<Button>Adicionar Primeiro Insumo</Button>} 
                  onSuccess={handleRefresh}
                />
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Preço/Un.</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-right">Qtd. Comprar</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insumosFiltrados.map((insumo) => (
                      <TableRow key={insumo.id}>
                        <TableCell>
                          <Badge 
                            variant={insumo.ativo ? "default" : "secondary"}
                            className={insumo.ativo ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}
                          >
                            {insumo.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{insumo.nome}</TableCell>
                        <TableCell>
                          {insumo.codigo && (
                            <Badge variant="outline">{insumo.codigo}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {insumo.fornecedor ? (
                            <span className="text-sm">{insumo.fornecedor}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sem fornecedor</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{insumo.categoria}</Badge>
                        </TableCell>
                        <TableCell>{insumo.unidade_medida}</TableCell>
                        <TableCell className="text-right">
                          R$ {insumo.preco_por_unidade.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {(insumo.preco_por_unidade * insumo.fator_correcao).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {insumo.quantidade_comprar > 0 ? (
                            <Badge variant="default">{insumo.quantidade_comprar}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <InsumoForm 
                              insumo={insumo}
                              onSuccess={handleRefresh}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o insumo "{insumo.nome}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(insumo)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {insumosFiltrados.map((insumo) => (
                  <Card key={insumo.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg truncate">{insumo.nome}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={insumo.ativo ? "default" : "secondary"}
                              className={insumo.ativo ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}
                            >
                              {insumo.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                            {insumo.codigo && (
                              <Badge variant="outline">{insumo.codigo}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <InsumoForm 
                            insumo={insumo}
                            onSuccess={handleRefresh}
                            trigger={
                              <Button variant="ghost" size="sm" className="min-h-[48px] min-w-[48px]">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="min-h-[48px] min-w-[48px]">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o insumo "{insumo.nome}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(insumo)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Fornecedor:</span>
                          <p className="font-medium">
                            {insumo.fornecedor || "Sem fornecedor"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Categoria:</span>
                          <p className="font-medium">{insumo.categoria}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unidade:</span>
                          <p className="font-medium">{insumo.unidade_medida}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Preço/Un.:</span>
                          <p className="font-medium">R$ {insumo.preco_por_unidade.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Custo Unit.:</span>
                          <p className="font-medium">R$ {(insumo.preco_por_unidade * insumo.fator_correcao).toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qtd. Comprar:</span>
                          <p className="font-medium">
                            {insumo.quantidade_comprar > 0 ? insumo.quantidade_comprar : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}