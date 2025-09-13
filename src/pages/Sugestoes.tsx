import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Zap,
  Target,
  Gift,
  DollarSign,
  Sparkles,
  ChefHat,
  Crown,
  Percent,
  MessageCircle,
  Send,
  BarChart3,
  PieChart,
  LineChart,
  Bot,
  User,
  Clock,
  Trash2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessage {
  id: string
  tipo: 'user' | 'ai'
  conteudo: string
  timestamp: Date
  dados?: any
  graficos?: any[]
}

// Dados mock para demonstração
const mockSugestoes = {
  metricas: {
    oportunidades: 8,
    potencialGanho: 2450,
    alertas: 3,
    confiabilidade: 87
  },
  precos: [
    {
      id: "1",
      produto: "Hambúrguer Artesanal",
      categoria: "recomendado",
      justificativa: "Produto com alta demanda e margem baixa. Aumento sugerido baseado na análise de concorrência.",
      precoAtual: 18.50,
      precoSugerido: 21.90,
      impacto: "+15% margem",
      confianca: 92
    },
    {
      id: "2",
      produto: "Batata Frita Especial",
      categoria: "oportunidade",
      justificativa: "Acompanhamento popular com potencial de aumento. Clientes aceitam preço premium.",
      precoAtual: 8.90,
      precoSugerido: 10.50,
      impacto: "+18% margem",
      confianca: 85
    },
    {
      id: "3",
      produto: "Refrigerante 350ml",
      categoria: "crítico",
      justificativa: "Preço muito baixo comparado ao custo. Necessário reajuste urgente.",
      precoAtual: 4.50,
      precoSugerido: 6.00,
      impacto: "+33% margem",
      confianca: 95
    }
  ],
  promocoes: [
    {
      id: "1",
      titulo: "Combo Família Feliz",
      tipo: "Bundle",
      descricao: "2 Hambúrguers + 2 Batatas + 2 Refrigerantes por R$ 45,90",
      impactoVendas: "+25% volume",
      impactoMargem: "Mantém 35%",
      periodo: "Fins de semana",
      icone: <Gift className="h-6 w-6 text-accent" />
    },
    {
      id: "2",
      titulo: "Happy Hour Executivo",
      tipo: "Desconto",
      descricao: "15% off em pratos executivos das 11h às 14h",
      impactoVendas: "+40% almoço",
      impactoMargem: "Reduz 5%",
      periodo: "Segunda a sexta",
      icone: <Clock className="h-6 w-6 text-accent" />
    }
  ],
  alertas: [
    {
      produto: "Pizza Margherita",
      urgencia: "alta",
      margemAtual: "12%",
      problema: "Custo dos ingredientes subiu 20% no último mês",
      sugestao: "Aumentar preço para R$ 32,90 ou revisar fornecedores"
    },
    {
      produto: "Salada Caesar",
      urgencia: "média",
      margemAtual: "18%",
      problema: "Margem abaixo do ideal para categoria",
      sugestao: "Otimizar porções ou aumentar preço em R$ 3,00"
    },
    {
      produto: "Suco Natural",
      urgencia: "baixa",
      margemAtual: "22%",
      problema: "Sazonalidade das frutas afeta custo",
      sugestao: "Considerar cardápio sazonal ou fornecedores alternativos"
    }
  ],
  analise: "Seus dados mostram um crescimento de 15% nas vendas este mês. Os hambúrguers artesanais são seus produtos mais rentáveis, enquanto as bebidas precisam de atenção nos preços. Recomendo focar em combos para aumentar o ticket médio e revisar a precificação de 3 produtos específicos que estão com margem abaixo do ideal."
}

