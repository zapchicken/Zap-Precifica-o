// src/hooks/useBases.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useRecalculoAutomatico } from './useRecalculoAutomatico'

// Interface para a base/produto intermediário
export interface Base {
  id: string
  nome: string
  codigo: string
  tipo_produto: 'peso' | 'unidade'
  quantidade_total: number
  unidade_produto: string
  rendimento: string
  custo_total_batelada: number
  modo_preparo: string
  observacoes: string | null
  tempo_preparo: number
  foto: string | null
  ativo: boolean
  data_ficha: string
  user_id: string
  created_at: string
  updated_at: string
}

// Interface para insumo usado na base
export interface InsumoBase {
  id: string
  insumo_id: string
  nome: string
  quantidade: number
  unidade: string
  custo: number
  base_id: string
  created_at: string
  tipo: 'insumo'
}

// Interface para a base com seus insumos
export interface BaseComInsumos extends Base {
  insumos: InsumoBase[]
}

// Hook principal
export const useBases = () => {
  const [bases, setBases] = useState<BaseComInsumos[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { recalcularAutomaticamente } = useRecalculoAutomatico()

  // Carregar bases com insumos
  const loadBases = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Buscar bases
      const { data: basesData, error: basesError } = await supabase
        .from('bases')
        .select('*')
        .order('created_at', { ascending: false })

      if (basesError) throw basesError

      // Para cada base, buscar seus insumos
      const basesComInsumos = await Promise.all(
        (basesData || []).map(async (base) => {
          const { data: insumosData, error: insumosError } = await supabase
            .from('bases_insumos')
            .select(`
              id,
              insumo_id,
              quantidade,
              unidade,
              custo,
              base_id,
              created_at,
              insumo:insumos (
                nome
              )
            `)
            .eq('base_id', base.id)

          if (insumosError) throw insumosError

          const insumos = (insumosData || [])
            .filter((item: any) => {
              // Filtrar insumos que não existem mais (foram deletados)
              if (!item.insumo || !item.insumo.nome) {
                console.warn(`⚠️ Insumo não encontrado para base ${base.codigo}: insumo_id ${item.insumo_id}`)
                return false
              }
              return true
            })
            .map((item: any) => ({
              id: item.id,
              insumo_id: item.insumo_id,
              nome: item.insumo.nome,
              quantidade: item.quantidade,
              unidade: item.unidade,
              custo: item.custo,
              base_id: item.base_id,
              created_at: item.created_at,
              tipo: 'insumo' as const
            }))

          return {
            ...base,
            insumos
          }
        })
      )

      setBases(basesComInsumos)
    } catch (err) {
      console.error('Erro ao carregar bases:', err)
      setError('Erro ao carregar bases')
    } finally {
      setLoading(false)
    }
  }

  // Criar nova base
  const createBase = async (baseData: Omit<Base, 'id' | 'user_id' | 'created_at' | 'updated_at'>, insumosData: any[]) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      })
      return
    }

    try {
      // Verificar se código já existe
      const { data: existingBase } = await supabase
        .from('bases')
        .select('id')
        .eq('codigo', baseData.codigo)
        .not('id', 'eq', '00000000-0000-0000-0000-000000000000') // Excluir ID inexistente

      if (existingBase && existingBase.length > 0) {
        toast({
          title: 'Erro',
          description: 'Já existe uma base com este código',
          variant: 'destructive'
        })
        return
      }

      // Inserir base
      const { data: newBase, error: baseError } = await supabase
        .from('bases')
        .insert({
          ...baseData,
          user_id: user.id
        })
        .select()
        .single()

      if (baseError) throw baseError

      // Inserir insumos
      if (insumosData && insumosData.length > 0) {
        const insumosToInsert = insumosData.map(insumo => ({
          base_id: newBase.id,
          insumo_id: insumo.insumo_id,
          quantidade: insumo.quantidade,
          unidade: insumo.unidade,
          custo: insumo.custo,
          user_id: user.id
        }))

        const { error: insumosError } = await supabase
          .from('bases_insumos')
          .insert(insumosToInsert)

        if (insumosError) throw insumosError
      }

      // Recarregar bases
      await loadBases()

      toast({
        title: 'Sucesso',
        description: 'Base criada com sucesso!'
      })

      return newBase
    } catch (err) {
      console.error('Erro ao criar base:', err)
      toast({
        title: 'Erro',
        description: 'Erro ao criar base',
        variant: 'destructive'
      })
      throw err
    }
  }

  // Atualizar base
  const updateBase = async (id: string, baseData: Partial<Base>, insumosData: any[]) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      })
      return
    }

    try {
      // Verificar se código já existe (excluindo a própria base)
      if (baseData.codigo) {
        const { data: existingBase } = await supabase
          .from('bases')
          .select('id')
          .eq('codigo', baseData.codigo)
          .not('id', 'eq', id)

        if (existingBase && existingBase.length > 0) {
          toast({
            title: 'Erro',
            description: 'Já existe uma base com este código',
            variant: 'destructive'
          })
          return
        }
      }

      // Atualizar base
      const { error: baseError } = await supabase
        .from('bases')
        .update({
          ...baseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (baseError) throw baseError

      // Remover insumos existentes
      const { error: deleteError } = await supabase
        .from('bases_insumos')
        .delete()
        .eq('base_id', id)

      if (deleteError) throw deleteError

      // Inserir novos insumos
      if (insumosData && insumosData.length > 0) {
        const insumosToInsert = insumosData.map(insumo => ({
          base_id: id,
          insumo_id: insumo.insumo_id,
          quantidade: insumo.quantidade,
          unidade: insumo.unidade,
          custo: insumo.custo,
          user_id: user.id
        }))

        const { error: insumosError } = await supabase
          .from('bases_insumos')
          .insert(insumosToInsert)

        if (insumosError) throw insumosError
      }

      // Verificar recálculo automático
      await recalcularAutomaticamente(id, baseData.custo_total_batelada || 0)

      // Recarregar bases
      await loadBases()

      toast({
        title: 'Sucesso',
        description: 'Base atualizada com sucesso!'
      })
    } catch (err) {
      console.error('Erro ao atualizar base:', err)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar base',
        variant: 'destructive'
      })
      throw err
    }
  }

  // Limpar referências órfãs de insumos (insumos que foram deletados)
  const limparReferenciasOrfas = async (baseId: string) => {
    if (!user?.id) return

    try {
      // Buscar todos os insumos da base
      const { data: insumosBase, error: fetchError } = await supabase
        .from('bases_insumos')
        .select('id, insumo_id, insumos(id)')
        .eq('base_id', baseId)

      if (fetchError) {
        console.error('Erro ao buscar insumos da base:', fetchError)
        return
      }

      // Identificar insumos órfãos (que não existem mais na tabela insumos)
      const insumosOrfaos = (insumosBase || [])
        .filter((item: any) => !item.insumos)
        .map((item: any) => item.id)

      if (insumosOrfaos.length > 0) {
        console.log(`🧹 Limpando ${insumosOrfaos.length} referência(s) órfã(s) da base`)
        
        const { error: deleteError } = await supabase
          .from('bases_insumos')
          .delete()
          .in('id', insumosOrfaos)

        if (deleteError) {
          console.error('Erro ao limpar referências órfãs:', deleteError)
        } else {
          console.log('✅ Referências órfãs removidas com sucesso')
        }
      }
    } catch (err) {
      console.error('Erro ao limpar referências órfãs:', err)
    }
  }

  // Deletar base
  const deleteBase = async (id: string) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      })
      return
    }

    try {
      // Verificar se a base está sendo usada em fichas técnicas
      const { data: fichasComBase, error: checkError } = await supabase
        .from('fichas_bases')
        .select(`
          ficha_id,
          fichas_tecnicas (
            nome,
            codigo_pdv
          )
        `)
        .eq('base_id', id)

      if (checkError) {
        console.error('Erro ao verificar dependências:', checkError)
      }

      if (fichasComBase && fichasComBase.length > 0) {
        const fichasNomes = fichasComBase
          .map((fb: any) => fb.fichas_tecnicas?.nome || 'Ficha sem nome')
          .join(', ')
        
        toast({
          title: 'Não é possível excluir',
          description: `Esta base está sendo usada em ${fichasComBase.length} ficha(s) técnica(s): ${fichasNomes}. Remova a base dessas fichas primeiro.`,
          variant: 'destructive',
          duration: 8000
        })
        return
      }

      // Deletar insumos primeiro
      const { error: insumosError } = await supabase
        .from('bases_insumos')
        .delete()
        .eq('base_id', id)

      if (insumosError) throw insumosError

      // Deletar base
      const { error: baseError } = await supabase
        .from('bases')
        .delete()
        .eq('id', id)

      if (baseError) throw baseError

      // Recarregar bases
      await loadBases()

      toast({
        title: 'Sucesso',
        description: 'Base deletada com sucesso!'
      })
    } catch (err: any) {
      console.error('Erro ao deletar base:', err)
      
      // Verificar se é erro de foreign key
      if (err.code === '23503') {
        toast({
          title: 'Não é possível excluir',
          description: 'Esta base está sendo usada em outras fichas técnicas. Remova essas referências primeiro.',
          variant: 'destructive',
          duration: 8000
        })
      } else {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao deletar base',
          variant: 'destructive'
        })
      }
      throw err
    }
  }

  // Carregar bases na inicialização
  useEffect(() => {
    if (user?.id) {
      loadBases()
    }
  }, [user?.id])

  return {
    bases,
    loading,
    error,
    loadBases,
    createBase,
    updateBase,
    deleteBase,
    limparReferenciasOrfas
  }
}