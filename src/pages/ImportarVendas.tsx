import { useState, useEffect } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { processarVendas, salvarNoSupabase } from "@/utils/csvProcessor"
import { processarVendasFormatoImagem, salvarVendasFormatoImagem } from "@/utils/csvProcessorFormatoImagem"
import { useProdutos } from "@/hooks/useProdutos"
import { useMarkup } from "@/hooks/useMarkup"
import { supabase } from "@/lib/supabase"
import { 
  Upload, 
  FileText, 
  Check, 
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  BarChart3,
  Calculator,
  Target
} from "lucide-react"

// Tipos para importação
interface VendaImportada {
  id: string
  data: string
  pedido: string
  produto: string
  codigoPdv?: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  canal: string
  status: 'sucesso' | 'erro' | 'aviso'
  observacao?: string
}

interface ResumoImportacao {
  totalVendas: number
  valorTotal: number
  sucessos: number
  erros: number
  avisos: number
  dataInicio?: string
  dataFim?: string
}

interface AnaliseMargem {
  produto: string
  quantidadeVendida: number
  valorTotalVendas: number
  precoMedioVenda: number
  precoCusto: number
  precoSugeridoVendaDireta: number
  precoSugeridoIfood: number
  participacaoVolume: number
  participacaoFaturamento: number
  margemContribuicaoAtual: number
  margemContribuicaoSugeridaVendaDireta: number
  margemContribuicaoSugeridaIfood: number
}

interface ResumoMargem {
  margemAtualPonderada: number
  margemSugeridaVendaDiretaPonderada: number
  margemSugeridaIfoodPonderada: number
  totalFaturamento: number
  totalProdutos: number
}

// Dados de exemplo removidos - sistema utilizará apenas dados reais importados

const canaisDisponiveis = [
  { id: "ifood", nome: "iFood", cor: "bg-red-500" },
  { id: "whatsapp", nome: "WhatsApp", cor: "bg-green-500" },
  { id: "balcao", nome: "Balcão", cor: "bg-blue-500" },
  { id: "outros", nome: "Outros", cor: "bg-gray-500" }
]

