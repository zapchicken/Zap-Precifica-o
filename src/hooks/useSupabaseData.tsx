import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Dados mock para desenvolvimento
const MOCK_DATA = {
  produtos: [
    {
      id: '1',
      nome: 'Hambúrguer Clássico',
      categoria: null, // Removido: 'hamburguer'
      preco_venda: 25.90,
      margem_contribuicao: 65.5,
      ativo: true,
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    },
    {
      id: '2', 
      nome: 'Batata Frita Grande',
      categoria: null, // Removido: 'acompanhamento'
      preco_venda: 12.50,
      margem_contribuicao: 78.2,
      ativo: true,
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    },
    {
      id: '3',
      nome: 'Refrigerante 350ml',
      categoria: null, // Removido: 'bebida'
      preco_venda: 6.00,
      margem_contribuicao: 85.0,
      ativo: true,
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    }
  ],
  insumos: [
    {
      id: '1',
      nome: 'Carne Bovina (Kg)',
      categoria: null, // Removido: 'proteina'
      preco_unitario: 32.50,
      unidade_medida: 'kg',
      estoque_atual: 50,
      estoque_minimo: 10,
      ativo: true,
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    },
    {
      id: '2',
      nome: 'Batata (Kg)',
      categoria: null, // Removido: 'vegetal'
      preco_unitario: 4.80,
      unidade_medida: 'kg',
      estoque_atual: 25,
      estoque_minimo: 5,
      ativo: true,
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    }
  ],
  vendas: [],
  bases: [],
  fichas_tecnicas: []
};

// Hook para produtos - INTEGRAÇÃO REAL COM SUPABASE
export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setProdutos([]);
        return;
      }

      // Buscar produtos do usuário
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) {
        throw new Error(error.message);
      }

      setProdutos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive"
      });
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return { produtos, loading, refetch: fetchProdutos };
}

// Hook para insumos - INTEGRAÇÃO REAL COM SUPABASE
export function useInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInsumos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('insumos')
        .select(`
          *,
          fornecedores!fornecedor_id (
            id,
            razao_social,
            pessoa_contato
          )
        `)
        .order('nome');
      
      if (error) {
        throw error;
      }
      
      setInsumos(data || []);
      
      toast({
        title: "Insumos carregados com sucesso!",
        description: `${data?.length || 0} insumos encontrados`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Erro ao carregar insumos:', error);
      toast({
        title: "Erro ao carregar insumos",
        description: error.message,
        variant: "destructive"
      });
      setInsumos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  return { insumos, loading, refetch: fetchInsumos };
}

// Hook para bases - INTEGRAÇÃO REAL COM SUPABASE
export function useBases() {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBases = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setBases([]);
        return;
      }

      // Buscar bases do usuário
      const { data, error } = await supabase
        .from('bases')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) {
        throw new Error(error.message);
      }

      setBases(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar bases:', error);
      toast({
        title: "Erro ao carregar bases",
        description: error.message,
        variant: "destructive"
      });
      setBases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBases();
  }, []);

  return { bases, loading, refetch: fetchBases };
}

// Hook para vendas
export function useVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVendas = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setVendas([]);
        return;
      }

      // Buscar vendas do usuário
      const { data, error } = await supabase
        .from('vendas')
        .select('id, data_venda, pedido_numero, produto_nome, produto_codigo, quantidade, valor_unitario, valor_total, canal, observacoes, created_at')
        .eq('user_id', user.id)
        .order('data_venda', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      console.log('🔍 useVendas - Vendas carregadas do Supabase:', data?.length || 0);
      console.log('🔍 useVendas - Primeiras 3 vendas:', data?.slice(0, 3));
      
      setVendas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar vendas:', error);
      toast({
        title: "Erro ao carregar vendas",
        description: error.message,
        variant: "destructive"
      });
      setVendas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  return { vendas, loading, refetch: fetchVendas };
}

// Hook para fichas técnicas - INTEGRAÇÃO REAL COM SUPABASE
export function useFichasTecnicas() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFichas = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setFichas([]);
        return;
      }

      // Buscar fichas técnicas do usuário
      const { data, error } = await supabase
        .from('fichas_tecnicas')
        .select('*')
        .eq('user_id', user.id)
        .order('produto_nome');

      if (error) {
        throw new Error(error.message);
      }

      setFichas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar fichas técnicas:', error);
      toast({
        title: "Erro ao carregar fichas técnicas",
        description: error.message,
        variant: "destructive"
      });
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFichas();
  }, []);

  return { fichas, loading, refetch: fetchFichas };
}

// Hook para dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalProdutos: 0,
    margemMedia: 0,
    produtosLucrativos: 0,
    alertasPreco: 0,
    vendasMes: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setStats({
          totalProdutos: 0,
          margemMedia: 0,
          produtosLucrativos: 0,
          alertasPreco: 0,
          vendasMes: 0
        });
        return;
      }

      // Buscar produtos e vendas do usuário
      const [produtosResult, vendasResult] = await Promise.all([
        supabase
          .from('produtos')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'ativo'),
        supabase
          .from('vendas')
          .select('valor_total, data_venda')
          .eq('user_id', user.id)
          .gte('data_venda', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      if (produtosResult.error) {
        throw new Error(produtosResult.error.message);
      }

      if (vendasResult.error) {
        console.warn('Erro ao carregar vendas para dashboard:', vendasResult.error.message);
      }

      const produtos = produtosResult.data || [];
      const vendas = vendasResult.data || [];
      
      console.log('Dashboard Stats - Produtos:', produtos.length, 'Vendas:', vendas.length);
      
      const totalProdutos = produtos.length;
      const margemMedia = produtos.length > 0 
        ? produtos.reduce((acc, p) => acc + (p.margem_lucro || 0), 0) / produtos.length 
        : 0;
      const produtosLucrativos = produtos.filter(p => (p.margem_lucro || 0) > 30).length;
      const alertasPreco = produtos.filter(p => !p.preco_venda || p.preco_venda <= 0).length;
      
      // Calcular vendas do mês atual
      const vendasMes = vendas.reduce((acc, v) => acc + parseFloat(v.valor_total || 0), 0);
      
      setStats({
        totalProdutos,
        margemMedia: Math.round(margemMedia * 100) / 100,
        produtosLucrativos,
        alertasPreco,
        vendasMes
      });
    } catch (error) {
      console.error('Erro ao calcular stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading };
}

// Hook para importação de dados (mock)
export function useImportData() {
  const { toast } = useToast();

  const importData = async (type: string, data: any[]) => {
    // Simular importação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Importação simulada",
      description: `${data.length} itens de ${type} processados (modo local)`,
      variant: "default"
    });
    
    return { success: true, count: data.length };
  };

  return { importData };
}