export default function Sugestoes() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [sugestoes, setSugestoes] = useState<any>(mockSugestoes)
  const [loading, setLoading] = useState(false)
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  
  useEffect(() => {
    carregarHistoricoChat()
  }, [])

  const carregarHistoricoChat = () => {
    const historico = localStorage.getItem('chat-ia-historico')
    if (historico) {
      const messages = JSON.parse(historico).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      setChatMessages(messages)
    } else {
      // Mensagem de boas-vindas
      const welcomeMessage: ChatMessage = {
        id: '1',
        tipo: 'ai',
        conteudo: 'Olá! 👋 Sou seu assistente de IA especializado em análise de dados do restaurante. Posso ajudar você com:\n\n• Análise de vendas e produtos\n• Sugestões de preços e margens\n• Tendências e oportunidades\n• Comparação de períodos\n• Insights sobre rentabilidade\n\nO que gostaria de saber?',
        timestamp: new Date()
      }
      setChatMessages([welcomeMessage])
    }
  }

  const salvarHistoricoChat = (messages: ChatMessage[]) => {
    localStorage.setItem('chat-ia-historico', JSON.stringify(messages))
  }

  const handleGerarSugestoes = async () => {
    setIsGenerating(true)
    setLoading(true)
    try {
      toast.info('Analisando dados com IA...')
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular pequenas variações nos dados
      const novasSugestoes = {
        ...mockSugestoes,
        metricas: {
          ...mockSugestoes.metricas,
          oportunidades: Math.floor(Math.random() * 5) + 6,
          potencialGanho: Math.floor(Math.random() * 1000) + 2000,
          alertas: Math.floor(Math.random() * 3) + 2,
          confiabilidade: Math.floor(Math.random() * 10) + 85
        }
      }
      
      setSugestoes(novasSugestoes)
      toast.success('Novas sugestões geradas!')
    } finally {
      setIsGenerating(false)
      setLoading(false)
    }
  }

  const getConfidenceColor = (confianca: number) => {
    if (confianca >= 90) return "text-success"
    if (confianca >= 75) return "text-warning"
    return "text-destructive"
  }

  const getCategoriaColor = (categoria: string) => {
    switch(categoria) {
      case "crítico": return "bg-destructive/10 text-destructive border-destructive/20"
      case "recomendado": return "bg-success/10 text-success border-success/20"
      case "oportunidade": return "bg-primary/10 text-primary border-primary/20"
      default: return "bg-muted/50 text-muted-foreground"
    }
  }

  const getUrgenciaColor = (urgencia: string) => {
    switch(urgencia) {
      case "alta": return "text-destructive"
      case "média": return "text-warning"
      case "baixa": return "text-success"
      default: return "text-muted-foreground"
    }
  }

  const enviarMensagem = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      tipo: 'user',
      conteudo: inputMessage,
      timestamp: new Date()
    }

    const updatedMessages = [...chatMessages, userMessage]
    setChatMessages(updatedMessages)
    setInputMessage("")
    setIsChatLoading(true)

    try {
      // Simular delay de processamento da IA
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Respostas mock baseadas na pergunta
      let resposta = "Obrigado pela pergunta! "
      
      if (inputMessage.toLowerCase().includes('margem')) {
        resposta += "Analisando suas margens, vejo que os hambúrguers têm as melhores margens (35-40%), enquanto as bebidas precisam de atenção. Recomendo revisar os preços dos refrigerantes."
      } else if (inputMessage.toLowerCase().includes('vendas')) {
        resposta += "Suas vendas estão crescendo 15% este mês! Os produtos mais vendidos são hambúrguers artesanais e batatas especiais. O horário de pico é entre 19h-21h."
      } else if (inputMessage.toLowerCase().includes('preço')) {
        resposta += "Identifiquei 3 produtos que precisam de ajuste de preço: Hambúrguer Artesanal (+R$3,40), Batata Especial (+R$1,60) e Refrigerante (+R$1,50). Isso pode aumentar sua margem em 18%."
      } else if (inputMessage.toLowerCase().includes('tendência')) {
        resposta += "As tendências mostram crescimento em pratos vegetarianos (+25%) e combos familiares (+30%). Considere expandir essas categorias."
      } else {
        resposta += "Com base nos seus dados, posso ajudar com análises específicas. Que tal perguntar sobre margens, vendas, preços ou tendências?"
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        tipo: 'ai',
        conteudo: resposta,
        timestamp: new Date()
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setChatMessages(finalMessages)
      salvarHistoricoChat(finalMessages)

    } catch (error) {
      console.error('Erro no chat:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        tipo: 'ai',
        conteudo: 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente em alguns instantes.',
        timestamp: new Date()
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setChatMessages(finalMessages)
      toast.error('Erro ao processar pergunta')
    } finally {
      setIsChatLoading(false)
    }
  }

  const limparHistorico = () => {
    setChatMessages([])
    localStorage.removeItem('chat-ia-historico')
    carregarHistoricoChat()
    toast.success('Histórico de chat limpo')
  }

  const renderGrafico = (grafico: any) => {
    switch (grafico.tipo) {
      case 'barras':
        return (
          <div className="bg-muted/30 p-4 rounded-lg my-2">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{grafico.titulo}</span>
            </div>
            <div className="space-y-1">
              {grafico.dados.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs w-20 truncate">{item.nome}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(item.valor / Math.max(...grafico.dados.map((d: any) => d.valor))) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{item.valor}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'pizza':
        return (
          <div className="bg-muted/30 p-4 rounded-lg my-2">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">{grafico.titulo}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {grafico.dados.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-primary opacity-${100 - index * 20}`} />
                  <span>{item.nome}: {item.valor}%</span>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Layout currentPage="sugestoes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sugestões com IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Análises inteligentes baseadas em dados de vendas e custos
            </p>
          </div>
          
          <Button 
            variant="accent" 
            onClick={handleGerarSugestoes}
            disabled={isGenerating}
            className="w-fit"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Gerar Novas Sugestões
              </>
            )}
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Oportunidades</p>
                  <p className="text-2xl font-bold text-success">{sugestoes?.metricas?.oportunidades || 0}</p>
                  <p className="text-xs text-success">+R$ {sugestoes?.metricas?.potencialGanho || 0}/mês potencial</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alertas</p>
                  <p className="text-2xl font-bold text-warning">{sugestoes?.metricas?.alertas || 0}</p>
                  <p className="text-xs text-warning">Produtos precisam revisão</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última Análise</p>
                  <p className="text-lg font-bold">{loading ? 'Carregando...' : 'Agora'}</p>
                  <p className="text-xs text-primary">{sugestoes?.metricas?.confiabilidade || 0}% confiabilidade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="precos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="precos" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ajuste de Preços
            </TabsTrigger>
            <TabsTrigger value="promocoes" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Promoções
            </TabsTrigger>
            <TabsTrigger value="alertas" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas de Margem
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat com IA
            </TabsTrigger>
          </TabsList>

          {/* Sugestões de Preços */}
          <TabsContent value="precos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Sugestões de Reajuste de Preços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Analisando dados...</p>
                ) : sugestoes?.precos?.length > 0 ? (
                  sugestoes.precos.map((sugestao: any) => (
                  <Card key={sugestao.id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{sugestao.produto}</h3>
                          <Badge className={getCategoriaColor(sugestao.categoria)}>
                            {sugestao.categoria}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{sugestao.justificativa}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Preço atual: <strong>R$ {sugestao.precoAtual.toFixed(2)}</strong></span>
                          <span>→</span>
                          <span>Sugerido: <strong className="text-success">R$ {sugestao.precoSugerido.toFixed(2)}</strong></span>
                          <Badge variant="outline" className="text-success">
                            {sugestao.impacto}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Confiança</p>
                          <p className={`text-xl font-bold ${getConfidenceColor(sugestao.confianca)}`}>
                            {sugestao.confianca}%
                          </p>
                        </div>
                        <Button variant="success" size="sm">
                          Aplicar Sugestão
                        </Button>
                      </div>
                    </div>
                  </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma sugestão de preço disponível no momento
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sugestões de Promoções */}
          <TabsContent value="promocoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Promoções Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Analisando dados...</p>
                ) : sugestoes?.promocoes?.length > 0 ? (
                  sugestoes.promocoes.map((promocao: any) => (
                  <Card key={promocao.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        {promocao.icone}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{promocao.titulo}</h3>
                          <Badge variant="outline">{promocao.tipo}</Badge>
                        </div>
                        <p className="text-muted-foreground">{promocao.descricao}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span>{promocao.impactoVendas}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span>{promocao.impactoMargem}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-accent" />
                            <span>{promocao.periodo}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="accent" size="sm">
                        Implementar
                      </Button>
                    </div>
                  </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma sugestão de promoção disponível no momento
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertas de Margem */}
          <TabsContent value="alertas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Produtos com Baixa Rentabilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Analisando dados...</p>
                ) : sugestoes?.alertas?.length > 0 ? (
                  sugestoes.alertas.map((alerta: any, index: number) => (
                  <Card key={index} className="p-4 border-l-4 border-l-warning">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{alerta.produto}</h3>
                          <Badge variant="outline" className={getUrgenciaColor(alerta.urgencia)}>
                            Urgência {alerta.urgencia}
                          </Badge>
                          <Badge variant="destructive">
                            Margem: {alerta.margemAtual}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Problema:</strong> {alerta.problema}
                        </p>
                        <p className="text-sm">
                          <strong>Sugestão:</strong> {alerta.sugestao}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                        <Button variant="warning" size="sm">
                          Resolver
                        </Button>
                      </div>
                    </div>
                  </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum alerta de margem no momento
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat com IA */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Chat com IA sobre seus dados
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {chatMessages.length} mensagens
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={limparHistorico}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex gap-3 ${message.tipo === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.tipo === 'ai' && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${message.tipo === 'user' ? 'order-1' : ''}`}>
                          <div className={`p-3 rounded-lg ${
                            message.tipo === 'user' 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted'
                          }`}>
                            {message.conteudo.split('\n').map((line, index) => (
                              <p key={index} className={`${index > 0 ? 'mt-2' : ''} text-sm`}>
                                {line}
                              </p>
                            ))}
                          </div>
                          
                          {/* Render gráficos se houver */}
                          {message.graficos && message.graficos.map((grafico, index) => (
                            <div key={index}>
                              {renderGrafico(grafico)}
                            </div>
                          ))}
                          
                          <p className="text-xs text-muted-foreground mt-1 px-1">
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        
                        {message.tipo === 'user' && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-accent" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isChatLoading && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary animate-pulse" />
                          </div>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Pergunte sobre vendas, produtos, margens, tendências..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && enviarMensagem()}
                        disabled={isChatLoading}
                        className="resize-none"
                      />
                    </div>
                    <Button 
                      onClick={enviarMensagem} 
                      disabled={!inputMessage.trim() || isChatLoading}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Sugestões de perguntas */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      "Quais produtos têm maior margem?",
                      "Como estão as vendas este mês?",
                      "Que preços devo ajustar?",
                      "Análise de tendências"
                    ].map((sugestao) => (
                      <Button
                        key={sugestao}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setInputMessage(sugestao)}
                        disabled={isChatLoading}
                      >
                        {sugestao}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Análise com IA */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              💡 Insight do Chef Digital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Análise principal desta semana:</strong>
              </p>
              <p className="text-muted-foreground">
                {loading 
                  ? 'Analisando seus dados para gerar insights personalizados...'
                  : sugestoes?.analise || 'Análise indisponível no momento. Por favor, tente gerar novas sugestões.'
                }
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Badge className="bg-success/10 text-success">
                  <Crown className="h-3 w-3 mr-1" />
                  Recomendação Premium
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {loading 
                    ? 'Processando dados...' 
                    : `Baseado nos dados mais recentes do seu negócio`
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}