import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Search, X } from 'lucide-react'
import { useFornecedores } from '@/hooks/useFornecedores'
import { FornecedorInsert } from '@/integrations/supabase/types'
import { useAuth } from '@/contexts/AuthContext'

const Fornecedor = () => {
  // Usando o hook real do Supabase
  const { fornecedores, loading, createFornecedor, updateFornecedor, deleteFornecedor } = useFornecedores()
  const { user } = useAuth()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ativo' | 'inativo'>('ativo')

  const [formData, setFormData] = useState<FornecedorInsert>({
    razao_social: '',
    pessoa_contato: '',
    telefone: '',
    status: 'ativo',
    condicoes_pagamento: '',
    observacoes: '',
    user_id: user?.id || ''
  })

  // Função para fechar o formulário
  const closeForm = () => {
    setIsFormOpen(false)
    setEditingFornecedor(null)
    resetForm()
  }

  // Listener para tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFormOpen) {
        closeForm()
      }
    }

    if (isFormOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFormOpen])

  const resetForm = () => {
    setFormData({
      razao_social: '',
      pessoa_contato: '',
      telefone: '',
      status: 'ativo',
      condicoes_pagamento: '',
      observacoes: '',
      user_id: user?.id || ''
    })
    setEditingFornecedor(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      console.error('Usuário não autenticado')
      return
    }
    
    try {
      const fornecedorData = {
        ...formData,
        user_id: user.id
      }
      
      if (editingFornecedor) {
        await updateFornecedor(editingFornecedor.id, fornecedorData)
      } else {
        await createFornecedor(fornecedorData)
      }
      resetForm()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleEdit = (fornecedor: any) => {
    setFormData({
      razao_social: fornecedor.razao_social,
      pessoa_contato: fornecedor.pessoa_contato || '',
      telefone: fornecedor.telefone || '',
      status: fornecedor.status as 'ativo' | 'inativo',
      condicoes_pagamento: fornecedor.condicoes_pagamento || '',
      observacoes: fornecedor.observacoes || '',
      user_id: user?.id || ''
    })
    setEditingFornecedor(fornecedor)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await deleteFornecedor(id)
    }
  }

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fornecedor.pessoa_contato?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = fornecedor.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Layout currentPage="fornecedor">
        <div className="flex justify-center items-center h-64">Carregando...</div>
      </Layout>
    )
  }

  return (
    <Layout currentPage="fornecedor">
      <div className="space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Fornecedores</h1>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por razão social ou contato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: 'ativo' | 'inativo') => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        {isFormOpen && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeForm}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razao_social">Razão Social *</Label>
                    <Input
                      id="razao_social"
                      value={formData.razao_social}
                      onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pessoa_contato">Pessoa de Contato</Label>
                    <Input
                      id="pessoa_contato"
                      value={formData.pessoa_contato || ''}
                      onChange={(e) => setFormData({...formData, pessoa_contato: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'ativo' | 'inativo') => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="condicoes_pagamento">Condições de Pagamento</Label>
                  <Textarea
                    id="condicoes_pagamento"
                    value={formData.condicoes_pagamento || ''}
                    onChange={(e) => setFormData({...formData, condicoes_pagamento: e.target.value})}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingFornecedor ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Fornecedores */}
        <div className="grid gap-4">
          {filteredFornecedores.map((fornecedor) => (
            <Card key={fornecedor.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{fornecedor.razao_social}</h3>
                      <Badge variant={fornecedor.status === 'ativo' ? 'default' : 'secondary'}>
                        {fornecedor.status}
                      </Badge>
                    </div>
                    {fornecedor.pessoa_contato && (
                      <p className="text-sm text-muted-foreground">
                        Contato: {fornecedor.pessoa_contato}
                      </p>
                    )}
                    {fornecedor.telefone && (
                      <p className="text-sm text-muted-foreground">
                        Telefone: {fornecedor.telefone}
                      </p>
                    )}
                    {fornecedor.condicoes_pagamento && (
                      <p className="text-sm text-muted-foreground">
                        Condições: {fornecedor.condicoes_pagamento}
                      </p>
                    )}
                    {fornecedor.observacoes && (
                      <p className="text-sm text-muted-foreground">
                        Obs: {fornecedor.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(fornecedor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(fornecedor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFornecedores.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Nenhum fornecedor encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default Fornecedor