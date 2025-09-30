import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TesteSimples() {
  const [contador, setContador] = useState(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Teste Simples</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Contador: {contador}</p>
          <Button onClick={() => setContador(contador + 1)}>
            Incrementar
          </Button>
          <p className="text-sm text-muted-foreground">
            Se você consegue ver este componente, a página está funcionando.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
