import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { executarDiagnosticoCompleto, logDiagnostico, DiagnosticoResultado } from '@/utils/diagnostico';

export function DiagnosticoSupabase() {
  const [diagnostico, setDiagnostico] = useState<DiagnosticoResultado | null>(null);
  const [loading, setLoading] = useState(true);

  const executarDiagnostico = async () => {
    setLoading(true);
    try {
      const resultados = await executarDiagnosticoCompleto();
      setDiagnostico(resultados);
      logDiagnostico(resultados);
    } catch (err: any) {
      console.error('Erro ao executar diagnóstico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executarDiagnostico();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status.includes('❌')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status.includes('⚠️')) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Executando diagnóstico...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!diagnostico) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">❌ Erro no Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">
            Não foi possível executar o diagnóstico. Verifique o console para mais detalhes.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Diagnóstico do Supabase</CardTitle>
          <CardDescription>
            Verificação completa da configuração e conexão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={executarDiagnostico} className="w-full">
            🔄 Executar Diagnóstico Novamente
          </Button>
        </CardContent>
      </Card>

      {/* Variáveis de Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(diagnostico.variaveisAmbiente?.url || '')}
            Variáveis de Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>URL do Supabase:</span>
            <Badge variant={diagnostico.variaveisAmbiente?.url?.includes('✅') ? 'default' : 'destructive'}>
              {diagnostico.variaveisAmbiente?.url || 'Verificando...'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Chave Anônima:</span>
            <Badge variant={diagnostico.variaveisAmbiente?.key?.includes('✅') ? 'default' : 'destructive'}>
              {diagnostico.variaveisAmbiente?.key || 'Verificando...'}
            </Badge>
          </div>
          {diagnostico.variaveisAmbiente?.urlValue && (
            <div className="text-xs text-muted-foreground break-all">
              URL: {diagnostico.variaveisAmbiente.urlValue}
            </div>
          )}
          {diagnostico.variaveisAmbiente?.keyValue && (
            <div className="text-xs text-muted-foreground break-all">
              Key: {diagnostico.variaveisAmbiente.keyValue}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conexão Supabase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(diagnostico.conexaoSupabase?.status || '')}
            Conexão com Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={diagnostico.conexaoSupabase?.status?.includes('✅') ? 'default' : 'destructive'}>
              {diagnostico.conexaoSupabase?.status || 'Verificando...'}
            </Badge>
          </div>
          {diagnostico.conexaoSupabase?.erro && (
            <div className="text-xs text-red-500 mt-2">
              Erro: {diagnostico.conexaoSupabase.erro}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(diagnostico.autenticacao?.usuario || '')}
            Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Usuário:</span>
            <Badge variant={diagnostico.autenticacao?.usuario?.includes('✅') ? 'default' : 'destructive'}>
              {diagnostico.autenticacao?.usuario || 'Verificando...'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {diagnostico.autenticacao?.userId || 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Email: {diagnostico.autenticacao?.email || 'N/A'}
          </div>
        </CardContent>
      </Card>

      {/* Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(diagnostico.produtos?.status || '')}
            Produtos do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={diagnostico.produtos?.status?.includes('✅') ? 'default' : 'destructive'}>
              {diagnostico.produtos?.status || 'Verificando...'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Quantidade:</span>
            <Badge variant="outline">
              {diagnostico.produtos?.quantidade || 0} produtos
            </Badge>
          </div>
          {diagnostico.produtos?.erro && (
            <div className="text-xs text-red-500">
              Erro: {diagnostico.produtos.erro}
            </div>
          )}
          {diagnostico.produtos?.amostra?.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Amostra: {diagnostico.produtos.amostra.map((p: any) => p.nome).join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Informações do Ambiente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Modo:</span>
            <Badge variant="outline">{diagnostico.ambiente?.modo || 'N/A'}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Desenvolvimento:</span>
            <Badge variant={diagnostico.ambiente?.dev ? 'default' : 'secondary'}>
              {diagnostico.ambiente?.dev ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Produção:</span>
            <Badge variant={diagnostico.ambiente?.prod ? 'default' : 'secondary'}>
              {diagnostico.ambiente?.prod ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            URL: {diagnostico.ambiente?.baseUrl || 'N/A'}
          </div>
        </CardContent>
      </Card>

      {diagnostico.erroGeral && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">❌ Erro Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 text-sm">
              {diagnostico.erroGeral}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}