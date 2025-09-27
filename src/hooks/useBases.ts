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
  const { recalcularFichasComBase } = useRecalculoAutomatico()

  // Carregar todas as bases
  const loadBases = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data: basesData, error: basesError } = await supabase
        .from('bases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (basesError) throw basesError

      if (basesData && basesData.length > 0) {
        // Para cada base, carregar os insumos
        const basesComInsumos = await Promise.all(
          basesData.map(async (base) => {
            const { data: insumosData } = await supabase
              .from('bases_insumos')
              .select(`
                id,
                insumo_id,
                quantidade,
                unidade,
                custo,
                insumos!inner (
                  nome,
                  codigo_insumo,
                  unidade_medida
                )
              `)
              .eq('base_id', base.id)

            const insumos = insumosData?.map((item: any) => ({
              id: item.id,
              insumo_id: item.insumo_id,
              nome: item.insumos.nome,
              quantidade: item.quantidade,
              unidade: item.insumos.unidade_medida, // ✅ CORREÇÃO: Usar unidade atual do insumo
              custo: item.custo,
              base_id: item.base_id,
              created_at: item.created_at
            })) || []

            return {
              ...base,
              insumos
            }
          })
        )

        setBases(basesComInsumos)

        // ✅ CORREÇÃO AUTOMÁTICA: Verificar e corrigir dados inconsistentes em background
        verificarECorrigirDadosAutomaticamente(basesData)
      } else {
        setBases([])
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as bases",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Criar nova base
  const createBase = async (baseData: any, insumosData: any[] = []) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Validar código duplicado
      if (baseData.codigo) {
        const { data: existingBase, error: checkError } = await supabase
          .from('bases')
          .select('id, codigo')
          .eq('codigo', baseData.codigo)
          .eq('user_id', user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingBase) {
          throw new Error(`Já existe uma base/produto intermediário com o código "${baseData.codigo}". Códigos devem ser únicos.`)
        }
      }

      const baseDataWithUserId = {
        ...baseData,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('bases')
        .insert([baseDataWithUserId])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const baseId = data[0].id

        // Salvar insumos
        if (insumosData && insumosData.length > 0) {
          const insumosDataWithUserId = insumosData.map((insumo: any) => ({
            base_id: baseId,
            insumo_id: insumo.insumo_id,
            quantidade: insumo.quantidade,
            custo: insumo.custo_unitario, // ✅ CORRIGIDO: custo_unitario já é o custo total
            unidade: insumo.unidade,
            user_id: user.id
          }))

          const { error: insumosError } = await supabase
            .from('bases_insumos')
            .insert(insumosDataWithUserId)

          if (insumosError) throw insumosError
        }

        await loadBases()
        return data[0]
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: "Não foi possível criar a base",
        variant: "destructive"
      })
      throw err
    }
  }

  // Atualizar base
  const updateBase = async (id: string, baseData: any, insumosData: any[] = []) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Validar código duplicado se estiver sendo alterado
      if (baseData.codigo) {
        const { data: existingBase, error: checkError } = await supabase
          .from('bases')
          .select('id, codigo')
          .eq('codigo', baseData.codigo)
          .eq('user_id', user.id)
          .neq('id', id) // Excluir a própria base da verificação
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingBase) {
          throw new Error(`Já existe uma base/produto intermediário com o código "${baseData.codigo}". Códigos devem ser únicos.`)
        }
      }

      const { error } = await supabase
        .from('bases')
        .update(baseData)
        .eq('id', id)

      if (error) throw error

      // Atualizar insumos
      if (insumosData !== undefined) {
        // Deletar insumos antigos
        await supabase
          .from('bases_insumos')
          .delete()
          .eq('base_id', id)

        // Inserir novos
        if (insumosData.length > 0) {
          const insumosDataWithUserId = insumosData.map((insumo: any) => ({
            base_id: id,
            insumo_id: insumo.insumo_id,
            quantidade: insumo.quantidade,
            custo: insumo.custo_unitario, // ✅ CORRIGIDO: custo_unitario já é o custo total
            unidade: insumo.unidade,
            user_id: user.id
          }))

          const { error: insumosError } = await supabase
            .from('bases_insumos')
            .insert(insumosDataWithUserId)

          if (insumosError) throw insumosError
        }
      }

      await loadBases()
      
      // ✅ Recálculo automático se custo da base mudou
      if (baseData.custo_total_batelada !== undefined) {
        const baseAtual = bases.find(b => b.id === id)
        if (baseAtual && baseData.custo_total_batelada !== baseAtual.custo_total_batelada) {
          const novoCustoUnitario = baseData.custo_total_batelada / (baseData.quantidade_total || 1)
          console.log('🔄 Custo da base mudou, iniciando recálculo automático...')
          
          // Recalcular fichas que usam esta base
          const fichasAfetadas = await recalcularFichasComBase(id, novoCustoUnitario)
          
          if (fichasAfetadas > 0) {
            toast({
              title: "Recálculo Automático",
              description: `${fichasAfetadas} fichas foram atualizadas automaticamente`,
            })
          }
        }
      }
      
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a base",
        variant: "destructive"
      })
      throw err
    }
  }

  // Verificar dependências de uma base
  const verificarDependenciasBase = async (baseId: string) => {
    const dependencias = {
      temDependencias: false,
      fichas: [] as string[],
      insumos: [] as string[]
    }

    try {
      // Verificar se está sendo usada em fichas técnicas
      const { data: fichasBases, error: fichasError } = await supabase
        .from('fichas_bases')
        .select('id, fichas_tecnicas!inner(nome, codigo)')
        .eq('base_id', baseId)

      if (fichasError) throw fichasError

      if (fichasBases && fichasBases.length > 0) {
        dependencias.temDependencias = true
        dependencias.fichas = fichasBases.map((item: any) => 
          `${item.fichas_tecnicas.nome} (${item.fichas_tecnicas.codigo})`
        )
      }

      // Verificar se tem insumos associados
      const { data: basesInsumos, error: insumosError } = await supabase
        .from('bases_insumos')
        .select('id, insumos!inner(nome)')
        .eq('base_id', baseId)

      if (insumosError) throw insumosError

      if (basesInsumos && basesInsumos.length > 0) {
        dependencias.temDependencias = true
        dependencias.insumos = basesInsumos.map((item: any) => item.insumos.nome)
      }

      return dependencias
    } catch (error) {
      console.error('Erro ao verificar dependências:', error)
      throw error
    }
  }

  // Excluir base (hard delete)
  const deleteBase = async (baseId: string) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const dependencias = await verificarDependenciasBase(baseId)
      
      if (dependencias.temDependencias) {
        let mensagem = 'Esta base não pode ser excluída porque está sendo usada em:\n'
        
        if (dependencias.fichas.length > 0) {
          mensagem += `• Fichas técnicas: ${dependencias.fichas.join(', ')}\n`
        }
        
        if (dependencias.insumos.length > 0) {
          mensagem += `• Insumos associados: ${dependencias.insumos.join(', ')}\n`
        }
        
        mensagem += '\nRemova essas dependências primeiro ou use a opção "Desativar".'
        
        throw new Error(mensagem)
      }

      // Se não há dependências, excluir fisicamente
      const { error } = await supabase
        .from('bases')
        .delete()
        .eq('id', baseId)

      if (error) throw error

      await loadBases()
      toast({
        title: "Sucesso",
        description: "Base excluída permanentemente"
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message || "Não foi possível excluir a base",
        variant: "destructive"
      })
      throw err
    }
  }

  // Desativar base (soft delete)
  const desativarBase = async (baseId: string) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error } = await supabase
        .from('bases')
        .update({ ativo: false })
        .eq('id', baseId)

      if (error) throw error

      await loadBases()
      toast({
        title: "Sucesso",
        description: "Base desativada com sucesso"
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message || "Não foi possível desativar a base",
        variant: "destructive"
      })
      throw err
    }
  }

  // Reativar base
  const reativarBase = async (baseId: string) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error } = await supabase
        .from('bases')
        .update({ ativo: true })
        .eq('id', baseId)

      if (error) throw error

      await loadBases()
      toast({
        title: "Sucesso",
        description: "Base reativada com sucesso"
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message || "Não foi possível reativar a base",
        variant: "destructive"
      })
      throw err
    }
  }

  // Gerar próximo código automático
  const gerarProximoCodigo = (): string => {
    const maxCode = bases
      .filter(b => b.codigo.startsWith('BAS'))
      .map(b => parseInt(b.codigo.replace('BAS', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0)

    const nextNumber = (maxCode + 1).toString().padStart(3, '0')
    return `BAS${nextNumber}`
  }

  // Carregar ao montar
  useEffect(() => {
    if (user?.id) {
      loadBases()
    }
  }, [user?.id])

  // ✅ NOVO: Função para recálculo automático de bases quando insumos mudam
  const recalcularBasesAutomaticamente = async (insumoId: string, novoCustoUnitario: number) => {
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
      
    } catch (error) {
      console.error('❌ Erro no recálculo automático de bases:', error)
    }
  }

  // ✅ NOVO: Função auxiliar para recalcular custo total de uma base
  const recalcularCustoTotalBase = async (baseId: string) => {
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
  }


  // ✅ NOVO: Função para verificar e corrigir dados automaticamente (em background)
  const verificarECorrigirDadosAutomaticamente = async (basesData: any[]) => {
    if (!user?.id) return

    try {
      if (import.meta.env.DEV) console.log('🔍 Verificando dados automaticamente...')
      
      let basesCorrigidas = 0
      
      // Verificar cada base em background
      for (const base of basesData) {
        const foiCorrigida = await verificarECorrigirBaseAutomaticamente(base.id)
        if (foiCorrigida) {
          basesCorrigidas++
        }
      }

      if (basesCorrigidas > 0) {
        console.log(`✅ ${basesCorrigidas} bases foram corrigidas automaticamente`)
        // Recarregar as bases para mostrar os dados corrigidos
        setTimeout(() => {
          loadBases()
        }, 1000)
      }
      
    } catch (error) {
      console.error('❌ Erro na verificação automática:', error)
    }
  }

  // ✅ NOVO: Função para verificar e corrigir uma base específica
  const verificarECorrigirBaseAutomaticamente = async (baseId: string): Promise<boolean> => {
    try {
      // Buscar insumos da base
      const { data: insumosBase, error: insumosError } = await supabase
        .from('bases_insumos')
        .select(`
          id,
          insumo_id,
          quantidade,
          custo,
          insumos!inner(
            preco_por_unidade,
            fator_correcao
          )
        `)
        .eq('base_id', baseId)

      if (insumosError) throw insumosError

      if (!insumosBase || insumosBase.length === 0) {
        return false
      }

      let baseFoiCorrigida = false

      // Verificar e corrigir cada insumo
      for (const insumoBase of insumosBase) {
        const insumo = insumoBase.insumos as any
        const custoCorreto = insumoBase.quantidade * insumo.preco_por_unidade * insumo.fator_correcao
        
        // Verificar se o custo está incorreto (diferença maior que 0.01)
        if (Math.abs(insumoBase.custo - custoCorreto) > 0.01) {
          const { error: updateError } = await supabase
            .from('bases_insumos')
            .update({ custo: custoCorreto })
            .eq('id', insumoBase.id)

          if (!updateError) {
            console.log('✅ Insumo base corrigido automaticamente:', insumoBase.id, 'Custo:', custoCorreto)
            baseFoiCorrigida = true
          }
        }
      }

      // Se algum insumo foi corrigido, recalcular o custo total da base
      if (baseFoiCorrigida) {
        await recalcularCustoTotalBase(baseId)
      }

      return baseFoiCorrigida

    } catch (error) {
      console.error('❌ Erro ao verificar base automaticamente:', baseId, error)
      return false
    }
  }

  // ✅ NOVO: Função para corrigir dados existentes e recalcular todas as bases (mantida para compatibilidade)
  const corrigirERecalcularTodasAsBases = async () => {
    if (!user?.id) {
      console.warn('⚠️ Usuário não autenticado para correção de bases')
      return
    }

    try {
      console.log('🔄 Iniciando correção e recálculo de todas as bases...')
      
      // 1. Primeiro, corrigir os dados dos insumos nas bases
      const { data: todasBases, error: basesError } = await supabase
        .from('bases')
        .select('id, nome')
        .eq('user_id', user.id)
        .eq('ativo', true)

      if (basesError) {
        console.error('❌ Erro ao buscar bases:', basesError)
        return
      }

      if (!todasBases || todasBases.length === 0) {
        console.log('✅ Nenhuma base encontrada para correção')
        return
      }

      console.log('🔍 Corrigindo e recalculando', todasBases.length, 'bases...')

      // 2. Para cada base, corrigir os dados dos insumos
      for (const base of todasBases) {
        await corrigirDadosInsumosBase(base.id)
        await recalcularCustoTotalBase(base.id)
      }

      // 3. Recarregar as bases para mostrar os dados corrigidos
      await loadBases()

      console.log('✅ Correção e recálculo concluídos para', todasBases.length, 'bases')
      
      toast({
        title: "Correção Concluída",
        description: `${todasBases.length} bases foram corrigidas e recalculadas com sucesso`
      })
      
    } catch (error) {
      console.error('❌ Erro na correção de bases:', error)
      toast({
        title: "Erro na Correção",
        description: "Não foi possível corrigir todas as bases",
        variant: "destructive"
      })
    }
  }

  // ✅ NOVO: Função para corrigir dados dos insumos de uma base
  const corrigirDadosInsumosBase = async (baseId: string) => {
    try {
      // Buscar insumos da base
      const { data: insumosBase, error: insumosError } = await supabase
        .from('bases_insumos')
        .select(`
          id,
          insumo_id,
          quantidade,
          custo,
          insumos!inner(
            preco_por_unidade,
            fator_correcao
          )
        `)
        .eq('base_id', baseId)

      if (insumosError) throw insumosError

      if (!insumosBase || insumosBase.length === 0) {
        return
      }

      // Corrigir cada insumo
      for (const insumoBase of insumosBase) {
        const insumo = insumoBase.insumos as any
        const custoCorreto = insumoBase.quantidade * insumo.preco_por_unidade * insumo.fator_correcao
        
        // Atualizar apenas se o custo estiver incorreto
        if (Math.abs(insumoBase.custo - custoCorreto) > 0.01) {
          const { error: updateError } = await supabase
            .from('bases_insumos')
            .update({ custo: custoCorreto })
            .eq('id', insumoBase.id)

          if (updateError) {
            console.error('❌ Erro ao corrigir insumo base:', updateError)
          } else {
            console.log('✅ Insumo base corrigido:', insumoBase.id, 'Custo:', custoCorreto)
          }
        }
      }

    } catch (error) {
      console.error('❌ Erro ao corrigir dados dos insumos da base:', baseId, error)
    }
  }

  return {
    bases,
    loading,
    error,
    createBase,
    updateBase,
    deleteBase,
    desativarBase,
    reativarBase,
    verificarDependenciasBase,
    gerarProximoCodigo,
    recalcularBasesAutomaticamente, // ✅ NOVO
    refresh: loadBases
  }
}
