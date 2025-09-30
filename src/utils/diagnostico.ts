// Utilitário para diagnóstico de problemas de conexão
import { supabase } from '@/lib/supabase';

export interface DiagnosticoResultado {
  variaveisAmbiente: {
    url: string;
    key: string;
    urlValue: string;
    keyValue: string;
  };
  conexaoSupabase: {
    status: string;
    erro?: string;
  };
  autenticacao: {
    usuario: string;
    userId: string;
    email: string;
  };
  produtos: {
    status: string;
    quantidade: number;
    erro?: string;
    amostra?: any[];
  };
  ambiente: {
    modo: string;
    dev: boolean;
    prod: boolean;
    baseUrl: string;
  };
  erroGeral?: string;
}

export async function executarDiagnosticoCompleto(): Promise<DiagnosticoResultado> {
  const resultados: DiagnosticoResultado = {
    variaveisAmbiente: {
      url: '',
      key: '',
      urlValue: '',
      keyValue: ''
    },
    conexaoSupabase: {
      status: ''
    },
    autenticacao: {
      usuario: '',
      userId: '',
      email: ''
    },
    produtos: {
      status: '',
      quantidade: 0
    },
    ambiente: {
      modo: '',
      dev: false,
      prod: false,
      baseUrl: ''
    }
  };

  try {
    // 1. Verificar variáveis de ambiente
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    resultados.variaveisAmbiente = {
      url: supabaseUrl ? '✅ Configurada' : '❌ Não configurada',
      key: supabaseKey ? '✅ Configurada' : '❌ Não configurada',
      urlValue: supabaseUrl || '',
      keyValue: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : ''
    };

    // 2. Verificar conexão com Supabase
    try {
      const { data, error } = await supabase.from('produtos').select('count').limit(1);
      resultados.conexaoSupabase = {
        status: error ? '❌ Erro' : '✅ Conectado',
        erro: error?.message || undefined
      };
    } catch (err: any) {
      resultados.conexaoSupabase = {
        status: '❌ Erro',
        erro: err.message
      };
    }

    // 3. Verificar autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    resultados.autenticacao = {
      usuario: user ? '✅ Autenticado' : '❌ Não autenticado',
      userId: user?.id || 'N/A',
      email: user?.email || 'N/A'
    };

    // 4. Verificar produtos do usuário
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('user_id', user.id)
          .limit(5);

        resultados.produtos = {
          status: error ? '❌ Erro' : '✅ Carregados',
          quantidade: data?.length || 0,
          erro: error?.message || undefined,
          amostra: data?.slice(0, 3) || []
        };
      } catch (err: any) {
        resultados.produtos = {
          status: '❌ Erro',
          erro: err.message,
          quantidade: 0
        };
      }
    } else {
      resultados.produtos = {
        status: '⚠️ Usuário não autenticado',
        quantidade: 0
      };
    }

    // 5. Verificar ambiente
    resultados.ambiente = {
      modo: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      baseUrl: window.location.origin
    };

  } catch (err: any) {
    resultados.erroGeral = err.message;
  }

  return resultados;
}

export function logDiagnostico(resultados: DiagnosticoResultado) {
  console.group('🔍 Diagnóstico do Supabase');
  
  console.log('📋 Variáveis de Ambiente:');
  console.log(`  URL: ${resultados.variaveisAmbiente.url}`);
  console.log(`  Key: ${resultados.variaveisAmbiente.key}`);
  
  console.log('🔗 Conexão Supabase:');
  console.log(`  Status: ${resultados.conexaoSupabase.status}`);
  if (resultados.conexaoSupabase.erro) {
    console.error(`  Erro: ${resultados.conexaoSupabase.erro}`);
  }
  
  console.log('👤 Autenticação:');
  console.log(`  Usuário: ${resultados.autenticacao.usuario}`);
  console.log(`  ID: ${resultados.autenticacao.userId}`);
  console.log(`  Email: ${resultados.autenticacao.email}`);
  
  console.log('📦 Produtos:');
  console.log(`  Status: ${resultados.produtos.status}`);
  console.log(`  Quantidade: ${resultados.produtos.quantidade}`);
  if (resultados.produtos.erro) {
    console.error(`  Erro: ${resultados.produtos.erro}`);
  }
  
  console.log('🌍 Ambiente:');
  console.log(`  Modo: ${resultados.ambiente.modo}`);
  console.log(`  Dev: ${resultados.ambiente.dev}`);
  console.log(`  Prod: ${resultados.ambiente.prod}`);
  console.log(`  URL: ${resultados.ambiente.baseUrl}`);
  
  if (resultados.erroGeral) {
    console.error('❌ Erro Geral:', resultados.erroGeral);
  }
  
  console.groupEnd();
}
