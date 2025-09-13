import { Layout } from "@/components/Layout"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  Target,
  BarChart3,
  CheckCircle
} from "lucide-react"
import { useDashboardStats, useVendas } from "@/hooks/useSupabaseData"

export default function Dashboard() {
  const { stats, loading } = useDashboardStats()
  const { vendas } = useVendas()

  if (loading) {
    return (
      <Layout currentPage="dashboard">
        <div className="space-y-8">
          <div className="text-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do painel...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Calcular produtos top baseado nas vendas reais
  const produtosTop = vendas
    .reduce((acc: any[], venda: any) => {
      const existing = acc.find(p => p.nome === venda.produto_nome)
      if (existing) {
        existing.vendas += venda.valor_total
        existing.quantidade += venda.quantidade
      } else {
        acc.push({
          nome: venda.produto_nome,
          vendas: venda.valor_total,
          quantidade: venda.quantidade,
          margem: "Calculando..." // Seria calculado com base na ficha técnica
        })
      }
      return acc
    }, [])
    .sort((a: any, b: any) => b.vendas - a.vendas)
    .slice(0, 3)

  return (
    <Layout currentPage="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Painel Geral
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão completa do seu negócio - Dezembro 2024
            </p>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Produtos"
            value={stats.totalProdutos.toString()}
            subtitle="Cadastrados no sistema"
            icon={Package}
            trend="up" 
            trendValue={`${stats.totalProdutos} produtos ativos`}
            color="primary"
          />
          <StatCard
            title="Margem de Contribuição"
            value={`${stats.margemMedia.toFixed(1)}%`}
            subtitle="Média dos produtos cadastrados"
            icon={TrendingUp}
            trend="up"
            trendValue="Baseado nos produtos ativos"
            color="success"
          />
          <StatCard
            title="Produtos Lucrativos"
            value={stats.produtosLucrativos.toString()}
            subtitle="Margem acima de 30%"
            icon={Package}
            color="accent"
          />
          <StatCard
            title="Alertas de Preço"
            value={stats.alertasPreco.toString()}
            subtitle="Produtos precisam revisão"
            icon={AlertTriangle}
            color="warning"
            clickable={true}
            onClick={() => window.location.href = '/produtos'}
          />
        </div>

        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {produtosTop.length > 0 ? (
                produtosTop.map((produto: any, index: number) => (
                  <div key={index} className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="font-medium text-lg">{produto.nome}</p>
                    <p className="text-sm text-muted-foreground mb-2">Qtd: {produto.quantidade}</p>
                    <p className="font-bold text-primary text-xl">
                      R$ {produto.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma venda registrada ainda</p>
                  <p className="text-sm">Importe dados de vendas para ver os produtos mais vendidos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Recomendações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtos com Baixa Rentabilidade */}
          <Card className="border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Produtos com Baixa Rentabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.alertasPreco > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium">Produtos sem precificação</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.alertasPreco} produtos precisam de atenção
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-warning font-medium">Definir preços</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-sm">Todos os produtos estão precificados!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/insumos'}
              >
                <ShoppingCart className="h-4 w-4" />
                Atualizar Preços de Insumos
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/produtos'}
              >
                <Package className="h-4 w-4" />
                Cadastrar Novo Produto
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/fichas'}
              >
                <Package className="h-4 w-4" />
                Cadastrar Ficha Técnica
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/vendas'}
              >
                <TrendingUp className="h-4 w-4" />
                Analisar Tendências de Venda
              </Button>
              <Button 
                variant="accent" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/sugestoes'}
              >
                <Zap className="h-4 w-4" />
                Gerar Sugestões com IA
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Simulação de Lucro */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              💰 Simulação de Lucro do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase">Vendas do Mês</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {stats.vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase">Produtos Ativos</p>
                <p className="text-2xl font-bold text-success">{stats.totalProdutos}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase">Margem Média</p>
                <p className="text-3xl font-bold text-accent">{stats.margemMedia.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">dos produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}