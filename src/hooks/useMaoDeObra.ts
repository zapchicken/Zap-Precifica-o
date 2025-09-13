import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Interfaces
export interface Prolabore {
  id: string
  nome_socio: string
  valor_mensal: number
  created_at?: string
  updated_at?: string
}

export interface FuncionarioCLT {
  id: string
  nome: string
  cargo: string
  salario_bruto: number
  quantidade: number
  vale_transporte: number
  vale_refeicao?: number // Campo antigo para compatibilidade
  vale_refeicao_por_dia: number
  vale_refeicao_mensal: number
  plano_saude: number
  seguro_vida: number
  treinamento: number
  uniformes: number
  outros_beneficios: number
  horas_extras: number
  horas_noturnas_por_dia: number
  dias_semana: number
  created_at?: string
  updated_at?: string
}

export interface Freelancer {
  id: string
  funcao: string
  valor_diaria: number
  quantidade_pessoas: number
  dias_mes: number
  created_at?: string
  updated_at?: string
}

export function useMaoDeObra() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Estados para os dados
  const [prolabores, setProlabores] = useState<Prolabore[]>([])
  const [funcionarios, setFuncionarios] = useState<FuncionarioCLT[]>([])
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      await Promise.all([
        carregarProlabores(),
        carregarFuncionarios(),
        carregarFreelancers()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da mão de obra",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // ===== PROLABORE =====
  const carregarProlabores = async () => {
    const { data, error } = await supabase
      .from('prolabore')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setProlabores(data || [])
  }

  const adicionarProlabore = async (prolabore: Omit<Prolabore, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('prolabore')
        .insert([{ ...prolabore, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setProlabores(prev => [data, ...prev])
      toast({
        title: "Sucesso",
        description: "Prolabore adicionado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao adicionar prolabore:', error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar prolabore",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const atualizarProlabore = async (id: string, prolabore: Partial<Prolabore>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('prolabore')
        .update(prolabore)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setProlabores(prev => prev.map(p => p.id === id ? data : p))
      toast({
        title: "Sucesso",
        description: "Prolabore atualizado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao atualizar prolabore:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar prolabore",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removerProlabore = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('prolabore')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProlabores(prev => prev.filter(p => p.id !== id))
      toast({
        title: "Sucesso",
        description: "Prolabore removido com sucesso!"
      })
    } catch (error) {
      console.error('Erro ao remover prolabore:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover prolabore",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== FUNCIONÁRIOS CLT =====
  const carregarFuncionarios = async () => {
    const { data, error } = await supabase
      .from('funcionarios_clt')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setFuncionarios(data || [])
  }

  const adicionarFuncionario = async (funcionario: Omit<FuncionarioCLT, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('funcionarios_clt')
        .insert([{ ...funcionario, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setFuncionarios(prev => [data, ...prev])
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionário",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const atualizarFuncionario = async (id: string, funcionario: Partial<FuncionarioCLT>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('funcionarios_clt')
        .update(funcionario)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setFuncionarios(prev => prev.map(f => f.id === id ? data : f))
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar funcionário",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removerFuncionario = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('funcionarios_clt')
        .delete()
        .eq('id', id)

      if (error) throw error

      setFuncionarios(prev => prev.filter(f => f.id !== id))
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso!"
      })
    } catch (error) {
      console.error('Erro ao remover funcionário:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== FREELANCERS =====
  const carregarFreelancers = async () => {
    const { data, error } = await supabase
      .from('freelancers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setFreelancers(data || [])
  }

  const adicionarFreelancer = async (freelancer: Omit<Freelancer, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('freelancers')
        .insert([{ ...freelancer, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setFreelancers(prev => [data, ...prev])
      toast({
        title: "Sucesso",
        description: "Freelancer adicionado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao adicionar freelancer:', error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar freelancer",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const atualizarFreelancer = async (id: string, freelancer: Partial<Freelancer>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .update(freelancer)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setFreelancers(prev => prev.map(f => f.id === id ? data : f))
      toast({
        title: "Sucesso",
        description: "Freelancer atualizado com sucesso!"
      })
      return data
    } catch (error) {
      console.error('Erro ao atualizar freelancer:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar freelancer",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removerFreelancer = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('freelancers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setFreelancers(prev => prev.filter(f => f.id !== id))
      toast({
        title: "Sucesso",
        description: "Freelancer removido com sucesso!"
      })
    } catch (error) {
      console.error('Erro ao remover freelancer:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover freelancer",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== CÁLCULOS =====
  const calcularCustoFuncionario = (funcionario: FuncionarioCLT) => {
    const { salario_bruto, quantidade, vale_transporte, vale_refeicao, vale_refeicao_por_dia, vale_refeicao_mensal, plano_saude, 
            seguro_vida, treinamento, uniformes, outros_beneficios, horas_extras, 
            horas_noturnas_por_dia, dias_semana } = funcionario

    // Calcular vale-refeição mensal baseado no valor por dia e dias trabalhados
    const diasTrabalhadosMes = (dias_semana || 6) * 4.33 // 4.33 semanas por mês
    const valeRefeicaoCalculado = (vale_refeicao_por_dia || 0) * diasTrabalhadosMes
    
    // Usar o novo sistema se disponível, senão usar o campo antigo
    const valeRefeicaoFinal = vale_refeicao_mensal || valeRefeicaoCalculado || (vale_refeicao || 0)

    // Encargos e provisões
    const inssPatronal = salario_bruto * 0.20
    const fgts = salario_bruto * 0.08
    const decimoTerceiro = salario_bruto * 0.0833
    const ferias = salario_bruto * 0.1111
    const rescisao = salario_bruto * 0.08
    const contratacao = salario_bruto * 0.15

    // Cálculo de horas extras
    const valorHoraNormal = salario_bruto / 220
    const valorHoraExtra = valorHoraNormal * 1.5
    const custoHorasExtras = valorHoraExtra * horas_extras

    // Adicional noturno com hora reduzida (52,5 min) e base nos dias/semana
    const FATOR_REDUCAO_HORA_NOTURNA = 60 / 52.5 // ≈ 1.142857
    const horasNoturnasMesAjustadas = (horas_noturnas_por_dia || 0) * FATOR_REDUCAO_HORA_NOTURNA * (dias_semana || 0) * 4.33
    const valorAdicionalPorHora = valorHoraNormal * 0.2 // 20% sobre a hora normal
    const custoAdicionalNoturno = valorAdicionalPorHora * horasNoturnasMesAjustadas

    // Custo total por funcionário
    const custoUnitario = salario_bruto + inssPatronal + fgts + decimoTerceiro + 
                         ferias + rescisao + contratacao + vale_transporte + 
                         valeRefeicaoFinal + plano_saude + seguro_vida + treinamento + 
                         uniformes + outros_beneficios + custoHorasExtras + custoAdicionalNoturno

    // Custo total do cargo (multiplicado pela quantidade)
    const custoTotal = custoUnitario * quantidade

    return {
      inssPatronal,
      fgts,
      decimoTerceiro,
      ferias,
      rescisao,
      contratacao,
      valorHoraNormal,
      valorHoraExtra,
      custoHorasExtras,
      custoAdicionalNoturno,
      valeRefeicaoFinal,
      custoUnitario,
      custoTotal
    }
  }

  // Cálculos totais
  const totalProlabore = prolabores.reduce((total, p) => total + p.valor_mensal, 0)
  
  const totalFuncionarios = funcionarios.reduce((total, funcionario) => {
    const { custoTotal } = calcularCustoFuncionario(funcionario)
    return total + custoTotal
  }, 0)

  const totalFreelancers = freelancers.reduce((total, freelancer) => {
    return total + (freelancer.valor_diaria * freelancer.quantidade_pessoas * freelancer.dias_mes)
  }, 0)

  const totalGeral = totalProlabore + totalFuncionarios + totalFreelancers

  return {
    // Estados
    loading,
    prolabores,
    funcionarios,
    freelancers,
    
    // Funções de prolabore
    adicionarProlabore,
    atualizarProlabore,
    removerProlabore,
    
    // Funções de funcionários
    adicionarFuncionario,
    atualizarFuncionario,
    removerFuncionario,
    
    // Funções de freelancers
    adicionarFreelancer,
    atualizarFreelancer,
    removerFreelancer,
    
    // Funções utilitárias
    carregarDados,
    calcularCustoFuncionario,
    
    // Totais
    totalProlabore,
    totalFuncionarios,
    totalFreelancers,
    totalGeral
  }
}
