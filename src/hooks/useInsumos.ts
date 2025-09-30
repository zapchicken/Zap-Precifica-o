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
        fornecedor: item.fornecedores?.razao_social || null,
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
      // Validar código duplicado
      if (insumo.codigo_insumo) {
        const { data: existingInsumo, error: checkError } = await supabase
          .from('insumos')
          .select('id, codigo_insumo')
          .eq('codigo_insumo', insumo.codigo_insumo)
          .eq('user_id', user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingInsumo) {
          throw new Error(`Já existe um insumo com o código "${insumo.codigo_insumo}". Códigos devem ser únicos.`)
        }
      }

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
      // Validar código duplicado se estiver sendo alterado
      if (updates.codigo_insumo) {
        const { data: existingInsumo, error: checkError } = await supabase
          .from('insumos')
          .select('id, codigo_insumo')
          .eq('codigo_insumo', updates.codigo_insumo)
          .eq('user_id', user.id)
          .not('id', 'eq', id) // Excluir o próprio insumo da verificação
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingInsumo) {
          throw new Error(`Já existe um insumo com o código "${updates.codigo_insumo}". Códigos devem ser únicos.`)
        }
      }

      const insumoAtual = insumos.find(i => i.id === id)
      const precoMudou = updates.preco_por_unidade !== undefined && updates.preco_por_unidade !== insumoAtual?.preco_por_unidade
      const fatorMudou = updates.fator_correcao !== undefined && updates.fator_correcao !== insumoAtual?.fator_correcao
      const unidadeMudou = updates.unidade_medida !== undefined && updates.unidade_medida !== insumoAtual?.unidade_medida
      
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
      
      if ((precoMudou || fatorMudou || unidadeMudou) && data) {
        const novoCustoUnitario = data.preco_por_unidade * data.fator_correcao
        console.log('🔄 Disparando recálculo automático para insumo:', data.nome, 'ID:', id, 'Novo custo:', novoCustoUnitario)
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

      if (basesInsumos && basesInsumos.length > 0) {
        const basesNomes = basesInsumos.map((item: any) => item.bases.nome).join(', ')
        throw new Error(`Este insumo está sendo usado nas seguintes bases: ${basesNomes}. Remova-o das bases primeiro.`)
      }

      if (fichasInsumos && fichasInsumos.length > 0) {
        const fichasNomes = fichasInsumos.map((item: any) => item.fichas_tecnicas.nome).join(', ')
        throw new Error(`Este insumo está sendo usado nas seguintes fichas técnicas: ${fichasNomes}. Remova-o das fichas primeiro.`)
      }

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

  const getInsumosParaCompra = () => {
    return insumos.filter(insumo => insumo.quantidade_comprar > 0)
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