import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DespesaFixa {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  valor: number;
  frequencia: 'mensal' | 'anual' | 'semanal' | 'quinzenal';
  data_vencimento?: string;
  dia_vencimento?: number;
  status: 'ativa' | 'inativa';
  observacoes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface NovaDespesaFixa {
  nome: string;
  descricao?: string;
  categoria: string;
  valor: number;
  frequencia: 'mensal' | 'anual' | 'semanal' | 'quinzenal';
  data_vencimento?: string;
  dia_vencimento?: number;
  status?: 'ativa' | 'inativa';
  observacoes?: string;
}

export function useDespesasFixas() {
  const [despesas, setDespesas] = useState<DespesaFixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Buscar todas as despesas fixas do usuário
  const fetchDespesas = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('despesas_fixas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDespesas(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar despesas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Criar nova despesa fixa
  const createDespesa = async (novaDespesa: NovaDespesaFixa): Promise<DespesaFixa | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setError(null);

      const dadosParaInserir = {
        ...novaDespesa,
        user_id: user.id,
        status: novaDespesa.status || 'ativa'
      };

      const { data, error: createError } = await supabase
        .from('despesas_fixas')
        .insert([dadosParaInserir])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Atualizar lista local
      setDespesas(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar despesa';
      setError(errorMessage);
      return null;
    }
  };

  // Atualizar despesa existente
  const updateDespesa = async (id: string, updates: Partial<NovaDespesaFixa>): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('despesas_fixas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Atualizar lista local
      setDespesas(prev => 
        prev.map(despesa => 
          despesa.id === id 
            ? { ...despesa, ...updates, updated_at: new Date().toISOString() }
            : despesa
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar despesa');
      return false;
    }
  };

  // Deletar despesa
  const deleteDespesa = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('despesas_fixas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Remover da lista local
      setDespesas(prev => prev.filter(despesa => despesa.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar despesa');
      return false;
    }
  };

  // Buscar despesas por categoria
  const getDespesasByCategoria = (categoria: string): DespesaFixa[] => {
    return despesas.filter(despesa => despesa.categoria === categoria);
  };

  // Calcular total de despesas por frequência
  const getTotalByFrequencia = (frequencia: string): number => {
    return despesas
      .filter(despesa => despesa.frequencia === frequencia && despesa.status === 'ativa')
      .reduce((total, despesa) => total + despesa.valor, 0);
  };

  // Calcular total mensal (convertendo outras frequências)
  const getTotalMensal = (): number => {
    return despesas
      .filter(despesa => despesa.status === 'ativa')
      .reduce((total, despesa) => {
        switch (despesa.frequencia) {
          case 'mensal':
            return total + despesa.valor;
          case 'quinzenal':
            return total + (despesa.valor * 2);
          case 'semanal':
            return total + (despesa.valor * 4.33); // Média de semanas por mês
          case 'anual':
            return total + (despesa.valor / 12);
          default:
            return total;
        }
      }, 0);
  };

  // Buscar despesas vencendo em breve
  const getDespesasVencendo = (dias: number = 7): DespesaFixa[] => {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(hoje.getDate() + dias);

    return despesas.filter(despesa => {
      if (despesa.status !== 'ativa') return false;
      
      // Se tem data específica de vencimento
      if (despesa.data_vencimento) {
        const vencimento = new Date(despesa.data_vencimento);
        return vencimento >= hoje && vencimento <= limite;
      }
      
      // Se tem dia do mês para vencimento
      if (despesa.dia_vencimento) {
        const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), despesa.dia_vencimento);
        if (vencimento < hoje) {
          vencimento.setMonth(vencimento.getMonth() + 1);
        }
        return vencimento <= limite;
      }
      
      return false;
    });
  };

  // Buscar despesas por status
  const getDespesasByStatus = (status: 'ativa' | 'inativa'): DespesaFixa[] => {
    return despesas.filter(despesa => despesa.status === status);
  };

  // Buscar despesas por valor (acima de um valor mínimo)
  const getDespesasByValor = (valorMinimo: number): DespesaFixa[] => {
    return despesas.filter(despesa => despesa.valor >= valorMinimo);
  };

  // Limpar erro
  const clearError = () => setError(null);

  // Efeito para buscar despesas quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchDespesas();
    } else {
      setDespesas([]);
      setLoading(false);
    }
  }, [user]);

  return {
    despesas,
    loading,
    error,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    fetchDespesas,
    getDespesasByCategoria,
    getTotalByFrequencia,
    getTotalMensal,
    getDespesasVencendo,
    getDespesasByStatus,
    getDespesasByValor,
    clearError
  };
}
