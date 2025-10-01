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

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setVendas([]);
        return;
      }

      // ✅ NOVO CÓDIGO CORRETO — PAGINAÇÃO COM range()
      const fetchAllVendas = async () => {
        const batchSize = 1000;
        let allData = [];
        let offset = 0;

        while (true) {
          const { data: batch, error } = await supabase
            .from('vendas')
            .select('id, data_venda, pedido_numero, produto_nome, produto_codigo, quantidade, valor_unitario, valor_total, canal, observacoes, created_at')
            .eq('user_id', user.id)
            .order('data_venda', { ascending: true })
            .range(offset, offset + batchSize - 1);

          if (error) {
            throw error;
          }

          if (batch.length === 0) break;

          allData = [...allData, ...batch];
          offset += batchSize;
        }

        return allData;
      };

      const vendas = await fetchAllVendas();
      setVendas(vendas || []);

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
    margemContribuicaoPonderada: 0,
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
          margemContribuicaoPonderada: 0,
          produtosLucrativos: 0,
          alertasPreco: 0,
          vendasMes: 0
        });
        return;
      }

      // Buscar produtos
      const produtosResult = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ativo');

      // Buscar insumos - CORRIGIDO: usando preco_por_unidade
      const insumosResult = await supabase
        .from('insumos')
        .select('id, preco_por_unidade')
        .eq('user_id', user.id);

      // Buscar fichas técnicas com insumos - CORRIGIDO: usando fichas_insumos
      const fichasResult = await supabase
        .from('fichas_insumos')
        .select('ficha_id, insumo_id, quantidade')
        .eq('user_id', user.id);

      // Verificar erros nas consultas
      if (insumosResult.error) {
        console.warn('Erro ao buscar insumos:', insumosResult.error);
      }
      if (fichasResult.error) {
        console.warn('Erro ao buscar fichas técnicas:', fichasResult.error);
      }

      // Buscar todas as vendas com paginação para garantir que não perca nenhuma
      const fetchAllVendas = async () => {
        const batchSize = 1000;
        let allVendas = [];
        let offset = 0;

        while (true) {
          const { data: batch, error } = await supabase
            .from('vendas')
            .select('valor_total')
            .eq('user_id', user.id)
            .range(offset, offset + batchSize - 1);

          if (error) {
            throw error;
          }

          if (batch.length === 0) break;

          allVendas = [...allVendas, ...batch];
          offset += batchSize;
        }

        return allVendas;
      };

      const vendasSumResult = { data: await fetchAllVendas() };

      if (produtosResult.error) {
        throw new Error(produtosResult.error.message);
      }

      const produtos = produtosResult.data || [];
      const insumos = insumosResult.data || [];
      const fichas_insumos = fichasResult.data || [];
      
      const totalProdutos = produtos.length;
      
      // --- CÁLCULO DA MARGEM DE CONTRIBUIÇÃO PONDERADA COM BASE NAS VENDAS REAIS ---
      // 1. Buscar todos os produtos ativos com seus preços de venda e user_id
      const produtosAtivos = produtos.filter(p => p.status === 'ativo');
       
      // 2. Buscar todos os insumos para montar o custo por produto via ficha técnica
      const insumosMap = new Map(insumos.map(i => [i.id, i.preco_por_unidade]));
       
      // 3. Buscar todas as fichas técnicas e agrupar por ficha_id
      const fichasPorFicha = new Map();
      fichas_insumos.forEach(f => {
        if (!fichasPorFicha.has(f.ficha_id)) {
          fichasPorFicha.set(f.ficha_id, []);
        }
        fichasPorFicha.get(f.ficha_id).push({
          insumo_id: f.insumo_id,
          quantidade: f.quantidade
        });
      });
       
      // 4. Calcular custo total por ficha técnica
      const custoPorFicha = new Map();
      for (const [fichaId, fichas] of fichasPorFicha) {
        let custoTotal = 0;
        for (const ficha of fichas) {
          const custoInsumo = insumosMap.get(ficha.insumo_id);
          if (custoInsumo !== undefined) {
            custoTotal += custoInsumo * ficha.quantidade;
          }
        }
        custoPorFicha.set(fichaId, custoTotal);
      }
       
      // 5. Mapear custo por produto através da ficha técnica
      const custoPorProduto = new Map();
      let produtosComFicha = 0;
      let produtosSemFicha = 0;
      
      produtosAtivos.forEach(produto => {
        if (produto.ficha_tecnica_id) {
          const custoFicha = custoPorFicha.get(produto.ficha_tecnica_id) || 0;
          custoPorProduto.set(produto.id, custoFicha);
          produtosComFicha++;
        } else {
          // Se não tem ficha técnica, usar preco_custo se disponível
          custoPorProduto.set(produto.id, produto.preco_custo || 0);
          produtosSemFicha++;
        }
      });
      
      // 6. NOVO: Calcular margem de contribuição ponderada com base nas vendas reais
      const vendas = vendasSumResult.data || [];
      
      // Agrupar vendas por produto (usando código PDV como chave)
      const vendasPorProduto = new Map();
      vendas.forEach(venda => {
        const codigoPdv = venda.produto_codigo;
        if (!codigoPdv) return;
        
        if (!vendasPorProduto.has(codigoPdv)) {
          vendasPorProduto.set(codigoPdv, {
            quantidadeTotal: 0,
            valorTotal: 0,
            precoMedioVenda: 0
          });
        }
        
        const produtoVendas = vendasPorProduto.get(codigoPdv);
        produtoVendas.quantidadeTotal += parseFloat(venda.quantidade) || 0;
        produtoVendas.valorTotal += parseFloat(venda.valor_total) || 0;
        produtoVendas.precoMedioVenda = produtoVendas.valorTotal / produtoVendas.quantidadeTotal;
      });
      
      // Calcular margem ponderada baseada nas vendas reais
      let totalMargemPonderada = 0;
      let totalFaturamento = 0;
      
      vendasPorProduto.forEach((vendasProduto, codigoPdv) => {
        // Encontrar o produto correspondente
        const produto = produtosAtivos.find(p => p.codigo_pdv === codigoPdv);
        if (!produto) return;
        
        const precoVenda = vendasProduto.precoMedioVenda; // Preço real de venda
        const custoUnitario = custoPorProduto.get(produto.id) || 0;
        
        // Evita divisão por zero
        if (precoVenda <= 0 || custoUnitario < 0) return;
        
        // Margem unitária baseada no preço real de venda
        const margemUnitaria = (precoVenda - custoUnitario) / precoVenda;
        
        // Peso: quanto esse produto representa do faturamento total real
        const peso = vendasProduto.valorTotal;
        
        totalMargemPonderada += margemUnitaria * peso;
        totalFaturamento += peso;
      });
      
      // Se não há vendas reais, usar fallback com produtos cadastrados
      if (totalFaturamento === 0) {
        produtosAtivos.forEach(produto => {
          const precoVenda = produto.preco_venda || 0;
          const custoUnitario = custoPorProduto.get(produto.id) || 0;
          
          if (precoVenda > 0 && custoUnitario >= 0) {
            const margemUnitaria = (precoVenda - custoUnitario) / precoVenda;
            totalMargemPonderada += margemUnitaria;
            totalFaturamento += 1;
          }
        });
      }
       
      // Margem ponderada final
      const margemContribuicaoPonderada = totalFaturamento > 0
        ? Math.round((totalMargemPonderada / totalFaturamento) * 10000) / 100
        : 0;
       
      // --- FIM DO CÁLCULO ---
      
      const produtosLucrativos = produtos.filter(p => (p.margem_lucro || 0) > 30).length;
      const alertasPreco = produtos.filter(p => !p.preco_venda || p.preco_venda <= 0).length;
      
      // Calcular vendas do mês atual
      const vendasMes = vendasSumResult.data && Array.isArray(vendasSumResult.data) 
        ? vendasSumResult.data.reduce((total, venda) => total + (parseFloat(venda.valor_total) || 0), 0)
        : 0;
      
      
      setStats({
        totalProdutos,
        margemContribuicaoPonderada: margemContribuicaoPonderada || 0,
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
