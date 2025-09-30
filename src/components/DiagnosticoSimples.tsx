import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export function DiagnosticoSimples() {
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState<any>({});

  useEffect(() => {
    const executarDiagnostico = async () => {
      setLoading(true);
      
      try {
        // Verificar variáveis de ambiente
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        const diagnostico = {
          variaveis: {
            url: supabaseUrl ? '✅ Configurada' : '❌ Não configurada',
            key: supabaseKey ? '✅ Configurada' : '❌ Não configurada',
            urlValue: supabaseUrl || 'Não definida',
            keyValue: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Não definida'
          },
          ambiente: {
            modo: import.meta.env.MODE,
            dev: import.meta.env.DEV,
            prod: import.meta.env.PROD,
            baseUrl: window.location.origin
          }
        };

        setResultados(diagnostico);
      } catch (error) {
        console.error('Erro no diagnóstico:', error);
        setResultados({ erro: 'Erro ao executar diagnóstico' });
      } finally {
        setLoading(false);
      }
    };

    executarDiagnostico();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status.includes('❌')) return <XCircle className="h-4 w-4 text-red-500" />;
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Diagnóstico Simples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            🔄 Recarregar Página
          </Button>
        </CardContent>
      </Card>

      {/* Variáveis de Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(resultados.variaveis?.url || '')}
            Variáveis de Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>URL do Supabase:</span>
            <Badge variant={resultados.variaveis?.url?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.variaveis?.url || 'Verificando...'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Chave Anônima:</span>
            <Badge variant={resultados.variaveis?.key?.includes('✅') ? 'default' : 'destructive'}>
              {resultados.variaveis?.key || 'Verificando...'}
            </Badge>
          </div>
          {resultados.variaveis?.urlValue && (
            <div className="text-xs text-muted-foreground break-all">
              URL: {resultados.variaveis.urlValue}
            </div>
          )}
          {resultados.variaveis?.keyValue && (
            <div className="text-xs text-muted-foreground break-all">
              Key: {resultados.variaveis.keyValue}
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
            <Badge variant="outline">{resultados.ambiente?.modo || 'N/A'}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Desenvolvimento:</span>
            <Badge variant={resultados.ambiente?.dev ? 'default' : 'secondary'}>
              {resultados.ambiente?.dev ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Produção:</span>
            <Badge variant={resultados.ambiente?.prod ? 'default' : 'secondary'}>
              {resultados.ambiente?.prod ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            URL: {resultados.ambiente?.baseUrl || 'N/A'}
          </div>
        </CardContent>
      </Card>

      {resultados.erro && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">❌ Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 text-sm">
              {resultados.erro}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
