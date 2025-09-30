import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProdutos } from '@/hooks/useProdutos';
import { useAuth } from '@/contexts/AuthContext';

export function EstadoProdutos() {
  const [estado, setEstado] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { produtos, loading: produtosLoading, error: produtosError } = useProdutos();

  useEffect(() => {
    const verificarEstado = () => {
      const estado = {
        timestamp: new Date().toISOString(),
        usuario: {
          autenticado: !!user,
          id: user?.id || null,
          email: user?.email || null
        },
        produtos: {
          carregando: produtosLoading,
          erro: produtosError || null,
          quantidade: produtos?.length || 0,
          dados: produtos?.slice(0, 3) || [] // Primeiros 3 produtos
        },
        localStorage: {
          searchTerm: localStorage.getItem('produtos_searchTerm'),
          selectedCategory: localStorage.getItem('produtos_selectedCategory'),
          selectedStatusPreco: localStorage.getItem('produtos_selectedStatusPreco')
        },
        ambiente: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      setEstado(estado);
      setLoading(false);
    };

    const timer = setTimeout(verificarEstado, 1000);
    return () => clearTimeout(timer);
  }, [user, produtos, produtosLoading, produtosError]);

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === '✅') return '🟢';
    if (status === false || status === '❌') return '🔴';
    return '🟡';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔄 Verificando Estado...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Analisando estado da página...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📊 Estado da Página Produtos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            🔄 Recarregar Página
          </Button>
        </CardContent>
      </Card>

      {/* Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(estado.usuario?.autenticado)}
            Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Autenticado:</span>
            <Badge variant={estado.usuario?.autenticado ? 'default' : 'destructive'}>
              {estado.usuario?.autenticado ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {estado.usuario?.id || 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Email: {estado.usuario?.email || 'N/A'}
          </div>
        </CardContent>
      </Card>

      {/* Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(!estado.produtos?.erro && !estado.produtos?.carregando)}
            Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Carregando:</span>
            <Badge variant={estado.produtos?.carregando ? 'secondary' : 'outline'}>
              {estado.produtos?.carregando ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Quantidade:</span>
            <Badge variant="outline">
              {estado.produtos?.quantidade || 0} produtos
            </Badge>
          </div>
          {estado.produtos?.erro && (
            <div className="text-xs text-red-500">
              Erro: {typeof estado.produtos.erro === 'string' ? estado.produtos.erro : 'Erro desconhecido'}
            </div>
          )}
          {estado.produtos?.dados?.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Amostra: {estado.produtos.dados.map((p: any) => p.nome).join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* LocalStorage */}
      <Card>
        <CardHeader>
          <CardTitle>💾 LocalStorage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Search Term:</span>
            <Badge variant="outline">
              {estado.localStorage?.searchTerm || 'N/A'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <Badge variant="outline">
              {estado.localStorage?.selectedCategory || 'N/A'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Status Preço:</span>
            <Badge variant="outline">
              {estado.localStorage?.selectedStatusPreco || 'N/A'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Ambiente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-muted-foreground">
            URL: {estado.ambiente?.url || 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Timestamp: {estado.timestamp || 'N/A'}
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {!estado.usuario?.autenticado && (
              <div className="text-red-500">❌ Usuário não autenticado</div>
            )}
            {estado.usuario?.autenticado && estado.produtos?.carregando && (
              <div className="text-yellow-500">🟡 Produtos ainda carregando...</div>
            )}
            {estado.usuario?.autenticado && !estado.produtos?.carregando && estado.produtos?.quantidade === 0 && (
              <div className="text-orange-500">⚠️ Usuário autenticado mas sem produtos</div>
            )}
            {estado.usuario?.autenticado && !estado.produtos?.carregando && estado.produtos?.quantidade > 0 && (
              <div className="text-green-500">✅ Tudo funcionando - {estado.produtos.quantidade} produtos carregados</div>
            )}
            {estado.produtos?.erro && (
              <div className="text-red-500">❌ Erro ao carregar produtos: {typeof estado.produtos.erro === 'string' ? estado.produtos.erro : 'Erro desconhecido'}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
