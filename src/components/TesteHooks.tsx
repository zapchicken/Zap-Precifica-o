import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProdutos } from '@/hooks/useProdutos';
import { useCategorias } from '@/hooks/useCategorias';
import { useFichas } from '@/hooks/useFichas';
import { useMarkup } from '@/hooks/useMarkup';
import { useAuth } from '@/contexts/AuthContext';

export function TesteHooks() {
  const [resultados, setResultados] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Testar todos os hooks
  const { user } = useAuth();
  const { produtos, loading: produtosLoading, error: produtosError } = useProdutos();
  const { categorias, loading: categoriasLoading } = useCategorias();
  const { fichas, loading: fichasLoading } = useFichas();
  const { canaisVenda, configCategorias, configGeral, loading: markupLoading } = useMarkup();

  useEffect(() => {
    const testarHooks = () => {
      const resultados = {
        auth: {
          usuario: user ? '✅ Autenticado' : '❌ Não autenticado',
          userId: user?.id || 'N/A',
          email: user?.email || 'N/A'
        },
        produtos: {
          status: produtosError ? '❌ Erro' : '✅ OK',
          loading: produtosLoading,
          quantidade: produtos?.length || 0,
          erro: produtosError || null
        },
        categorias: {
          status: '✅ OK',
          loading: categoriasLoading,
          quantidade: categorias?.length || 0,
          erro: null
        },
        fichas: {
          status: '✅ OK',
          loading: fichasLoading,
          quantidade: fichas?.length || 0,
          erro: null
        },
        markup: {
          status: '✅ OK',
          loading: markupLoading,
          canais: canaisVenda?.length || 0,
          configCategorias: configCategorias?.length || 0,
          configGeral: configGeral ? '✅ Configurado' : '❌ Não configurado',
          erro: null
        }
      };

      setResultados(resultados);
      setLoading(false);
    };

    // Aguardar um pouco para os hooks carregarem
    const timer = setTimeout(testarHooks, 2000);
    return () => clearTimeout(timer);
  }, [user, produtos, categorias, fichas, canaisVenda, configCategorias, configGeral, produtosLoading, categoriasLoading, fichasLoading, markupLoading, produtosError]);

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return '🟢';
    if (status.includes('❌')) return '🔴';
    return '🟡';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔄 Testando Hooks...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Carregando dados dos hooks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de Hooks da Página Produtos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            🔄 Recarregar Teste
          </Button>
        </CardContent>
      </Card>

      {/* Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(resultados.auth?.usuario || '')}
            Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Usuário:</span>
            <Badge variant={resultados.auth?.usuario?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.auth?.usuario || 'Verificando...'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {resultados.auth?.userId || 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Email: {resultados.auth?.email || 'N/A'}
          </div>
        </CardContent>
      </Card>

      {/* Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(resultados.produtos?.status || '')}
            Hook useProdutos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={resultados.produtos?.status?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.produtos?.status || 'Verificando...'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Loading:</span>
            <Badge variant={resultados.produtos?.loading ? 'secondary' : 'outline'}>
              {resultados.produtos?.loading ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Quantidade:</span>
            <Badge variant="outline">
              {resultados.produtos?.quantidade || 0} produtos
            </Badge>
          </div>
          {resultados.produtos?.erro && (
            <div className="text-xs text-red-500">
              Erro: {resultados.produtos.erro}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(resultados.categorias?.status || '')}
            Hook useCategorias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={resultados.categorias?.status?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.categorias?.status || 'Verificando...'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Loading:</span>
            <Badge variant={resultados.categorias?.loading ? 'secondary' : 'outline'}>
              {resultados.categorias?.loading ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Quantidade:</span>
            <Badge variant="outline">
              {resultados.categorias?.quantidade || 0} categorias
            </Badge>
          </div>
          {resultados.categorias?.erro && (
            <div className="text-xs text-red-500">
              Erro: {resultados.categorias.erro}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fichas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(resultados.fichas?.status || '')}
            Hook useFichas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={resultados.fichas?.status?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.fichas?.status || 'Verificando...'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Loading:</span>
            <Badge variant={resultados.fichas?.loading ? 'secondary' : 'outline'}>
              {resultados.fichas?.loading ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Quantidade:</span>
            <Badge variant="outline">
              {resultados.fichas?.quantidade || 0} fichas
            </Badge>
          </div>
          {resultados.fichas?.erro && (
            <div className="text-xs text-red-500">
              Erro: {resultados.fichas.erro}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Markup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(resultados.markup?.status || '')}
            Hook useMarkup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={resultados.markup?.status?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.markup?.status || 'Verificando...'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Loading:</span>
            <Badge variant={resultados.markup?.loading ? 'secondary' : 'outline'}>
              {resultados.markup?.loading ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Canais:</span>
            <Badge variant="outline">
              {resultados.markup?.canais || 0} canais
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Config Categorias:</span>
            <Badge variant="outline">
              {resultados.markup?.configCategorias || 0} configs
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Config Geral:</span>
            <Badge variant={resultados.markup?.configGeral?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.markup?.configGeral || 'Verificando...'}
            </Badge>
          </div>
          {resultados.markup?.erro && (
            <div className="text-xs text-red-500">
              Erro: {resultados.markup.erro}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