export default function ImportarVendas() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [importando, setImportando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [vendasImportadas, setVendasImportadas] = useState<VendaImportada[]>([])
  const [resumo, setResumo] = useState<ResumoImportacao | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroCanal, setFiltroCanal] = useState<string>("todos")
  const [analiseMargem, setAnaliseMargem] = useState<AnaliseMargem[]>([])
  const [resumoMargem, setResumoMargem] = useState<ResumoMargem | null>(null)
  const [errosDetalhados, setErrosDetalhados] = useState<string[]>([])
  
  // Estados para controle de período e limpeza
  const [dataInicio, setDataInicio] = useState<string>("")
  const [dataFim, setDataFim] = useState<string>("")
  const [filtrarPorPeriodo, setFiltrarPorPeriodo] = useState<boolean>(false)
  const [limpezaConfirmada, setLimpezaConfirmada] = useState<boolean>(false)
  
  // Estados para formato da imagem
  const [dataVenda, setDataVenda] = useState<string>("")
  const [canalVenda, setCanalVenda] = useState<string>("balcao")
  const [formatoImportacao, setFormatoImportacao] = useState<"completo" | "imagem">("completo")
  
  const { toast } = useToast()
  
  // Carregar resumo das vendas existentes ao inicializar
  useEffect(() => {
    const carregarResumoVendas = async () => {
      try {
        // Obter usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          return;
        }

        // Buscar todas as vendas com paginação
        const fetchAllVendas = async () => {
          const batchSize = 1000;
          let allVendas = [];
          let offset = 0;

          while (true) {
            const { data: batch, error } = await supabase
              .from('vendas')
              .select('data_venda, valor_total')
              .eq('user_id', user.id)
              .order('data_venda', { ascending: true })
              .range(offset, offset + batchSize - 1);

            if (error) {
              throw error;
            }

            if (batch.length === 0) break;

            allVendas = [...allVendas, ...batch];
            offset += batchSize;
          }

          return allVendas;
        };

        const vendas = await fetchAllVendas();

        if (vendas && vendas.length > 0) {
          const datas = vendas.map(v => v.data_venda).sort();
          const dataInicioPeriodo = datas[0];
          const dataFimPeriodo = datas[datas.length - 1];
          const valorTotal = vendas.reduce((total, venda) => total + venda.valor_total, 0);

          setResumo({
            totalVendas: vendas.length,
            valorTotal: valorTotal,
            sucessos: vendas.length,
            erros: 0,
            avisos: 0,
            dataInicio: dataInicioPeriodo,
            dataFim: dataFimPeriodo
          });
        }
      } catch (error) {
        console.error('Erro ao carregar resumo das vendas:', error);
      }
    };

    carregarResumoVendas();
  }, []);
  
  // Hooks para dados necessários
  const { produtos } = useProdutos()
  const { canaisVenda, configCategorias, configGeral, percentualDespesasFixas } = useMarkup()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setArquivo(file)
      } else {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo CSV ou XLSX",
          variant: "destructive"
        })
      }
    }
  }

  // Função para filtrar vendas por período
  const filtrarVendasPorPeriodo = (vendas: any[]) => {
    if (!filtrarPorPeriodo || (!dataInicio && !dataFim)) {
      return vendas;
    }

    return vendas.filter(venda => {
      const dataVenda = new Date(venda.data_venda);
      
      if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return dataVenda >= inicio && dataVenda <= fim;
      } else if (dataInicio) {
        const inicio = new Date(dataInicio);
        return dataVenda >= inicio;
      } else if (dataFim) {
        const fim = new Date(dataFim);
        return dataVenda <= fim;
      }
      
      return true;
    });
  };

  // Função para limpar tabela de vendas
  const limparTabelaVendas = async () => {
    if (!limpezaConfirmada) {
      setLimpezaConfirmada(true);
      toast({
        title: "Confirmação necessária",
        description: "Clique novamente no botão para confirmar a limpeza de TODAS as vendas.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Erro ao limpar vendas: ${error.message}`);
      }

      // Limpar estados locais
      setVendasImportadas([]);
      setResumo(null);
      setAnaliseMargem([]);
      setResumoMargem(null);
      setLimpezaConfirmada(false);

      toast({
        title: "Tabela limpa com sucesso",
        description: "Todas as vendas foram removidas da base de dados."
      });

    } catch (error: any) {
      toast({
        title: "Erro ao limpar vendas",
        description: error.message,
        variant: "destructive"
      });
      setLimpezaConfirmada(false);
    }
  };

  const simularImportacao = async () => {
    if (!arquivo) return

    setImportando(true)
    setProgresso(0)

    try {
      let resultado;
      
      // Escolher processador baseado no formato
      if (formatoImportacao === "imagem") {
        // Validar campos obrigatórios para formato da imagem
        if (!dataVenda) {
          throw new Error("Data da venda é obrigatória para este formato");
        }
        
        // Processar arquivo no formato da imagem
        resultado = await processarVendasFormatoImagem(arquivo, dataVenda, canalVenda);
        
        // Salvar vendas no formato da imagem
        if (resultado.vendas.length > 0) {
          await salvarVendasFormatoImagem(resultado.vendas);
        }
      } else {
        // Processar arquivo no formato completo
        resultado = await processarVendas(arquivo);
        
        // Filtrar vendas por período se necessário
        let vendasParaSalvar = resultado.dados;
        if (filtrarPorPeriodo) {
          vendasParaSalvar = filtrarVendasPorPeriodo(resultado.dados);
        }
        
        if (vendasParaSalvar.length > 0) {
          const salvamento = await salvarNoSupabase('vendas', vendasParaSalvar);
          
          if (!salvamento.data) {
            throw new Error(`Erro ao salvar: ${salvamento.error}`);
          }
        }
      }
      
      setProgresso(100);
      
      // Mapear vendas baseado no formato
      let vendasMapeadas;
      if (formatoImportacao === "imagem") {
        vendasMapeadas = resultado.vendas.map((venda: any, index: number) => ({
          id: index.toString(),
          data: venda.data,
          pedido: venda.pedido,
          produto: venda.produto,
          codigoPdv: venda.codigoPdv,
          quantidade: venda.quantidade,
          valorUnitario: venda.valorUnitario,
          valorTotal: venda.valorTotal,
          canal: venda.canal,
          status: venda.status,
          observacao: venda.observacao
        }));
      } else {
        vendasMapeadas = resultado.dados.map((venda: any, index: number) => ({
          id: index.toString(),
          data: venda.data_venda,
          pedido: venda.pedido_numero,
          produto: venda.produto_nome,
          codigoPdv: venda.produto_codigo,
          quantidade: venda.quantidade,
          valorUnitario: venda.valor_unitario,
          valorTotal: venda.valor_total,
          canal: venda.canal || 'outros',
          status: 'sucesso' as const,
          observacao: undefined
        }));
      }
      
      // Calcular período das vendas importadas
      const datas = vendasMapeadas.map((venda: any) => venda.data).sort();
      const dataInicioPeriodo = datas.length > 0 ? datas[0] : undefined;
      const dataFimPeriodo = datas.length > 0 ? datas[datas.length - 1] : undefined;
      

      const novoResumo = {
        totalVendas: vendasMapeadas.length,
        valorTotal: vendasMapeadas.reduce((total: number, venda: any) => total + venda.valorTotal, 0),
        sucessos: vendasMapeadas.length,
        erros: resultado.erros?.length || 0,
        avisos: 0,
        dataInicio: dataInicioPeriodo,
        dataFim: dataFimPeriodo
      };
      
      setResumo(novoResumo);
      setErrosDetalhados(resultado.erros || []);
      setVendasImportadas(vendasMapeadas);

      const mensagemSucesso = filtrarPorPeriodo 
        ? `${novoResumo.sucessos} vendas importadas do período selecionado!`
        : `${novoResumo.sucessos} vendas importadas com sucesso!`;

      toast({
        title: "Importação concluída",
        description: mensagemSucesso
      });
    } catch (error: any) {
      toast({
        title: "Erro na importação", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImportando(false);
    }
  }

  const baixarTemplateCSV = () => {
    const csvContent = [
      "data,pedido_numero,quantidade,valor_unitario,canal,codigo_pdv",
      "2024-01-15,PED001,2,45.90,ifood,PDV001",
      "2024-01-15,PED002,1,28.50,balcao,PDV002",
      "2024-01-15,PED003,3,12.00,whatsapp,PDV003"
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_vendas.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadTemplateFormatoImagem = () => {
    const csvContent = [
      "Produto,PDV,valor unitário,Quantidade Vendida,Vendas Total",
      "SuperBalde Premium (13 Un.),122,93.02,201,18696.19",
      "Balde Premium (8 Un.),121,75.10,208,15621.50",
      "Combo Família Premium- p/ 4 pessoas,146,124.38,99,12313.80",
      "Balde Clássico (8 Pedaços),119,61.08,155,9466.66",
      "SuperBalde Clássico(13 un.),120,81.95,87,7129.30",
      "Combo Amigos Premium p/ 2 pessoas,243,91.04,56,5098.40",
      "COXINHAS CRUSH,370,72.70,61,4434.90",
      "Combo Família Clássico p/ 4 pessoas,147,114.66,37,4242.30",
      "Bacon Cheese Burger,31,45.02,66,2971.10",
      "Combo Amigos Clássico p/2 pessoas,242,81.87,35,2865.40",
      "Batatas fritas Grande,54,9.80,268,2625.40",
      "ZAPBOX TIRAS,43,34.55,74,2556.60",
      "ZAPBOX PEDAÇOS,42,31.90,72,2296.80"
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_vendas_formato_imagem.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Template baixado",
      description: "Arquivo template_vendas_formato_imagem.csv foi baixado com sucesso!"
    })
  }

  const vendasFiltradas = vendasImportadas.filter(venda => {
    const matchStatus = filtroStatus === "todos" || venda.status === filtroStatus
    const matchCanal = filtroCanal === "todos" || venda.canal === filtroCanal
    return matchStatus && matchCanal
  })

  const getCanalInfo = (canal: string) => {
    return canaisDisponiveis.find(c => c.id === canal) || canaisDisponiveis[3]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <Badge variant="default" className="bg-success text-success-foreground">Sucesso</Badge>
      case 'erro':
        return <Badge variant="destructive">Erro</Badge>
      case 'aviso':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Aviso</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  // Função para mapear categoria (mesma da página de produtos)
  const mapearCategoria = (categoriaProduto: string): string => {
    const mapeamento: { [key: string]: string } = {
      'Bebida': 'BEBIDAS',
      'Bebidas': 'BEBIDAS', 
      'BEBIDAS': 'BEBIDAS',
      'Hambúrguer': 'ALIMENTOS',
      'Hamburguer': 'ALIMENTOS',
      'Combo': 'ALIMENTOS',
      'Balde': 'ALIMENTOS',
      'Porção': 'ALIMENTOS',
      'Sobremesa': 'ALIMENTOS',
      'ALIMENTOS': 'ALIMENTOS'
    }
    
    return mapeamento[categoriaProduto] || 'ALIMENTOS'
  }

  // Função para calcular markup (mesma da página de produtos)
  const calcularMarkupSimples = (categoria: string, canal: string): number => {
    if (!categoria || categoria.trim() === '') return 0
    
    const categoriaMapeada = mapearCategoria(categoria)
    const configCategoria = configCategorias.find(c => c.categoria === categoriaMapeada)
    if (!configCategoria) return 0

    const canalVenda = canaisVenda.find(c => c.nome === canal)
    if (!canalVenda) return 0

    const custosTotais = 
      (configGeral?.impostos_faturamento || 0) +
      (configGeral?.taxa_cartao || 0) +
      (configGeral?.outros_custos || 0) +
      (percentualDespesasFixas || 0) +
      canalVenda.taxa_marketplace +
      canalVenda.taxa_antecipacao

    if (custosTotais >= 100) return 0

    const markup = (1 + (configCategoria.lucro_desejado / 100) + (configCategoria.reserva_operacional / 100)) / (1 - (custosTotais / 100))
    return Math.round(markup * 100) / 100
  }

  // Função para arredondar preço para terminar com ,90
  const arredondarPara90 = (preco: number): number => {
    const precoInteiro = Math.floor(preco)
    return precoInteiro + 0.90
  }

  // Função para calcular preço sugerido
  const calcularPrecoSugerido = (precoCusto: number, categoria: string, canal: string): number => {
    if (!precoCusto || precoCusto <= 0) return 0
    const markup = calcularMarkupSimples(categoria, canal)
    if (markup <= 0) return 0
    const precoSugerido = precoCusto * markup
    return arredondarPara90(precoSugerido)
  }

  // Função para calcular margem de contribuição
  const calcularMargemContribuicao = (precoVenda: number, precoCusto: number): number => {
    if (!precoVenda || precoVenda <= 0) return 0
    return ((precoVenda - precoCusto) / precoVenda) * 100
  }

  // Função para analisar margem de contribuição das vendas
  const analisarMargemContribuicao = () => {
    if (vendasImportadas.length === 0) return

    // Agrupar vendas por produto
    const vendasPorProduto = vendasImportadas.reduce((acc, venda) => {
      if (!acc[venda.produto]) {
        acc[venda.produto] = {
          quantidade: 0,
          valorTotal: 0,
          precos: []
        }
      }
      acc[venda.produto].quantidade += venda.quantidade
      acc[venda.produto].valorTotal += venda.valorTotal
      acc[venda.produto].precos.push(venda.valorUnitario)
      return acc
    }, {} as any)

    // Calcular total de vendas
    const totalVendas = vendasImportadas.reduce((sum, venda) => sum + venda.quantidade, 0)
    const totalFaturamento = vendasImportadas.reduce((sum, venda) => sum + venda.valorTotal, 0)

    // Analisar cada produto
    const analises: AnaliseMargem[] = []
    
    Object.entries(vendasPorProduto).forEach(([produto, dados]: [string, any]) => {
      // Buscar produto no catálogo
      const produtoCatalogo = produtos.find(p => p.nome.toLowerCase().includes(produto.toLowerCase()) || produto.toLowerCase().includes(p.nome.toLowerCase()))
      
      const precoMedioVenda = dados.valorTotal / dados.quantidade
      const precoCusto = produtoCatalogo?.preco_custo || 0
      const categoria = produtoCatalogo?.categoria || ''
      
      // Calcular preços sugeridos
      const precoSugeridoVendaDireta = calcularPrecoSugerido(precoCusto, categoria, 'Venda Direta')
      const precoSugeridoIfood = calcularPrecoSugerido(precoCusto, categoria, 'iFood')
      
      // Calcular participações
      const participacaoVolume = (dados.quantidade / totalVendas) * 100
      const participacaoFaturamento = (dados.valorTotal / totalFaturamento) * 100
      
      // Calcular margens de contribuição
      const margemAtual = calcularMargemContribuicao(precoMedioVenda, precoCusto)
      const margemSugeridaVendaDireta = calcularMargemContribuicao(precoSugeridoVendaDireta, precoCusto)
      const margemSugeridaIfood = calcularMargemContribuicao(precoSugeridoIfood, precoCusto)
      
      analises.push({
        produto,
        quantidadeVendida: dados.quantidade,
        valorTotalVendas: dados.valorTotal,
        precoMedioVenda,
        precoCusto,
        precoSugeridoVendaDireta,
        precoSugeridoIfood,
        participacaoVolume,
        participacaoFaturamento,
        margemContribuicaoAtual: margemAtual,
        margemContribuicaoSugeridaVendaDireta: margemSugeridaVendaDireta,
        margemContribuicaoSugeridaIfood: margemSugeridaIfood
      })
    })

    // Calcular médias ponderadas
    const margemAtualPonderada = analises.reduce((sum, analise) => 
      sum + (analise.margemContribuicaoAtual * analise.participacaoFaturamento / 100), 0)
    
    const margemSugeridaVendaDiretaPonderada = analises.reduce((sum, analise) => 
      sum + (analise.margemContribuicaoSugeridaVendaDireta * analise.participacaoFaturamento / 100), 0)
    
    const margemSugeridaIfoodPonderada = analises.reduce((sum, analise) => 
      sum + (analise.margemContribuicaoSugeridaIfood * analise.participacaoFaturamento / 100), 0)

    setAnaliseMargem(analises)
    setResumoMargem({
      margemAtualPonderada,
      margemSugeridaVendaDiretaPonderada,
      margemSugeridaIfoodPonderada,
      totalFaturamento,
      totalProdutos: analises.length
    })
  }

  // Executar análise quando vendas forem importadas
  useEffect(() => {
    if (vendasImportadas.length > 0 && produtos.length > 0) {
      analisarMargemContribuicao()
    }
  }, [vendasImportadas, produtos, configCategorias, canaisVenda, configGeral])

  return (
    <Layout currentPage="vendas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Importar Vendas
            </h1>
            <p className="text-muted-foreground mt-1">
              Importe dados de vendas de diferentes canais para análise
            </p>
          </div>
          
          <Button variant="outline" onClick={baixarTemplateCSV}>
            <Download className="h-4 w-4" />
            Baixar Template Completo
          </Button>
          <Button variant="outline" onClick={downloadTemplateFormatoImagem}>
            <Download className="h-4 w-4" />
            Baixar Template Formato Imagem
          </Button>
        </div>

        <Tabs defaultValue="importar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="importar">Importar Arquivo</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="erros" disabled={!errosDetalhados.length}>Erros ({errosDetalhados.length})</TabsTrigger>
            <TabsTrigger value="margem" disabled={!resumo}>Análise de Margem</TabsTrigger>
          </TabsList>

          {/* Aba de Importação */}
          <TabsContent value="importar" className="space-y-6">
            {/* Upload de Arquivo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Selecionar Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seleção de Formato */}
                <div className="space-y-4">
                  <Label htmlFor="formato">Formato de Importação</Label>
                  <Select value={formatoImportacao} onValueChange={(value: "completo" | "imagem") => setFormatoImportacao(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completo">Formato Completo (com data e pedido)</SelectItem>
                      <SelectItem value="imagem">Formato da Imagem (sem data e pedido)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos para formato da imagem */}
                {formatoImportacao === "imagem" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataVenda">Data da Venda *</Label>
                      <Input
                        id="dataVenda"
                        type="date"
                        value={dataVenda}
                        onChange={(e) => setDataVenda(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="canalVenda">Canal de Venda</Label>
                      <Select value={canalVenda} onValueChange={setCanalVenda}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balcao">Balcão</SelectItem>
                          <SelectItem value="ifood">iFood</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Arraste e solte seu arquivo aqui</p>
                      <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                    </div>
                    <Input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileChange}
                      className="max-w-xs"
                    />
                  </div>
                </div>

                {arquivo && (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{arquivo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(arquivo.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setArquivo(null)} variant="outline" size="sm">
                      Remover
                    </Button>
                  </div>
                )}

                {importando && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processando arquivo...</span>
                      <span className="text-sm text-muted-foreground">{progresso}%</span>
                    </div>
                    <Progress value={progresso} className="w-full" />
                  </div>
                )}

                {/* Controles de Período e Limpeza */}
                <div className="space-y-4">
                  {/* Seletor de Período */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Filtro por Período (Opcional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="filtrarPeriodo"
                          checked={filtrarPorPeriodo}
                          onChange={(e) => setFiltrarPorPeriodo(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="filtrarPeriodo" className="text-sm">
                          Filtrar vendas por período antes de importar
                        </Label>
                      </div>
                      
                      {filtrarPorPeriodo && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dataInicio" className="text-sm">Data de Início</Label>
                            <Input
                              id="dataInicio"
                              type="date"
                              value={dataInicio}
                              onChange={(e) => setDataInicio(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dataFim" className="text-sm">Data de Fim</Label>
                            <Input
                              id="dataFim"
                              type="date"
                              value={dataFim}
                              onChange={(e) => setDataFim(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={simularImportacao} 
                      disabled={!arquivo || importando}
                      className="flex-1"
                    >
                      {importando ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Importar Vendas
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={limparTabelaVendas}
                      variant="destructive"
                      disabled={importando}
                      className={limpezaConfirmada ? "animate-pulse" : ""}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {limpezaConfirmada ? "Confirmar Limpeza" : "Limpar Tabela"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo de Vendas Importadas */}
            {resumo && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Resumo das Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{resumo.totalVendas}</div>
                      <div className="text-sm text-green-600">Vendas Importadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {resumo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-green-600">Valor Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{resumo.sucessos}</div>
                      <div className="text-sm text-green-600">Sucessos</div>
                    </div>
                  </div>
                  
                  {/* Período das vendas */}
                  {resumo.dataInicio && resumo.dataFim && (
                    <div className="mt-4 p-3 bg-green-100 rounded-md">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Período das vendas:</span>
                        <span className="text-sm">
            {(() => {
              // Converter data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY) sem problemas de timezone
              const formatarDataBrasileira = (dataISO: string) => {
                const [ano, mes, dia] = dataISO.split('-');
                return `${dia}/${mes}/${ano}`;
              };
              
              
              return `${formatarDataBrasileira(resumo.dataInicio)} até ${formatarDataBrasileira(resumo.dataFim)}`;
            })()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {resumo.erros > 0 && (
                    <div className="mt-3 p-2 bg-yellow-100 rounded-md">
                      <div className="text-sm text-yellow-800">
                        ⚠️ {resumo.erros} vendas com erro foram ignoradas
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instruções */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Formato do Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Colunas Obrigatórias</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• <strong>data</strong> - Data da venda (AAAA-MM-DD ou DD/MM/AAAA)</li>
                      <li>• <strong>pedido_numero</strong> - Número do pedido</li>
                      <li>• <strong>quantidade</strong> - Quantidade vendida</li>
                      <li>• <strong>valor_unitario</strong> - Preço unitário</li>
                      <li>• <strong>canal</strong> - Canal de venda (opcional)</li>
                      <li>• <strong>codigo_pdv</strong> - Código do PDV (obrigatório)</li>
                      <li>• <strong>produto</strong> - Nome do produto (opcional - será buscado automaticamente)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🧠 Lógica Inteligente</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Nome do produto:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• Se fornecido → usa o nome do CSV</li>
                        <li>• Se não fornecido → busca na tabela produtos pelo código PDV</li>
                        <li>• Se não encontrar → usa "Produto {'{código}'}"</li>
                      </ul>
                    </div>
                    
                    <h4 className="font-semibold mb-2 mt-4">Canais Aceitos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span><strong>ifood</strong> - iFood</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span><strong>whatsapp</strong> - WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span><strong>balcao</strong> - Balcão</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span><strong>outros</strong> - Outros</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Formato da Imagem */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800">📊 Formato da Imagem (Sem Data e Pedido)</h4>
                  <div className="text-sm text-blue-700">
                    <p className="mb-2">Para arquivos no formato da imagem, use as seguintes colunas:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Produto</strong> - Nome do produto</li>
                      <li>• <strong>PDV</strong> - Código PDV do produto</li>
                      <li>• <strong>valor unitário</strong> - Preço unitário</li>
                      <li>• <strong>Quantidade Vendida</strong> - Quantidade vendida</li>
                      <li>• <strong>Vendas Total</strong> - Valor total da venda</li>
                    </ul>
                    <p className="mt-2 text-xs text-blue-600">
                      💡 <strong>Dica:</strong> Selecione "Formato da Imagem" na interface e informe a data e canal da venda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Resultados */}
          <TabsContent value="resultados" className="space-y-6">
            {resumo ? (
              <>
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                          <p className="text-2xl font-bold">{resumo.totalVendas}</p>
                        </div>
                        <ShoppingBag className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                          <p className="text-2xl font-bold text-success">
                            R$ {resumo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-success" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Sucessos</p>
                          <p className="text-2xl font-bold text-success">{resumo.sucessos}</p>
                        </div>
                        <Check className="h-8 w-8 text-success" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Erros</p>
                          <p className="text-2xl font-bold text-destructive">{resumo.erros}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-destructive" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filtros */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger className="md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os status</SelectItem>
                          <SelectItem value="sucesso">Sucessos</SelectItem>
                          <SelectItem value="erro">Erros</SelectItem>
                          <SelectItem value="aviso">Avisos</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={filtroCanal} onValueChange={setFiltroCanal}>
                        <SelectTrigger className="md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os canais</SelectItem>
                          {canaisDisponiveis.map(canal => (
                            <SelectItem key={canal.id} value={canal.id}>
                              {canal.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Vendas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Vendas Importadas ({vendasFiltradas.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vendasFiltradas.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                          Nenhuma venda encontrada com os filtros aplicados
                        </p>
                      ) : (
                        vendasFiltradas.map(venda => {
                          const canalInfo = getCanalInfo(venda.canal)
                          
                          return (
                            <div key={venda.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${canalInfo.cor}`}></div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{venda.produto}</span>
                                    {getStatusBadge(venda.status)}
                                  </div>
                                   <div className="text-sm text-muted-foreground">
                                     {venda.data} • {canalInfo.nome} • Qtd: {venda.quantidade}
                                     {venda.codigoPdv && ` • PDV: ${venda.codigoPdv}`}
                                   </div>
                                  {venda.observacao && (
                                    <div className="text-sm text-warning mt-1">
                                      {venda.observacao}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">
                                  R$ {venda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  R$ {venda.valorUnitario.toFixed(2)} cada
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma importação realizada ainda. 
                    <br />
                    Volte para a aba "Importar Arquivo" para começar.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba de Erros */}
          <TabsContent value="erros" className="space-y-6">
            {errosDetalhados.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Erros de Importação ({errosDetalhados.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Por que alguns registros foram ignorados?</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Os registros abaixo foram ignorados devido a problemas nos dados. 
                              Verifique e corrija os dados no arquivo CSV para reimportar.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Linha</TableHead>
                              <TableHead>Erro</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {errosDetalhados.map((erro, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono text-sm">
                                  {erro.split(':')[0]}
                                </TableCell>
                                <TableCell className="text-sm text-destructive">
                                  {erro.split(':').slice(1).join(':').trim()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Dicas para corrigir os erros:</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Verifique se todas as colunas obrigatórias estão preenchidas</li>
                          <li>Confirme se as datas estão no formato correto (DD/MM/AAAA ou AAAA-MM-DD)</li>
                          <li>Verifique se os valores numéricos estão corretos (sem caracteres especiais)</li>
                          <li>Certifique-se de que as quantidades são números positivos</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum erro encontrado na última importação!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba de Análise de Margem */}
          <TabsContent value="margem" className="space-y-6">
            {resumoMargem ? (
              <>
                {/* Cards de Resumo da Margem */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">MC Atual Ponderada</p>
                          <p className="text-2xl font-bold text-primary">
                            {resumoMargem.margemAtualPonderada.toFixed(1)}%
                          </p>
                        </div>
                        <Calculator className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">MC Sugerida Venda Direta</p>
                          <p className="text-2xl font-bold text-success">
                            {resumoMargem.margemSugeridaVendaDiretaPonderada.toFixed(1)}%
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-success" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">MC Sugerida iFood</p>
                          <p className="text-2xl font-bold text-accent">
                            {resumoMargem.margemSugeridaIfoodPonderada.toFixed(1)}%
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabela de Análise Detalhada */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Análise Detalhada por Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Qtd Vendida</TableHead>
                            <TableHead>Preço Médio</TableHead>
                            <TableHead>Preço Custo</TableHead>
                            <TableHead>Preço Sug. Venda Direta</TableHead>
                            <TableHead>Preço Sug. iFood</TableHead>
                            <TableHead>% Volume</TableHead>
                            <TableHead>% Faturamento</TableHead>
                            <TableHead>MC Atual</TableHead>
                            <TableHead>MC Sug. Venda Direta</TableHead>
                            <TableHead>MC Sug. iFood</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analiseMargem.map((analise, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{analise.produto}</TableCell>
                              <TableCell>{analise.quantidadeVendida}</TableCell>
                              <TableCell>R$ {analise.precoMedioVenda.toFixed(2)}</TableCell>
                              <TableCell>R$ {analise.precoCusto.toFixed(2)}</TableCell>
                              <TableCell>R$ {analise.precoSugeridoVendaDireta.toFixed(2)}</TableCell>
                              <TableCell>R$ {analise.precoSugeridoIfood.toFixed(2)}</TableCell>
                              <TableCell>{analise.participacaoVolume.toFixed(1)}%</TableCell>
                              <TableCell>{analise.participacaoFaturamento.toFixed(1)}%</TableCell>
                              <TableCell>
                                <span className={`font-medium ${
                                  analise.margemContribuicaoAtual >= 30 ? 'text-success' :
                                  analise.margemContribuicaoAtual >= 15 ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {analise.margemContribuicaoAtual.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`font-medium ${
                                  analise.margemContribuicaoSugeridaVendaDireta >= 30 ? 'text-success' :
                                  analise.margemContribuicaoSugeridaVendaDireta >= 15 ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {analise.margemContribuicaoSugeridaVendaDireta.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`font-medium ${
                                  analise.margemContribuicaoSugeridaIfood >= 30 ? 'text-success' :
                                  analise.margemContribuicaoSugeridaIfood >= 15 ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {analise.margemContribuicaoSugeridaIfood.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo Executivo */}
                <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Resumo Executivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Situação Atual</h4>
                          <p className="text-sm text-muted-foreground">
                            A margem de contribuição atual ponderada é de <strong>{resumoMargem.margemAtualPonderada.toFixed(1)}%</strong>, 
                            baseada no mix de produtos vendidos e seus preços atuais.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Potencial de Melhoria</h4>
                          <p className="text-sm text-muted-foreground">
                            Com os preços sugeridos, a margem poderia chegar a <strong>{resumoMargem.margemSugeridaVendaDiretaPonderada.toFixed(1)}%</strong> 
                            para venda direta e <strong>{resumoMargem.margemSugeridaIfoodPonderada.toFixed(1)}%</strong> para iFood.
                          </p>
                        </div>
                      </div>
                      <div className="bg-background p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Fórmula da Margem de Contribuição</h4>
                        <div className="text-center text-lg font-mono">
                          MC% = (Preço de Venda - Custo Variável) / Preço de Venda × 100
                        </div>
                        <div className="mt-3 text-sm space-y-1">
                          <p><strong>MC Ponderada:</strong> Média das margens individuais ponderada pela participação no faturamento</p>
                          <p><strong>Análise:</strong> Baseada em {resumoMargem.totalProdutos} produtos únicos com faturamento total de R$ {resumoMargem.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma análise de margem disponível. 
                    <br />
                    Importe vendas e configure os produtos para ver a análise.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}