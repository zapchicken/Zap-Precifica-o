import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Fornecedor, FornecedorInsert, FornecedorUpdate } from '@/integrations/supabase/types'
import { useToast } from '@/hooks/use-toast'

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchFornecedores = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('razao_social')

      if (error) throw error
      setFornecedores(data || [])
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fornecedores",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createFornecedor = async (fornecedor: FornecedorInsert) => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert(fornecedor)
        .select()
        .single()

      if (error) throw error

      setFornecedores(prev => [...prev, data])
      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso"
      })
      return data
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o fornecedor",
        variant: "destructive"
      })
      throw error
    }
  }

  const updateFornecedor = async (id: string, updates: FornecedorUpdate) => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setFornecedores(prev => prev.map(f => f.id === id ? data : f))
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso"
      })
      return data
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o fornecedor",
        variant: "destructive"
      })
      throw error
    }
  }

  const deleteFornecedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', id)

      if (error) throw error

      setFornecedores(prev => prev.filter(f => f.id !== id))
      toast({
        title: "Sucesso",
        description: "Fornecedor excluído com sucesso"
      })
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o fornecedor",
        variant: "destructive"
      })
      throw error
    }
  }

  useEffect(() => {
    fetchFornecedores()
  }, [])

  return {
    fornecedores,
    loading,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    refetch: fetchFornecedores
  }
}