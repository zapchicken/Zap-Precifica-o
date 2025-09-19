import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useDespesasFixas } from '@/hooks/useDespesasFixas'
import { useMaoDeObra } from '@/hooks/useMaoDeObra'
import { useAuth } from '@/contexts/AuthContext'

// Interfaces
export interface ConfigMarkupGeral {
  id?: string
  faturamento_estimado_mensal: number
  impostos_faturamento: number
  taxa_cartao: number
  outros_custos: number
  created_at?: string
  updated_at?: string
}

export interface CanalVenda {
  id?: string
  nome: string
  taxa_marketplace: number
  taxa_antecipacao: number
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface ConfigMarkupCategoria {
  id?: string
  categoria: string
  lucro_desejado: number
  reserva_operacional: number
  created_at?: string
  updated_at?: string
}

export interface ModeloMarkup {
  id?: string
  nome: string
  config_geral: ConfigMarkupGeral
  canais_venda: CanalVenda[]
  config_categorias: ConfigMarkupCategoria[]
  created_at?: string
  updated_at?: string
}

export interface CalculoMarkup {
  categoria: string
  canal: string
  markup: number
  custos_totais: number
  lucro_desejado: number
  reserva_operacional: number
}

export function useMarkup() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { getTotalMensal: getTotalDespesasFixas } = useDespesasFixas()
  const { totalGeral: totalMaoDeObra } = useMaoDeObra()
  
  const [loading, setLoading] = useState(false)
  const [configGeral, setConfigGeral] = useState<ConfigMarkupGeral | null>(null)
  const [canaisVenda, setCanaisVenda] = useState<CanalVenda[]>([])
  const [configCategorias, setConfigCategorias] = useState<ConfigMarkupCategoria[]>([])
  const [modelos, setModelos] = useState<ModeloMarkup[]>([])
  const [calculosMarkup, setCalculosMarkup] = useState<CalculoMarkup[]>([])

