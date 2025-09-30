import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProdutos } from '@/hooks/useProdutos';

export function VerificarFiltros() {
  const [filtros, setFiltros] = useState<any>({});
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);
  
  const { produtos } = useProdutos();

  useEffect(() => {
    const verificarFiltros = () => {
      // Simular os filtros que a página usa
      const searchTerm = localStorage.getItem('produtos_searchTerm') || '';
      const selectedCategory = localStorage.getItem('produtos_selectedCategory') || 'all';
      const selectedStatusPreco = localStorage.getItem('produtos_selectedStatusPreco') || 'all';

      // Aplicar os mesmos filtros que a página usa
      let produtosFiltrados = produtos || [];

      // Filtro por termo de busca
      if (searchTerm) {
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.codigo_pdv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtro por categoria
      if (selectedCategory !== 'all') {
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.categoria === selectedCategory
        );
      }

      // Filtro por status de preço
      if (selectedStatusPreco !== 'all') {
        if (selectedStatusPreco === 'sem_custo') {
          produtosFiltrados = produtosFiltrados.filter(produto => !produto.preco_custo);
        } else if (selectedStatusPreco === 'com_custo') {
          produtosFiltrados = produtosFiltrados.filter(produto => produto.preco_custo);
        }
      }

      setFiltros({
        searchTerm,
        selectedCategory,
        selectedStatusPreco,
        totalProdutos: produtos?.length || 0,
        produtosFiltrados: produtosFiltrados.length
      });

      setProdutosFiltrados(produtosFiltrados.slice(0, 10)); // Primeiros 10
    };

    verificarFiltros();
  }, [produtos]);

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return '🟢';
    if (status.includes('❌')) return '🔴';
    return '🟡';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Verificação de Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            🔄 Recarregar Verificação
          </Button>
        </CardContent>
      </Card>

      {/* Filtros Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Filtros Ativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Termo de Busca:</span>
            <Badge variant={filtros.searchTerm ? 'default' : 'outline'}>
              {filtros.searchTerm || 'Nenhum'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Categoria:</span>
            <Badge variant={filtros.selectedCategory !== 'all' ? 'default' : 'outline'}>
              {filtros.selectedCategory || 'Todas'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Status Preço:</span>
            <Badge variant={filtros.selectedStatusPreco !== 'all' ? 'default' : 'outline'}>
              {filtros.selectedStatusPreco || 'Todos'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resultados dos Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Total de Produtos:</span>
            <Badge variant="outline">
              {filtros.totalProdutos || 0}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Produtos Filtrados:</span>
            <Badge variant={filtros.produtosFiltrados > 0 ? 'default' : 'destructive'}>
              {filtros.produtosFiltrados || 0}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Diferença:</span>
            <Badge variant="outline">
              {filtros.totalProdutos - filtros.produtosFiltrados} ocultos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Amostra dos Produtos Filtrados */}
      {produtosFiltrados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amostra dos Produtos Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {produtosFiltrados.map((produto, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">{produto.nome}</div>
                  <div className="text-xs text-gray-500">
                    Categoria: {produto.categoria || 'N/A'} | 
                    Código: {produto.codigo_pdv || 'N/A'} |
                    Custo: {produto.preco_custo ? `R$ ${produto.preco_custo}` : 'Sem custo'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {filtros.totalProdutos === 0 && (
              <div className="text-red-500">❌ Nenhum produto carregado</div>
            )}
            {filtros.totalProdutos > 0 && filtros.produtosFiltrados === 0 && (
              <div className="text-orange-500">⚠️ Produtos carregados mas filtros estão ocultando todos</div>
            )}
            {filtros.totalProdutos > 0 && filtros.produtosFiltrados > 0 && (
              <div className="text-green-500">✅ Produtos carregados e filtros funcionando - {filtros.produtosFiltrados} produtos visíveis</div>
            )}
            {filtros.searchTerm && (
              <div className="text-blue-500">🔍 Buscando por: "{filtros.searchTerm}"</div>
            )}
            {filtros.selectedCategory !== 'all' && (
              <div className="text-blue-500">📂 Filtrando categoria: "{filtros.selectedCategory}"</div>
            )}
            {filtros.selectedStatusPreco !== 'all' && (
              <div className="text-blue-500">💰 Filtrando status: "{filtros.selectedStatusPreco}"</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
