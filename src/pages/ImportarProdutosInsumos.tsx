import { useState } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { processarProdutos, processarInsumos, salvarNoSupabase } from "@/utils/csvProcessor"
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  Package,
  ShoppingCart
} from "lucide-react"

// Tipos para importação
interface ProdutoImportado {
  id: string
  codigo: string
  nome: string
  categoria: string
  preco: number
  status: 'sucesso' | 'erro' | 'aviso'
  observacao?: string
}

interface InsumoImportado {
  id: string
  codigo: string
  nome: string
  fornecedor: string
  categoria: string
  unidadeMedida: string
  preco: number
  status: 'sucesso' | 'erro' | 'aviso'
  observacao?: string
}

interface ResumoImportacao {
  totalProdutos: number
  totalInsumos: number
  sucessos: number
  erros: number
  avisos: number
}

// Dados de exemplo removidos - sistema utilizará apenas dados reais importados

export default function ImportarProdutosInsumos() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [importando, setImportando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [produtosImportados, setProdutosImportados] = useState<ProdutoImportado[]>([])
  const [insumosImportados, setInsumosImportados] = useState<InsumoImportado[]>([])
  const [resumo, setResumo] = useState<ResumoImportacao | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [tipoImportacao, setTipoImportacao] = useState<string>("produtos")
  const { toast } = useToast()

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

  const simularImportacao = async () => {
    if (!arquivo) return

    setImportando(true)
    setProgresso(0)

    try {
      // Processar arquivo  
      let dadosProcessados, erros;
      
      if (tipoImportacao === "produtos" || tipoImportacao === "ambos") {
        const resultado = await processarProdutos(arquivo);
        if (resultado.dados.length > 0) {
          const salvamento = await salvarNoSupabase('produtos', resultado.dados);
          if (!salvamento.sucesso) {
            throw new Error(salvamento.erro);
          }
        }
        dadosProcessados = resultado.dados;
        erros = resultado.erros;
      }
      
      if (tipoImportacao === "insumos" || tipoImportacao === "ambos") {
        const resultado = await processarInsumos(arquivo);
        if (resultado.dados.length > 0) {
          const salvamento = await salvarNoSupabase('insumos', resultado.dados);
          if (!salvamento.sucesso) {
            throw new Error(salvamento.erro);
          }
        }
        dadosProcessados = resultado.dados;
        erros = resultado.erros;
      }
      
      setProgresso(100);
      
      const novoResumo = {
        totalProdutos: tipoImportacao === "produtos" || tipoImportacao === "ambos" ? dadosProcessados?.length || 0 : 0,
        totalInsumos: tipoImportacao === "insumos" || tipoImportacao === "ambos" ? dadosProcessados?.length || 0 : 0,
        sucessos: dadosProcessados?.length || 0,
        erros: erros?.length || 0,
        avisos: 0
      };
      
      setResumo(novoResumo);

      toast({
        title: "Importação concluída", 
        description: `${novoResumo.sucessos} itens importados com sucesso!`
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

  const baixarTemplateProdutos = () => {
    const csvContent = [
      "codigo,nome,categoria,preco_atual",
      "PRD001,Combo Família Grande,Combo,45.90",
      "PRD002,Balde Médio 8 Pedaços,Balde,32.90",
      "PRD003,Porção Batata Grande,Porção,12.50"
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_produtos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const baixarTemplateInsumos = () => {
    const csvContent = [
      "codigo,nome,fornecedor,categoria,unidade_medida,preco_unitario,quantidade_comprar,quantidade_minima,tipo_embalagem,deposito,fator_correcao,observacoes",
      "INS001,Frango Inteiro Congelado,Frigorífico Aurora,Carnes,kg,8.50,20,10,Caixa com 10 kg,Depósito Principal,1.0,Produto principal",
      "INS002,Óleo de Soja,Liza Distribuidora,Óleos,litro,4.20,10,5,Galão 20L,Depósito Seco,1.0,",
      "INS003,Batata Pré-Frita,McCain Brasil,Vegetais,kg,12.80,15,8,Saco 2.5kg,Depósito Congelados,1.0,Produto importado"
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_insumos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
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

  const produtosFiltrados = produtosImportados.filter(produto => 
    filtroStatus === "todos" || produto.status === filtroStatus
  )
  
  const insumosFiltrados = insumosImportados.filter(insumo => 
    filtroStatus === "todos" || insumo.status === filtroStatus
  )

  return (
    <Layout currentPage="importar-produtos-insumos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Importar Produtos e Insumos
            </h1>
            <p className="text-muted-foreground mt-1">
              Importe dados de produtos e insumos em lote para o sistema
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={baixarTemplateProdutos}>
              <Download className="h-4 w-4" />
              Template Produtos
            </Button>
            <Button variant="outline" onClick={baixarTemplateInsumos}>
              <Download className="h-4 w-4" />
              Template Insumos
            </Button>
          </div>
        </div>

        <Tabs defaultValue="importar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="importar">Importar Arquivo</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
          </TabsList>

          {/* Aba de Importação */}
          <TabsContent value="importar" className="space-y-6">
            {/* Tipo de Importação */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Importação</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={tipoImportacao} onValueChange={setTipoImportacao}>
                  <SelectTrigger className="md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produtos">Apenas Produtos</SelectItem>
                    <SelectItem value="insumos">Apenas Insumos</SelectItem>
                    <SelectItem value="ambos">Produtos e Insumos</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Upload de Arquivo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Selecionar Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                        Importar {tipoImportacao === "produtos" ? "Produtos" : tipoImportacao === "insumos" ? "Insumos" : "Produtos e Insumos"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instruções */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Instruções Produtos */}
              {(tipoImportacao === "produtos" || tipoImportacao === "ambos") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-accent" />
                      Formato - Produtos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Colunas Obrigatórias</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• <strong>codigo</strong> - Código único do produto</li>
                        <li>• <strong>nome</strong> - Nome do produto</li>
                        <li>• <strong>categoria</strong> - Categoria do produto</li>
                        <li>• <strong>preco_atual</strong> - Preço atual de venda</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Instruções Insumos */}
              {(tipoImportacao === "insumos" || tipoImportacao === "ambos") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-success" />
                      Formato - Insumos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Colunas Obrigatórias</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• <strong>codigo</strong> - Código único do insumo</li>
                        <li>• <strong>nome</strong> - Nome do insumo</li>
                        <li>• <strong>fornecedor</strong> - Fornecedor</li>
                        <li>• <strong>categoria</strong> - Categoria</li>
                        <li>• <strong>unidade_medida</strong> - Unidade de medida</li>
                        <li>• <strong>preco_unitario</strong> - Preço por unidade</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Colunas Opcionais</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• quantidade_comprar, quantidade_minima</li>
                        <li>• tipo_embalagem, deposito</li>
                        <li>• fator_correcao, observacoes</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
                          <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                          <p className="text-2xl font-bold text-accent">{resumo.totalProdutos}</p>
                        </div>
                        <Package className="h-8 w-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Insumos</p>
                          <p className="text-2xl font-bold text-success">{resumo.totalInsumos}</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-success" />
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
                  </CardContent>
                </Card>

                {/* Lista de Produtos */}
                {produtosFiltrados.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Produtos Importados ({produtosFiltrados.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {produtosFiltrados.map(produto => (
                          <div key={produto.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{produto.nome}</span>
                                {getStatusBadge(produto.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Código: {produto.codigo} • Categoria: {produto.categoria}
                              </div>
                              {produto.observacao && (
                                <p className="text-sm text-warning mt-1">{produto.observacao}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-success">
                                R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de Insumos */}
                {insumosFiltrados.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Insumos Importados ({insumosFiltrados.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insumosFiltrados.map(insumo => (
                          <div key={insumo.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{insumo.nome}</span>
                                {getStatusBadge(insumo.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Código: {insumo.codigo} • Fornecedor: {insumo.fornecedor} • {insumo.unidadeMedida}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Categoria: {insumo.categoria}
                              </div>
                              {insumo.observacao && (
                                <p className="text-sm text-warning mt-1">{insumo.observacao}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-success">
                                R$ {insumo.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                por {insumo.unidadeMedida}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma importação realizada</h3>
                  <p className="text-muted-foreground">
                    Vá para a aba "Importar Arquivo" para começar
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