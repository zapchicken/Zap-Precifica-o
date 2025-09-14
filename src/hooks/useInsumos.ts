import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Insumo, InsumoInsert, InsumoUpdate } from '@/integrations/supabase/types'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useRecalculoAutomatico } from './useRecalculoAutomatico'

export const useInsumos = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { recalcularAutomaticamente } = useRecalculoAutomatico()

  const fetchInsumos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select(`
          *,
          fornecedores (
            id,
            razao_social,
            pessoa_contato,
            status
          )
        `)
        .order('nome')

      if (error) throw error

      const insumosForUI = data?.map(item => ({
        ...item,
        fornecedor: item.fornecedores?.razao_social || null, // ← converte o campo do banco para o nome da UI
      }));

      setInsumos(insumosForUI || [])
    } catch (error: any) {
      console.error('Erro ao carregar insumos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os insumos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createInsumo = async (insumo: InsumoInsert) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const insumoData = {
        ...insumo,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('insumos')
        .insert(insumoData)
        .select(`
          *,
          fornecedores (
            id,
            razao_social,
            pessoa_contato,
            status
          )
        `)
        .single()

      if (error) throw error

      setInsumos(prev => [...prev, data])
      toast({
        title: "Sucesso",
        description: "Insumo criado com sucesso"
      })
      return data
    } catch (error: any) {
      console.error('Erro ao criar insumo:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o insumo",
        variant: "destructive"
      })
      throw error
    }
  }

  const updateInsumo = async (id: string, updates: InsumoUpdate) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // ✅ Verificar se o preço ou fator de correção mudaram
      const insumoAtual = insumos.find(i => i.id === id)
      const precoMudou = updates.preco_por_unidade !== undefined && updates.preco_por_unidade !== insumoAtual?.preco_por_unidade
      const fatorMudou = updates.fator_correcao !== undefined && updates.fator_correcao !== insumoAtual?.fator_correcao
      
      const { data, error } = await supabase
        .from('insumos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          fornecedores (
            id,
            razao_social,
            pessoa_contato,
            status
          )
        `)
        .single()

      if (error) throw error

      setInsumos(prev => prev.map(i => i.id === id ? data : i))
      
      // ✅ Recálculo automático ativado
      if ((precoMudou || fatorMudou) && data) {
        const novoCustoUnitario = data.preco_por_unidade * data.fator_correcao
        console.log('🔄 Preço ou fator mudou, iniciando recálculo automático...')
        
        // Recalcular automaticamente todas as fichas e bases que usam este insumo
        await recalcularAutomaticamente(id, novoCustoUnitario)
      }
      
      toast({
        title: "Sucesso",
        description: "Insumo atualizado com sucesso"
      })
      return data
    } catch (error: any) {
      console.error('Erro ao atualizar insumo:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o insumo",
        variant: "destructive"
      })
      throw error
    }
  }

  const deleteInsumo = async (id: string) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Verificar dependências antes de excluir
      const { data: basesInsumos, error: basesError } = await supabase
        .from('bases_insumos')
        .select('id, bases!inner(nome)')
        .eq('insumo_id', id)

      const { data: fichasInsumos, error: fichasError } = await supabase
        .from('fichas_insumos')
        .select('id, fichas_tecnicas!inner(nome)')
        .eq('insumo_id', id)

      if (basesError) throw basesError
      if (fichasError) throw fichasError

      // Se há dependências, mostrar erro informativo
      if (basesInsumos && basesInsumos.length > 0) {
        const basesNomes = basesInsumos.map((item: any) => item.bases.nome).join(', ')
        throw new Error(`Este insumo está sendo usado nas seguintes bases: ${basesNomes}. Remova-o das bases primeiro.`)
      }

      if (fichasInsumos && fichasInsumos.length > 0) {
        const fichasNomes = fichasInsumos.map((item: any) => item.fichas_tecnicas.nome).join(', ')
        throw new Error(`Este insumo está sendo usado nas seguintes fichas técnicas: ${fichasNomes}. Remova-o das fichas primeiro.`)
      }

      // Se não há dependências, excluir
      const { error } = await supabase
        .from('insumos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setInsumos(prev => prev.filter(i => i.id !== id))
      toast({
        title: "Sucesso",
        description: "Insumo excluído com sucesso"
      })
    } catch (error: any) {
      console.error('Erro ao excluir insumo:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o insumo",
        variant: "destructive"
      })
      throw error
    }
  }

  // Buscar insumos para lista de compras (quantidade_comprar > 0)
  // Função que filtra por quantidade_comprar > 0
  const getInsumosParaCompra = () => {
    return insumos.filter(insumo => insumo.quantidade_comprar > 0)  // ← PROBLEMA
  }

  useEffect(() => {
    fetchInsumos()
  }, [])

  return {
    insumos,
    loading,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    refetch: fetchInsumos,
    getInsumosParaCompra
  }
}