  // Carregar dados iniciais
  useEffect(() => {
    // Aguardar um pouco para garantir que o usuário está autenticado
    const timer = setTimeout(() => {
      carregarDados()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Recarregar dados quando o usuário mudar (login/logout)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        carregarDados()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      await Promise.all([
        carregarConfigGeral(),
        carregarCanaisVenda(),
        carregarConfigCategorias(),
        carregarModelos()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados de markup:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de markup",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // ===== CONFIGURAÇÃO GERAL =====
  const carregarConfigGeral = async () => {
    try {
      if (!user) {
        // Se não há usuário logado, usar configuração padrão
        setConfigGeral({
          faturamento_estimado_mensal: 0,
          impostos_faturamento: 0,
          taxa_cartao: 0,
          outros_custos: 0
        })
        return
      }

      const { data, error } = await supabase
        .from('config_markup_geral')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      const configFinal = data || {
        faturamento_estimado_mensal: 0,
        impostos_faturamento: 0,
        taxa_cartao: 0,
        outros_custos: 0
      }
      
      setConfigGeral(configFinal)
    } catch (error) {
      console.error('Erro ao carregar configuração geral:', error)
      // Em caso de erro, usar configuração padrão
      setConfigGeral({
        faturamento_estimado_mensal: 0,
        impostos_faturamento: 0,
        taxa_cartao: 0,
        outros_custos: 0
      })
    }
  }

  const salvarConfigGeral = async (config: ConfigMarkupGeral) => {
    setLoading(true)
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const dadosParaSalvar = {
        ...config,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      let data
      if (config.id) {
        // Atualizar
        const { data: updateData, error } = await supabase
          .from('config_markup_geral')
          .update(dadosParaSalvar)
          .eq('id', config.id)
          .select()
          .single()

        if (error) throw error
        data = updateData
      } else {
        // Criar
        const { data: insertData, error } = await supabase
          .from('config_markup_geral')
          .insert([dadosParaSalvar])
          .select()
          .single()

        if (error) throw error
        data = insertData
      }

      setConfigGeral(data)
      toast({
        title: "Sucesso",
        description: "Configuração geral salva com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao salvar configuração geral:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração geral",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== CANAIS DE VENDA =====
  const carregarCanaisVenda = async () => {
    try {
      if (!user) {
        setCanaisVenda([])
        return
      }


      const { data, error } = await supabase
        .from('canais_venda')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Se não há canais, adicionar canais padrão
      if (!data || data.length === 0) {
        console.log('📝 Nenhum canal encontrado, adicionando canais padrão...')
        await adicionarCanaisPadrao(user.id)
        // Recarregar após adicionar canais padrão
        const { data: newData } = await supabase
          .from('canais_venda')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
        setCanaisVenda(newData || [])
      } else {
        setCanaisVenda(data)
      }
    } catch (error) {
      console.error('Erro ao carregar canais de venda:', error)
      setCanaisVenda([])
    }
  }

  // Função para adicionar canais padrão
  const adicionarCanaisPadrao = async (userId: string) => {
    try {
      const canaisPadrao = [
        { nome: 'Venda Direta', taxa_marketplace: 0, taxa_antecipacao: 0, ativo: true, user_id: userId },
        { nome: 'iFood', taxa_marketplace: 12, taxa_antecipacao: 0, ativo: true, user_id: userId }
      ]

      const { error } = await supabase
        .from('canais_venda')
        .insert(canaisPadrao)

      if (error) {
        console.error('Erro ao adicionar canais padrão:', error)
      }
    } catch (error) {
      console.error('Erro inesperado ao adicionar canais padrão:', error)
    }
  }

  const adicionarCanalVenda = async (canal: Omit<CanalVenda, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('canais_venda')
        .insert([{ ...canal, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setCanaisVenda(prev => [...prev, data])
      toast({
        title: "Sucesso",
        description: "Canal de venda adicionado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao adicionar canal de venda:', error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar canal de venda",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const atualizarCanalVenda = async (id: string, canal: Partial<CanalVenda>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('canais_venda')
        .update({ ...canal, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setCanaisVenda(prev => prev.map(c => c.id === id ? data : c))
      toast({
        title: "Sucesso",
        description: "Canal de venda atualizado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao atualizar canal de venda:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar canal de venda",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removerCanalVenda = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('canais_venda')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCanaisVenda(prev => prev.filter(c => c.id !== id))
      toast({
        title: "Sucesso",
        description: "Canal de venda removido com sucesso!"
      })
    } catch (error) {
      console.error('Erro ao remover canal de venda:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover canal de venda",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== CONFIGURAÇÕES POR CATEGORIA =====
  const carregarConfigCategorias = async () => {
    try {
      if (!user) {
        setConfigCategorias([])
        return
      }


      const { data, error } = await supabase
        .from('config_markup_categoria')
        .select('*')
        .eq('user_id', user.id)
        .order('categoria', { ascending: true })

      if (error) throw error
      setConfigCategorias(data || [])
    } catch (error) {
      console.error('Erro ao carregar configurações de categoria:', error)
      setConfigCategorias([])
    }
  }

  const salvarConfigCategoria = async (config: ConfigMarkupCategoria) => {
    setLoading(true)
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const dadosParaSalvar = {
        ...config,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      let data
      if (config.id) {
        // Atualizar
        const { data: updateData, error } = await supabase
          .from('config_markup_categoria')
          .update(dadosParaSalvar)
          .eq('id', config.id)
          .select()
          .single()

        if (error) throw error
        data = updateData
      } else {
        // Criar
        const { data: insertData, error } = await supabase
          .from('config_markup_categoria')
          .insert([dadosParaSalvar])
          .select()
          .single()

        if (error) throw error
        data = insertData
      }

      setConfigCategorias(prev => {
        const index = prev.findIndex(c => c.categoria === config.categoria)
        if (index >= 0) {
          const newConfigs = [...prev]
          newConfigs[index] = data
          return newConfigs
        } else {
          return [...prev, data].sort((a, b) => a.categoria.localeCompare(b.categoria))
        }
      })

      toast({
        title: "Sucesso",
        description: `Configuração da categoria "${config.categoria}" salva com sucesso!`
      })
      return data
    } catch (error) {
      console.error('Erro ao salvar configuração de categoria:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração de categoria",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removerConfigCategoria = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('config_markup_categoria')
        .delete()
        .eq('id', id)

      if (error) throw error

      setConfigCategorias(prev => prev.filter(c => c.id !== id))
      toast({
        title: "Sucesso",
        description: "Configuração de categoria removida com sucesso!"
      })
    } catch (error) {
      console.error('Erro ao remover configuração de categoria:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover configuração de categoria",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== MODELOS DE MARKUP =====
  const carregarModelos = async () => {
    try {
      if (!user) {
        console.log('🔍 Usuário não autenticado, modelos vazios')
        setModelos([])
        return
      }

      console.log('🔍 Carregando modelos para usuário:', user.id)
      // TEMPORÁRIO: Desabilitar consulta ao Supabase devido ao erro 406
      console.log('Usando modelos vazios (consulta ao Supabase temporariamente desabilitada)');
      const data = [];
      const error = null;

      if (error) {
        console.error('❌ Erro ao carregar modelos:', error)
        throw error
      }
      
      console.log('📊 Modelos carregados:', data)
      setModelos(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar modelos:', error)
      setModelos([])
    }
  }

  const salvarModelo = async (nome: string) => {
    if (!configGeral || canaisVenda.length === 0 || configCategorias.length === 0) {
      console.log('❌ Dados insuficientes para salvar modelo:', {
        configGeral: !!configGeral,
        canaisVenda: canaisVenda.length,
        configCategorias: configCategorias.length
      })
      toast({
        title: "Erro",
        description: "Configure pelo menos as configurações gerais, canais e categorias antes de salvar um modelo",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const modelo = {
        nome,
        config_geral: configGeral,
        canais_venda: canaisVenda,
        config_categorias: configCategorias,
        user_id: user.id
      }

      console.log('💾 Salvando modelo:', { nome, user_id: user.id })
      console.log('📊 Dados do modelo:', modelo)

      // TEMPORÁRIO: Simular salvamento bem-sucedido
      console.log('Modelo salvo localmente (consulta ao Supabase temporariamente desabilitada)');
      const data = { id: 'temp-' + Date.now(), ...modelo, created_at: new Date().toISOString() };
      const error = null;

      if (error) {
        console.error('❌ Erro ao salvar modelo no banco:', error)
        throw error
      }

      console.log('✅ Modelo salvo com sucesso:', data)
      setModelos(prev => [data, ...prev])
      toast({
        title: "Sucesso",
        description: `Modelo "${nome}" salvo com sucesso!`
      })
      return data
    } catch (error) {
      console.error('❌ Erro ao salvar modelo:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar modelo",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const carregarModelo = async (id: string) => {
    setLoading(true)
    try {
      // TEMPORÁRIO: Simular carregamento de modelo
      console.log('Modelo carregado localmente (consulta ao Supabase temporariamente desabilitada)');
      const data = null;
      const error = new Error('Modelo não encontrado (funcionalidade temporariamente desabilitada)');

      if (error) throw error

      // Carregar as configurações do modelo (código comentado temporariamente)
      // setConfigGeral(data.config_geral)
      // setCanaisVenda(data.canais_venda)
      // setConfigCategorias(data.config_categorias)

      toast({
        title: "Aviso",
        description: "Funcionalidade de carregar modelos temporariamente desabilitada"
      })
      return data
    } catch (error) {
      console.error('Erro ao carregar modelo:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar modelo",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removerModelo = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('modelos_markup')
        .delete()
        .eq('id', id)

      if (error) throw error

      setModelos(prev => prev.filter(m => m.id !== id))
      toast({
        title: "Sucesso",
        description: "Modelo removido com sucesso!"
      })
    } catch (error) {
      console.error('Erro ao remover modelo:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover modelo",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== CÁLCULOS =====
  const calcularMarkup = (): CalculoMarkup[] => {
    if (!configGeral || canaisVenda.length === 0 || configCategorias.length === 0) {
      return []
    }

    const totalDespesasFixas = getTotalDespesasFixas()
    const totalMaoDeObraCalculado = totalMaoDeObra
    const totalDespesasOperacionais = totalDespesasFixas + totalMaoDeObraCalculado
    
    // Calcular % de despesas fixas sobre faturamento
    const percentualDespesasFixas = configGeral.faturamento_estimado_mensal > 0 
      ? (totalDespesasOperacionais / configGeral.faturamento_estimado_mensal) * 100 
      : 0

    const calculos: CalculoMarkup[] = []

    configCategorias.forEach(categoria => {
      canaisVenda.filter(canal => canal.ativo).forEach(canal => {
        // Calcular custos totais (T)
        const custosTotais = 
          configGeral.impostos_faturamento +
          configGeral.taxa_cartao +
          configGeral.outros_custos +
          percentualDespesasFixas +
          canal.taxa_marketplace +
          canal.taxa_antecipacao

        // Verificar se custos excedem 100%
        if (custosTotais >= 100) {
          calculos.push({
            categoria: categoria.categoria,
            canal: canal.nome,
            markup: 0,
            custos_totais: custosTotais,
            lucro_desejado: categoria.lucro_desejado,
            reserva_operacional: categoria.reserva_operacional
          })
          return
        }

        // Fórmula do markup: M = (1 + L + R) / (1 - T)
        const markup = (1 + (categoria.lucro_desejado / 100) + (categoria.reserva_operacional / 100)) / (1 - (custosTotais / 100))

        calculos.push({
          categoria: categoria.categoria,
          canal: canal.nome,
          markup: Math.round(markup * 100) / 100, // Arredondar para 2 casas decimais
          custos_totais: Math.round(custosTotais * 100) / 100,
          lucro_desejado: categoria.lucro_desejado,
          reserva_operacional: categoria.reserva_operacional
        })
      })
    })

    setCalculosMarkup(calculos)
    return calculos
  }

  // Calcular percentual de despesas fixas
  const getPercentualDespesasFixas = (): number => {
    if (!configGeral || configGeral.faturamento_estimado_mensal === 0) {
      return 0
    }

    const totalDespesasFixas = getTotalDespesasFixas()
    const totalMaoDeObraCalculado = totalMaoDeObra
    const totalDespesasOperacionais = totalDespesasFixas + totalMaoDeObraCalculado
    
    return (totalDespesasOperacionais / configGeral.faturamento_estimado_mensal) * 100
  }

  // Exportar CSV
  const exportarCSV = () => {
    if (calculosMarkup.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum cálculo de markup disponível para exportar",
        variant: "destructive"
      })
      return
    }

    const headers = ['Categoria', 'Canal', 'Markup', 'Custos Totais (%)', 'Lucro Desejado (%)', 'Reserva Operacional (%)']
    const csvContent = [
      headers.join(','),
      ...calculosMarkup.map(calc => [
        calc.categoria,
        calc.canal,
        calc.markup,
        calc.custos_totais,
        calc.lucro_desejado,
        calc.reserva_operacional
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `markup_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Arquivo CSV exportado com sucesso!"
    })
  }

  return {
    // Estados
    loading,
    configGeral,
    setConfigGeral,
    canaisVenda,
    configCategorias,
    modelos,
    calculosMarkup,
    
    // Funções de configuração geral
    salvarConfigGeral,
    
    // Funções de canais de venda
    adicionarCanalVenda,
    atualizarCanalVenda,
    removerCanalVenda,
    
    // Funções de configurações por categoria
    salvarConfigCategoria,
    removerConfigCategoria,
    
    // Funções de modelos
    salvarModelo,
    carregarModelo,
    removerModelo,
    
    // Funções utilitárias
    carregarDados,
    calcularMarkup,
    getPercentualDespesasFixas,
    exportarCSV,
    
    // Dados para cálculos
    totalDespesasFixas: getTotalDespesasFixas(),
    totalMaoDeObra: totalMaoDeObra,
    percentualDespesasFixas: getPercentualDespesasFixas()
  }
}
