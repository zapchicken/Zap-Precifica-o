import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Fornecedor, FornecedorInsert, FornecedorUpdate } from '@/integrations/supabase/types'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchFornecedores = async () => {
    if (!user?.id) {
      setFornecedores([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Buscar fornecedores ocultos para este usuário
      const { data: fornecedoresOcultos, error: ocultosError } = await supabase
        .from('fornecedores_ocultos')
        .select('fornecedor_id')
        .eq('user_id', user.id)

      if (ocultosError) {
        console.warn('Erro ao buscar fornecedores ocultos:', ocultosError)
      }

      const idsOcultos = fornecedoresOcultos?.map(f => f.fornecedor_id) || []

      // Buscar todos os fornecedores, excluindo os ocultos
      let query = supabase
        .from('fornecedores')
        .select('*')
        .order('razao_social')

      // Se há fornecedores ocultos, excluí-los da consulta
      if (idsOcultos.length > 0) {
        query = query.not('id', 'in', `(${idsOcultos.join(',')})`)
      }

      const { data, error } = await query

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
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const fornecedorData = {
        ...fornecedor,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('fornecedores')
        .insert(fornecedorData)
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
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Primeiro, verificar se o fornecedor existe e se pertence ao usuário
      const { data: existingFornecedor, error: checkError } = await supabase
        .from('fornecedores')
        .select('id, user_id')
        .eq('id', id)
        .single()

      if (checkError) throw checkError

      // Se o fornecedor tem user_id NULL (compartilhado), não pode ser atualizado
      if (existingFornecedor.user_id === null) {
        throw new Error('Este fornecedor é compartilhado e não pode ser editado. Crie uma cópia própria para editá-lo.')
      }

      // Se o fornecedor pertence a outro usuário, não pode ser atualizado
      if (existingFornecedor.user_id !== user.id) {
        throw new Error('Você não tem permissão para editar este fornecedor.')
      }

      // Agora fazer a atualização
      const { data, error } = await supabase
        .from('fornecedores')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setFornecedores(prev => prev.map(f => f.id === id ? data : f))
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso"
      })
      return data
    } catch (error: any) {
      console.error('Erro ao atualizar fornecedor:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o fornecedor",
        variant: "destructive"
      })
      throw error
    }
  }

  const deleteFornecedor = async (id: string) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Primeiro, verificar se o fornecedor existe e se pertence ao usuário
      const { data: existingFornecedor, error: checkError } = await supabase
        .from('fornecedores')
        .select('id, user_id')
        .eq('id', id)
        .single()

      if (checkError) throw checkError

      // Se o fornecedor tem user_id NULL (compartilhado), não pode ser excluído
      if (existingFornecedor.user_id === null) {
        throw new Error('Este fornecedor é compartilhado e não pode ser excluído.')
      }

      // Se o fornecedor pertence a outro usuário, não pode ser excluído
      if (existingFornecedor.user_id !== user.id) {
        throw new Error('Você não tem permissão para excluir este fornecedor.')
      }

      // Agora fazer a exclusão
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setFornecedores(prev => prev.filter(f => f.id !== id))
      toast({
        title: "Sucesso",
        description: "Fornecedor excluído com sucesso"
      })
    } catch (error: any) {
      console.error('Erro ao excluir fornecedor:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o fornecedor",
        variant: "destructive"
      })
      throw error
    }
  }

  const duplicateFornecedor = async (id: string, hideOriginal: boolean = false) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Buscar o fornecedor original
      const { data: originalFornecedor, error: fetchError } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Criar uma cópia com o user_id do usuário atual
      const { razao_social, pessoa_contato, telefone, status, condicoes_pagamento, observacoes } = originalFornecedor
      
      const fornecedorData = {
        razao_social: hideOriginal ? razao_social : `${razao_social} (Cópia)`, // Se ocultar original, usar nome original
        pessoa_contato,
        telefone,
        status,
        condicoes_pagamento,
        observacoes,
        user_id: user.id
      }

      const { data: novoFornecedor, error } = await supabase
        .from('fornecedores')
        .insert(fornecedorData)
        .select()
        .single()

      if (error) throw error

      // Migrar insumos do usuário que estavam vinculados ao fornecedor original
      const { data: insumosParaMigrar, error: insumosError } = await supabase
        .from('insumos')
        .select('id, nome')
        .eq('fornecedor_id', id)
        .eq('user_id', user.id)

      if (insumosError) {
        console.warn('Erro ao buscar insumos para migração:', insumosError)
      }

      if (insumosParaMigrar && insumosParaMigrar.length > 0) {
        // Atualizar os insumos para apontar para o novo fornecedor
        const { error: updateError } = await supabase
          .from('insumos')
          .update({ fornecedor_id: novoFornecedor.id })
          .eq('fornecedor_id', id)
          .eq('user_id', user.id)

        if (updateError) {
          console.warn('Erro ao migrar insumos:', updateError)
        } else {
          console.log(`✅ ${insumosParaMigrar.length} insumos migrados para o novo fornecedor`)
        }
      }

      // Se solicitado, marcar o fornecedor original como oculto para este usuário
      if (hideOriginal) {
        // Criar um registro de fornecedor oculto para este usuário
        const { error: hideError } = await supabase
          .from('fornecedores_ocultos')
          .insert({
            fornecedor_id: id,
            user_id: user.id,
            razao_social: originalFornecedor.razao_social // Para referência
          })

        if (hideError) {
          console.warn('Erro ao ocultar fornecedor original:', hideError)
        }
      }

      setFornecedores(prev => [...prev, novoFornecedor])
      
      const mensagem = insumosParaMigrar && insumosParaMigrar.length > 0
        ? `Fornecedor ${hideOriginal ? 'substituído' : 'duplicado'} com sucesso! ${insumosParaMigrar.length} insumos foram migrados automaticamente.`
        : `Fornecedor ${hideOriginal ? 'substituído' : 'duplicado'} com sucesso!`

      toast({
        title: "Sucesso",
        description: mensagem
      })
      return novoFornecedor
    } catch (error: any) {
      console.error('Erro ao duplicar fornecedor:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível duplicar o fornecedor",
        variant: "destructive"
      })
      throw error
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchFornecedores()
    }
  }, [user?.id])

  return {
    fornecedores,
    loading,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    duplicateFornecedor,
    refetch: fetchFornecedores
  }
}