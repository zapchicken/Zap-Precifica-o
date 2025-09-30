import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DebugInfo() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight
      },
      env: {
        NODE_ENV: import.meta.env.NODE_ENV,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Definida' : 'Não definida',
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida'
      }
    };

    setInfo(debugInfo);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🐛 Informações de Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">🌍 Ambiente</h4>
            <div className="space-y-1 text-sm">
              <div>Modo: <Badge variant="outline">{info.env?.MODE || 'N/A'}</Badge></div>
              <div>Dev: <Badge variant={info.env?.DEV ? 'default' : 'secondary'}>{info.env?.DEV ? 'Sim' : 'Não'}</Badge></div>
              <div>Prod: <Badge variant={info.env?.PROD ? 'default' : 'secondary'}>{info.env?.PROD ? 'Sim' : 'Não'}</Badge></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">🔧 Variáveis</h4>
            <div className="space-y-1 text-sm">
              <div>Supabase URL: <Badge variant={info.env?.VITE_SUPABASE_URL === 'Definida' ? 'default' : 'destructive'}>{info.env?.VITE_SUPABASE_URL || 'N/A'}</Badge></div>
              <div>Supabase Key: <Badge variant={info.env?.VITE_SUPABASE_ANON_KEY === 'Definida' ? 'default' : 'destructive'}>{info.env?.VITE_SUPABASE_ANON_KEY || 'N/A'}</Badge></div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">📍 Localização</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>URL: {info.url || 'N/A'}</div>
            <div>Host: {info.host || 'N/A'}</div>
            <div>Path: {info.pathname || 'N/A'}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">📱 Tela</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Resolução: {info.screen?.width}x{info.screen?.height}</div>
            <div>Disponível: {info.screen?.availWidth}x{info.screen?.availHeight}</div>
            <div>Janela: {info.window?.innerWidth}x{info.window?.innerHeight}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">⏰ Timestamp</h4>
          <div className="text-xs text-muted-foreground">
            {info.timestamp || 'N/A'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
