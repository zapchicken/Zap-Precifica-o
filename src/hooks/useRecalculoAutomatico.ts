// src/hooks/useRecalculoAutomatico.ts
import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export const useRecalculoAutomatico = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  // Função para recalcular todas as fichas que usam um insumo específico
  const recalcularFichasComInsumo = useCallback(async (insumoId: string, novoCustoUnitario: number) => {
    if (!user?.id) {
      console.warn('⚠️ Usuário não autenticado para recálculo automático')
      return
    }

    try {
      console.log('🔄 Iniciando recálculo automático de fichas para insumo:', insumoId, 'Novo custo:', novoCustoUnitario)
      
      // 1. Encontrar todas as fichas que usam este insumo
      const { data: fichasAfetadas, error: buscaError } = await supabase
        .from('fichas_insumos')
        .select(`
          ficha_id,
          quantidade,
          fichas_tecnicas!inner(
            id,
            nome,
            user_id
          )
        `)
        .eq('insumo_id', insumoId)
        .eq('fichas_tecnicas.user_id', user.id)

      if (buscaError) {
        console.error('❌ Erro ao buscar fichas afetadas:', buscaError)
        return
      }

      if (!fichasAfetadas || fichasAfetadas.length === 0) {
        console.log('✅ Nenhuma ficha afetada pelo insumo:', insumoId)
        return
      }

      console.log('🔍 Fichas afetadas encontradas:', fichasAfetadas.length)

      // 2. Atualizar custos nas tabelas relacionadas
      for (const fichaInsumo of fichasAfetadas) {
        const novoCustoTotal = fichaInsumo.quantidade * novoCustoUnitario
        
        // Atualizar fichas_insumos
        const { error: updateError } = await supabase
          .from('fichas_insumos')
          .update({
            custo_unitario: novoCustoUnitario,
            custo_total: novoCustoTotal
          })
          .eq('ficha_id', fichaInsumo.ficha_id)
          .eq('insumo_id', insumoId)

        if (updateError) {
          console.error('❌ Erro ao atualizar ficha_insumo:', updateError)
          continue
        }

        console.log('✅ Ficha insumo atualizada:', fichaInsumo.ficha_id)
      }

      // 3. Recalcular custo total de cada ficha afetada
      for (const fichaInsumo of fichasAfetadas) {
        await recalcularCustoTotalFicha(fichaInsumo.ficha_id)
      }

      console.log('✅ Recálculo automático de fichas concluído para', fichasAfetadas.length, 'fichas')
      
      return fichasAfetadas.length
    } catch (error) {
      console.error('❌ Erro no recálculo automático de fichas:', error)
      return 0
    }
  }, [user?.id])

  // Função para recalcular todas as bases que usam um insumo específico
  const recalcularBasesComInsumo = useCallback(async (insumoId: string, novoCustoUnitario: number) => {
    if (!user?.id) {
      console.warn('⚠️ Usuário não autenticado para recálculo automático de bases')
      return
    }

    try {
      console.log('🔄 Iniciando recálculo automático de bases para insumo:', insumoId, 'Novo custo:', novoCustoUnitario)
      
      // 1. Encontrar todas as bases que usam este insumo
      const { data: basesAfetadas, error: buscaError } = await supabase
        .from('bases_insumos')
        .select(`
          base_id,
          quantidade,
          bases!inner(
            id,
            nome,
            user_id
          )
        `)
        .eq('insumo_id', insumoId)
        .eq('bases.user_id', user.id)

      if (buscaError) {
        console.error('❌ Erro ao buscar bases afetadas:', buscaError)
        return
      }

      if (!basesAfetadas || basesAfetadas.length === 0) {
        console.log('✅ Nenhuma base afetada pelo insumo:', insumoId)
        return
      }

      console.log('🔍 Bases afetadas encontradas:', basesAfetadas.length)

      // 2. Atualizar custos nas tabelas relacionadas
      for (const baseInsumo of basesAfetadas) {
        const novoCustoTotal = baseInsumo.quantidade * novoCustoUnitario
        
        // Atualizar bases_insumos
        const { error: updateError } = await supabase
          .from('bases_insumos')
          .update({
            custo: novoCustoTotal
          })
          .eq('base_id', baseInsumo.base_id)
          .eq('insumo_id', insumoId)

        if (updateError) {
          console.error('❌ Erro ao atualizar base_insumo:', updateError)
          continue
        }

        console.log('✅ Base insumo atualizada:', baseInsumo.base_id)
      }

      // 3. Recalcular custo total de cada base afetada
      for (const baseInsumo of basesAfetadas) {
        await recalcularCustoTotalBase(baseInsumo.base_id)
      }

      console.log('✅ Recálculo automático de bases concluído para', basesAfetadas.length, 'bases')
      
      return basesAfetadas.length
    } catch (error) {
      console.error('❌ Erro no recálculo automático de bases:', error)
      return 0
    }
  }, [user?.id])

  // Função para recalcular todas as fichas que usam uma base específica
  const recalcularFichasComBase = useCallback(async (baseId: string, novoCustoUnitario: number) => {
    if (!user?.id) {
      console.warn('⚠️ Usuário não autenticado para recálculo automático de fichas com base')
      return
    }

    try {
      console.log('🔄 Iniciando recálculo automático de fichas para base:', baseId, 'Novo custo:', novoCustoUnitario)
      
      // 1. Encontrar todas as fichas que usam esta base
      const { data: fichasAfetadas, error: buscaError } = await supabase
        .from('fichas_bases')
        .select(`
          ficha_id,
          quantidade,
          fichas_tecnicas!inner(
            id,
            nome,
            user_id
          )
        `)
        .eq('base_id', baseId)
        .eq('fichas_tecnicas.user_id', user.id)

      if (buscaError) {
        console.error('❌ Erro ao buscar fichas afetadas pela base:', buscaError)
        return
      }

      if (!fichasAfetadas || fichasAfetadas.length === 0) {
        console.log('✅ Nenhuma ficha afetada pela base:', baseId)
        return
      }

      console.log('🔍 Fichas afetadas pela base encontradas:', fichasAfetadas.length)

      // 2. Atualizar custos nas tabelas relacionadas
      for (const fichaBase of fichasAfetadas) {
        const novoCustoTotal = fichaBase.quantidade * novoCustoUnitario
        
        // Atualizar fichas_bases
        const { error: updateError } = await supabase
          .from('fichas_bases')
          .update({
            custo_unitario: novoCustoUnitario,
            custo_total: novoCustoTotal
          })
          .eq('ficha_id', fichaBase.ficha_id)
          .eq('base_id', baseId)

        if (updateError) {
          console.error('❌ Erro ao atualizar ficha_base:', updateError)
          continue
        }

        console.log('✅ Ficha base atualizada:', fichaBase.ficha_id)
      }

      // 3. Recalcular custo total de cada ficha afetada
      for (const fichaBase of fichasAfetadas) {
        await recalcularCustoTotalFicha(fichaBase.ficha_id)
      }

      console.log('✅ Recálculo automático de fichas com base concluído para', fichasAfetadas.length, 'fichas')
      
      return fichasAfetadas.length
    } catch (error) {
      console.error('❌ Erro no recálculo automático de fichas com base:', error)
      return 0
    }
  }, [user?.id])

  // Função auxiliar para recalcular custo total de uma ficha
  const recalcularCustoTotalFicha = useCallback(async (fichaId: string) => {
    try {
      // Calcular custo total dos insumos
      const { data: insumos, error: insumosError } = await supabase
        .from('fichas_insumos')
        .select('custo_total')
        .eq('ficha_id', fichaId)

      if (insumosError) throw insumosError

      // Calcular custo total das bases
      const { data: bases, error: basesError } = await supabase
        .from('fichas_bases')
        .select('custo_total')
        .eq('ficha_id', fichaId)

      if (basesError) throw basesError

      // Calcular custo total dos produtos prontos
      const { data: produtos, error: produtosError } = await supabase
        .from('fichas_produtosprontos')
        .select('custo_total')
        .eq('ficha_id', fichaId)

      if (produtosError) throw produtosError

      // Calcular custo total das embalagens
      const { data: embalagens, error: embalagensError } = await supabase
        .from('insumos_embalagem_delivery')
        .select('custo_total')
        .eq('ficha_id', fichaId)

      if (embalagensError) throw embalagensError

      // Somar todos os custos
      const custoTotalInsumos = insumos?.reduce((acc, item) => acc + (item.custo_total || 0), 0) || 0
      const custoTotalBases = bases?.reduce((acc, item) => acc + (item.custo_total || 0), 0) || 0
      const custoTotalProdutos = produtos?.reduce((acc, item) => acc + (item.custo_total || 0), 0) || 0
      const custoTotalEmbalagens = embalagens?.reduce((acc, item) => acc + (item.custo_total || 0), 0) || 0

      const custoTotalGeral = custoTotalInsumos + custoTotalBases + custoTotalProdutos + custoTotalEmbalagens

      // Atualizar custo total na ficha principal
      const { error: updateError } = await supabase
        .from('fichas_tecnicas')
        .update({
          custo_total_producao: custoTotalGeral,
          custo_por_unidade: custoTotalGeral // Assumindo que é por unidade
        })
        .eq('id', fichaId)

      if (updateError) throw updateError

      console.log('✅ Custo total recalculado para ficha:', fichaId, 'Valor:', custoTotalGeral)

    } catch (error) {
      console.error('❌ Erro ao recalcular custo total da ficha:', fichaId, error)
    }
  }, [])

  // Função auxiliar para recalcular custo total de uma base
  const recalcularCustoTotalBase = useCallback(async (baseId: string) => {
    try {
      // Calcular custo total dos insumos da base
      const { data: insumos, error: insumosError } = await supabase
        .from('bases_insumos')
        .select('custo')
        .eq('base_id', baseId)

      if (insumosError) throw insumosError

      // Somar todos os custos dos insumos
      const custoTotalInsumos = insumos?.reduce((acc, item) => acc + (item.custo || 0), 0) || 0

      // Buscar dados da base para calcular custo por unidade
      const { data: base, error: baseError } = await supabase
        .from('bases')
        .select('quantidade_total, tipo_produto')
        .eq('id', baseId)
        .single()

      if (baseError) throw baseError

      // Calcular custo por unidade/kg
      const custoPorUnidade = base.quantidade_total > 0 ? custoTotalInsumos / base.quantidade_total : 0

      // Atualizar custo total na base
      const { error: updateError } = await supabase
        .from('bases')
        .update({
          custo_total_batelada: custoTotalInsumos,
          custo_por_kg: base.tipo_produto === 'peso' ? custoPorUnidade : null,
          custo_por_unidade: base.tipo_produto === 'unidade' ? custoPorUnidade : null
        })
        .eq('id', baseId)

      if (updateError) throw updateError

      console.log('✅ Custo total recalculado para base:', baseId, 'Valor:', custoTotalInsumos, 'Por unidade:', custoPorUnidade)

    } catch (error) {
      console.error('❌ Erro ao recalcular custo total da base:', baseId, error)
    }
  }, [])

  // Função principal para recálculo automático quando um insumo é alterado
  const recalcularAutomaticamente = useCallback(async (insumoId: string, novoCustoUnitario: number) => {
    if (!user?.id) {
      console.warn('⚠️ Usuário não autenticado para recálculo automático')
      return
    }

    try {
      console.log('🔄 Iniciando recálculo automático completo para insumo:', insumoId)
      
      // Recalcular bases que usam este insumo
      const basesAfetadas = await recalcularBasesComInsumo(insumoId, novoCustoUnitario)
      
      // Recalcular fichas que usam este insumo diretamente
      const fichasAfetadas = await recalcularFichasComInsumo(insumoId, novoCustoUnitario)
      
      const totalAfetado = basesAfetadas + fichasAfetadas
      
      if (totalAfetado > 0) {
        toast({
          title: "Recálculo Automático Concluído",
          description: `${totalAfetado} registros foram atualizados automaticamente (${basesAfetadas} bases, ${fichasAfetadas} fichas)`,
        })
      }
      
      return totalAfetado
    } catch (error) {
      console.error('❌ Erro no recálculo automático completo:', error)
      toast({
        title: "Erro no Recálculo Automático",
        description: "Não foi possível recalcular todos os custos automaticamente",
        variant: "destructive"
      })
      return 0
    }
  }, [user?.id, recalcularBasesComInsumo, recalcularFichasComInsumo, toast])

  return {
    recalcularAutomaticamente,
    recalcularFichasComInsumo,
    recalcularBasesComInsumo,
    recalcularFichasComBase,
    recalcularCustoTotalFicha,
    recalcularCustoTotalBase
  }
}
