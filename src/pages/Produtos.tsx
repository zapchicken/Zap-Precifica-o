import { useState, useRef, useEffect } from "react"
import { supabase } from '../lib/supabase';
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Upload,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCategorias } from '../hooks/useCategorias'
import { useProdutos } from '../hooks/useProdutos'
import { useFichas } from '../hooks/useFichas'
import { useMarkup } from '../hooks/useMarkup'
import ImportarPrecos from '@/components/ImportarPrecos'


export default function Produtos() {
  const [userData, setUserData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatusPreco, setSelectedStatusPreco] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<any>(null)
  const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<any>(null)
  const [dependenciasProduto, setDependenciasProduto] = useState<any>(null)
  const [sincronizacaoExecutada, setSincronizacaoExecutada] = useState(false)
  
  const { categorias, addCategoria } = useCategorias()
  const { produtos, loading, error, createProduto, updateProduto, deleteProduto, desativarProduto, reativarProduto, verificarDependenciasProduto, refresh } = useProdutos()
  const { fichas, sincronizarComProdutos } = useFichas()
  const { canaisVenda, configCategorias, calcularMarkup, configGeral, percentualDespesasFixas } = useMarkup()


  const [formData, setFormData] = useState({
    nome: "",
    codigoPdv: "",
    descricao: "",
    categoria: "",
    precoCusto: "",
    precoVenda: "",
    precoVendaIfood: "",
    observacoes: "",
    ativo: true,
    fichaTecnicaId: "",
    simulatedAdjustment: null as number | null
  })

  // Função para arredondar para .90
  const arredondarPara90 = (preco: number): number => {
    const precoInteiro = Math.floor(preco)
    return precoInteiro + 0.90
  }

  // Função para calcular markup simples
  const calcularMarkupSimples = (categoria: string, canal: string): number => {
    // Verificações de segurança para evitar erros
    if (!categoria || categoria.trim() === '') {
      return 0
    }
    
    // Verificar se os dados dos hooks estão carregados
    if (!configCategorias || !canaisVenda || !configGeral) {
      return 0
    }
    
    const categoriaMapeada = mapearCategoria(categoria)
    
    const configCategoria = configCategorias.find(c => c.categoria === categoriaMapeada)
    if (!configCategoria) {
      return 0
    }

    const canalVenda = canaisVenda.find(c => c.nome === canal)
    if (!canalVenda) {
      return 0
    }

    // Calcular percentual total usando a nova fórmula
    // 100% / (100% - soma(Taxa de Impostos (%) + Investimento MKT (%) + Taxa de Cartão (%) + Despesas Fixas (%) + Reserva Operacional (%) + Categoria % Investimento MKT + Categoria % Reserva Operacional))
    const percentualTotal = 
      (configGeral?.impostos_faturamento || 0) +
      ((configGeral as any)?.investimento_mkt || 0) +
      (configGeral?.taxa_cartao || 0) +
      ((configGeral as any)?.despesas_fixas || 0) +
      ((configGeral as any)?.reserva_operacional || 0) +
        configCategoria.lucro_desejado +
      configCategoria.reserva_operacional

    // Se o percentual total for >= 100%, retornar 0 (impossível calcular)
    if (percentualTotal >= 100) {
      return 0
    }

    // Aplicar a nova fórmula: 100% / (100% - percentualTotal)
    const markup = (100 / (100 - percentualTotal)) - 1
    const markupFinal = markup + 1 // Adicionar 1 para obter o multiplicador final

    return Math.round(markupFinal * 100) / 100
  }

  // Função para mapear categoria
  const mapearCategoria = (categoriaProduto: string): string => {
    const mapeamento: { [key: string]: string } = {
      'ACOMPANHAMENTOS': 'ACOMPANHAMENTOS',
      'BEBIDAS CERVEJAS E CHOPP': 'BEBIDAS CERVEJAS E CHOPP',
      'BEBIDAS REFRIGERANTES': 'BEBIDAS REFRIGERANTES',
      'BEBIDAS SUCOS': 'BEBIDAS SUCOS',
      'COMBO LANCHES CARNE ANGUS': 'COMBO LANCHES CARNE ANGUS',
      'COMBO LANCHES FRANGO': 'COMBO LANCHES FRANGO',
      'FRANGO AMERICANO': 'FRANGO AMERICANO',
      'JUMBOS (COMBINADOS GRANDES)': 'JUMBOS (COMBINADOS GRANDES)',
      'LANCHES': 'LANCHES',
      'MOLHOS': 'MOLHOS',
      'PROMOÇÕES': 'PROMOÇÕES',
      'SALADAS': 'SALADAS',
      'SOBREMESAS': 'SOBREMESAS',
      'ZAPBOX (COMBINADOS INDIVIDUÁIS)': 'ZAPBOX (COMBINADOS INDIVIDUÁIS)',
      'Bebida': 'BEBIDAS REFRIGERANTES',
      'Bebidas': 'BEBIDAS REFRIGERANTES', 
      'BEBIDAS': 'BEBIDAS REFRIGERANTES',
      'Hambúrguer': 'LANCHES',
      'Hamburguer': 'LANCHES',
      'Combo': 'COMBO LANCHES FRANGO',
      'Balde': 'FRANGO AMERICANO',
      'Porção': 'ACOMPANHAMENTOS',
      'Sobremesa': 'SOBREMESAS',
      'ALIMENTOS': 'LANCHES'
    }
    
    return mapeamento[categoriaProduto] || 'LANCHES'
  }

  // Função para calcular preço sugerido (movida para antes do filtro)
  const calcularPrecoSugerido = (precoCusto: number, categoria: string, canal: string): number => {
    if (!precoCusto || precoCusto <= 0) return 0

    const markup = calcularMarkupSimples(categoria, canal)
    if (markup <= 0) return 0

    let precoSugerido = precoCusto * markup

    // Se for iFood, aplicar a fórmula específica do marketplace
    if (canal === 'iFood') {
      const canalVenda = canaisVenda.find(c => c.nome === 'iFood')
      if (canalVenda) {
        const taxaMarketplace = canalVenda.taxa_marketplace || 0
        const taxaAntecipacao = canalVenda.taxa_antecipacao || 0
        const totalTaxas = taxaMarketplace + taxaAntecipacao
        
        if (totalTaxas > 0) {
          // Fórmula: Preço Final iFood = Preço com Markup ÷ (1 - (Taxa Marketplace + Taxa Antecipação))
          const divisor = 1 - (totalTaxas / 100)
          if (divisor > 0) {
            precoSugerido = precoSugerido / divisor
          }
        }
      }
    }

    return arredondarPara90(precoSugerido)
  }

  // Função para calcular status do preço baseado no preço sugerido (movida para antes do filtro)
  const calcularStatusPreco = (precoVenda: number, precoSugerido: number) => {
    if (precoSugerido === 0) return { status: 'indefinido', cor: 'gray', texto: 'N/A' }
    
    const diferencaPercentual = ((precoVenda - precoSugerido) / precoSugerido) * 100
    
    if (diferencaPercentual < -5) {
      return { status: 'ruim', cor: 'red', texto: 'Ruim' }
    } else if (diferencaPercentual >= -5 && diferencaPercentual <= 5) {
      return { status: 'bom', cor: 'green', texto: 'Bom' }
    } else {
      return { status: 'otimo', cor: 'blue', texto: 'Ótimo' }
    }
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || produto.categoria === selectedCategory
    
    // Filtro por status do preço
    let matchesStatusPreco = true
    if (selectedStatusPreco !== "all") {
      try {
        const precoSugerido = calcularPrecoSugerido(produto.preco_custo || 0, produto.categoria || '', 'Venda Direta')
        const statusPreco = calcularStatusPreco(produto.preco_venda || 0, precoSugerido)
        matchesStatusPreco = statusPreco.status === selectedStatusPreco
      } catch (error) {
        // Se houver erro no cálculo, não filtrar por status
        console.warn('Erro ao calcular status do preço:', error)
        matchesStatusPreco = true
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatusPreco
  })

  const { toast } = useToast()

  const handleSave = async () => {
    if (!formData.nome || !formData.codigoPdv || !formData.categoria || !formData.precoVenda) {
      const camposFaltando = []
      if (!formData.nome) camposFaltando.push("Nome")
      if (!formData.codigoPdv) camposFaltando.push("Código PDV")
      if (!formData.categoria) camposFaltando.push("Categoria")
      if (!formData.precoVenda) camposFaltando.push("Preço de Venda")
      
      toast({
        title: "Erro",
        description: `Preencha os campos obrigatórios: ${camposFaltando.join(", ")}`,
        variant: "destructive"
      })
      return
    }

    const precoVenda = parseFloat(formData.precoVenda)
    const precoVendaIfood = parseFloat(formData.precoVendaIfood) || 0
    const precoCusto = parseFloat(formData.precoCusto) || 0
    
    if (isNaN(precoVenda) || precoVenda <= 0) {
      toast({
        title: "Erro",
        description: "Preço de venda deve ser um número válido maior que zero.",
        variant: "destructive"
      })
      return
    }

    const margemLucro = precoCusto > 0 ? ((precoVenda - precoCusto) / precoVenda) * 100 : 0

    const produtoData = {
      nome: formData.nome,
      codigo_pdv: formData.codigoPdv,
      descricao: formData.descricao,
      categoria: formData.categoria,
      preco_custo: precoCusto,
      preco_venda: precoVenda,
      preco_venda_ifood: precoVendaIfood,
      margem_lucro: margemLucro,
      origem: 'manual' as const,
      observacoes: formData.observacoes,
      status: formData.ativo ? 'ativo' as const : 'inativo' as const,
      ficha_tecnica_id: formData.fichaTecnicaId || null,
      user_id: userData?.id || ''
    }

    try {
      if (editingProduto) {
        await updateProduto(editingProduto.id, produtoData)
        toast({ title: "Produto atualizado com sucesso!" })
      } else {
        await createProduto(produtoData)
        toast({ title: "Produto adicionado com sucesso!" })
      }
      
      setIsDialogOpen(false)
      setEditingProduto(null)
      resetForm()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (produto: any) => {
    setEditingProduto(produto)
    setFormData({
      nome: produto.nome,
      codigoPdv: produto.codigo_pdv || "",
      descricao: produto.descricao || "",
      categoria: produto.categoria || "",
      precoCusto: (produto.preco_custo || 0).toString(),
      precoVenda: (produto.preco_venda || 0).toString(),
      precoVendaIfood: (produto.preco_venda_ifood || 0).toString(),
      observacoes: produto.observacoes || "",
      ativo: produto.status === 'ativo',
      fichaTecnicaId: produto.ficha_tecnica_id || "",
      simulatedAdjustment: produto.simulatedAdjustment || null
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (produto: any) => {
    try {
      const dependencias = await verificarDependenciasProduto(produto.id)
      
      if (dependencias.temDependencias) {
        setDependenciasProduto(dependencias)
        setProdutoParaExcluir(produto)
        setIsDeleteModalOpen(true)
        return
      }

      await deleteProduto(produto.id)
      toast({ title: "Produto excluído com sucesso!" })
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir produto",
        variant: "destructive"
      })
    }
  }

  const confirmarExclusao = async () => {
    if (!produtoParaExcluir) return

    try {
      await deleteProduto(produtoParaExcluir.id)
      toast({ title: "Produto excluído com sucesso!" })
      setIsDeleteModalOpen(false)
      setProdutoParaExcluir(null)
      setDependenciasProduto(null)
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir produto",
        variant: "destructive"
      })
    }
  }

  const confirmarDesativacao = async () => {
    if (!produtoParaExcluir) return

    try {
      await desativarProduto(produtoParaExcluir.id)
      toast({ title: "Produto desativado com sucesso!" })
      setIsDeleteModalOpen(false)
      setProdutoParaExcluir(null)
      setDependenciasProduto(null)
    } catch (error: any) {
      console.error("Erro ao desativar produto:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar produto",
        variant: "destructive"
      })
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      const produto = produtos.find(p => p.id === id)
      const novoStatus = produto?.status === 'ativo' ? 'inativo' : 'ativo'
      
      await updateProduto(id, { status: novoStatus })
      
      toast({ 
        title: `Produto ${novoStatus === 'ativo' ? 'ativado' : 'desativado'}`,
        description: `${produto?.nome} foi ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso.`
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do produto.",
        variant: "destructive"
      })
    }
  }

  const getCategoryColor = (categoria: string) => {
    const colors = {
      "Combo": "bg-primary/10 text-primary",
      "Balde": "bg-accent/10 text-accent",
      "Porção": "bg-success/10 text-success",
      "Bebida": "bg-warning/10 text-warning",
      "Sobremesa": "bg-destructive/10 text-destructive"
    }
    return colors[categoria as keyof typeof colors] || "bg-muted/50 text-muted-foreground"
  }


  // Funções para calcular margens de contribuição
  const calcularMargemContribuicao = (precoVenda: number, precoCusto: number) => {
    const margemValor = precoVenda - precoCusto
    const margemPercentual = precoVenda > 0 ? (margemValor / precoVenda) * 100 : 0
    return { valor: margemValor, percentual: margemPercentual }
  }

  const calcularMargemIfood = (precoVendaIfood: number, precoCusto: number) => {
    const margemValor = precoVendaIfood - precoCusto
    const margemPercentual = precoVendaIfood > 0 ? (margemValor / precoVendaIfood) * 100 : 0
    return { valor: margemValor, percentual: margemPercentual }
  }


  // 🔄 Sincronização automática apenas quando necessário
  useEffect(() => {
    if (fichas.length > 0 && produtos.length >= 0 && !loading && !sincronizacaoExecutada) {
      sincronizarFichasNaoSincronizadas()
      setSincronizacaoExecutada(true)
    }
  }, [fichas.length, produtos.length, loading, sincronizacaoExecutada]) // Usar apenas .length para evitar loops

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) setUserData(user);
    };
    
    fetchUser();
  }, [])

  const sincronizarFichasNaoSincronizadas = async () => {
    if (!fichas || !produtos || fichas.length === 0) return

    try {
      const fichasNaoSincronizadas = fichas.filter(ficha => 
        !produtos.some(produto => produto.ficha_tecnica_id === ficha.id)
      )

      if (fichasNaoSincronizadas.length === 0) return

      let sincronizadas = 0
      for (const ficha of fichasNaoSincronizadas) {
        try {
          await sincronizarComProdutos(ficha)
          sincronizadas++
        } catch (error) {
          console.error(`Erro ao sincronizar ficha ${ficha.nome}:`, error)
        }
      }

      if (sincronizadas > 0) {
        await refresh()
      }
    } catch (error) {
      console.error('Erro na sincronização automática:', error)
    }
  }

  const salvarNovaCategoria = async () => {
    if (!novaCategoria.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a nova categoria",
        variant: "destructive"
      })
      return
    }
    
    const sucesso = await addCategoria(novaCategoria.trim())
    if (sucesso) {
      setFormData(prev => ({ ...prev, categoria: novaCategoria.trim() }))
      setNovaCategoria("")
      setIsModalCategoriaOpen(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      codigoPdv: "",
      descricao: "",
      categoria: "",
      precoCusto: "",
      precoVenda: "",
      precoVendaIfood: "",
      observacoes: "",
      ativo: true,
      fichaTecnicaId: "",
      simulatedAdjustment: null
    })
  }

  return (
    <Layout currentPage="produtos">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Produtos de Venda
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seu catálogo de produtos finais
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={() => {
                setEditingProduto(null)
                resetForm()
              }}>
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduto ? "Editar Produto" : "Adicionar Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduto 
                    ? "Edite as informações do produto e vincule ou desvincule de uma ficha técnica." 
                    : "Preencha as informações do produto. Todos os campos marcados com * são obrigatórios."
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Combo Família Grande"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="codigoPdv">Código PDV *</Label>
                  <Input
                    id="codigoPdv"
                    value={formData.codigoPdv}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigoPdv: e.target.value }))}
                    placeholder="Ex: PRD001"
                  />
                </div>
                
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.categoria} 
                      onValueChange={(value) => {
                        if (value === "nova") {
                          setIsModalCategoriaOpen(true)
                        } else {
                          setFormData(prev => ({ ...prev, categoria: value }))
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectItem value="nova">+ Nova Categoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="precoCusto">Preço de Custo (R$)</Label>
                  <Input
                    id="precoCusto"
                    type="number"
                    step="0.01"
                    value={formData.precoCusto}
                    onChange={(e) => setFormData(prev => ({ ...prev, precoCusto: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="precoVenda">Preço de Venda (R$) *</Label>
                  <Input
                    id="precoVenda"
                    type="number"
                    step="0.01"
                    value={formData.precoVenda}
                    onChange={(e) => setFormData(prev => ({ ...prev, precoVenda: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="precoVendaIfood">Preço de Venda IFood (R$)</Label>
                  <Input
                    id="precoVendaIfood"
                    type="number"
                    step="0.01"
                    value={formData.precoVendaIfood}
                    onChange={(e) => setFormData(prev => ({ ...prev, precoVendaIfood: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="simulatedAdjustment">Acréscimo Simulado (R$)</Label>
                  <Input
                    id="simulatedAdjustment"
                    type="number"
                    step="0.01"
                    min="-9999"
                    max="9999"
                    value={formData.simulatedAdjustment || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        simulatedAdjustment: value,
                      }));
                    }}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Simule ajustes no preço (frete, desconto, taxas extras)
                  </p>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Informações adicionais sobre o produto..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="fichaTecnica">Ficha Técnica (Opcional)</Label>
                  <Select 
                    value={formData.fichaTecnicaId || "none"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fichaTecnicaId: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma ficha técnica ou deixe vazio para desvincular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma ficha técnica</SelectItem>
                      {fichas.map(ficha => (
                        <SelectItem key={ficha.id} value={ficha.id}>
                          {ficha.nome} ({ficha.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecione uma ficha técnica para vincular ou "Nenhuma ficha técnica" para desvincular
                  </p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="origem">Origem do Produto</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Badge variant={editingProduto?.origem === 'ficha_tecnica' ? 'default' : editingProduto?.origem === 'importacao' ? 'secondary' : 'outline'}>
                      {editingProduto?.origem === 'ficha_tecnica' ? 'Ficha Técnica' : 
                       editingProduto?.origem === 'importacao' ? 'Importação' : 'Manual'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {editingProduto?.origem === 'ficha_tecnica' ? 'Produto criado a partir de uma ficha técnica' :
                       editingProduto?.origem === 'importacao' ? 'Produto importado de planilha' : 'Produto criado manualmente'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingProduto ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <ImportarPrecos 
            produtos={produtos} 
            onImportSuccess={() => {
              refresh()
              toast({
                title: "Sucesso!",
                description: "Preços importados com sucesso! A lista foi atualizada.",
                variant: "default"
              })
            }} 
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatusPreco} onValueChange={setSelectedStatusPreco}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Status Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ruim">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Ruim
                    </div>
                  </SelectItem>
                  <SelectItem value="bom">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Bom
                    </div>
                  </SelectItem>
                  <SelectItem value="otimo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Ótimo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Produtos</p>
                  <p className="text-2xl font-bold">{produtos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                  <p className="text-2xl font-bold">
                    {produtos.filter(p => p.status === 'ativo').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
                             <Card>
                     <CardContent className="p-4">
                       <div className="flex items-center gap-3">
                         <AlertTriangle className="h-8 w-8 text-warning" />
                         <div>
                           <p className="text-sm text-muted-foreground">Sem Custo</p>
                           <p className="text-2xl font-bold">
                             {produtos.filter(p => !p.preco_custo || p.preco_custo === 0).length}
                           </p>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Produtos ({filteredProdutos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Carregando produtos...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">Erro ao carregar produtos: {error}</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                                 <TableHeader>
                   <TableRow>
                     <TableHead>Status</TableHead>
                     <TableHead>Produto</TableHead>
                     <TableHead>Código PDV</TableHead>
                     <TableHead>Categoria</TableHead>
                     <TableHead>Preço Custo</TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">Preço VD</TooltipTrigger>
                           <TooltipContent>
                             <p>Preço de Venda Direta</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">Preço IFood</TooltipTrigger>
                           <TooltipContent>
                             <p>Preço de Venda no IFood</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">MC VD (R$)</TooltipTrigger>
                           <TooltipContent>
                             <p>Margem de Contribuição Venda Direta em Reais</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">MC VD (%)</TooltipTrigger>
                           <TooltipContent>
                             <p>Margem de Contribuição Venda Direta em Percentual</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">MC IFOOD (R$)</TooltipTrigger>
                           <TooltipContent>
                             <p>Margem de Contribuição IFood em Reais</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">MC IFOOD (%)</TooltipTrigger>
                           <TooltipContent>
                             <p>Margem de Contribuição IFood em Percentual</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">Preço Sugerido VD</TooltipTrigger>
                           <TooltipContent>
                             <p>Preço Sugerido para Venda Direta</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">Preço Sugerido IFood</TooltipTrigger>
                           <TooltipContent>
                             <p>Preço Sugerido para IFood</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">Status Preço</TooltipTrigger>
                           <TooltipContent>
                             <p>Status baseado na comparação com preço sugerido</p>
                             <p>• Ruim: PV menor que 5% do sugerido</p>
                             <p>• Bom: PV entre -5% a +5% do sugerido</p>
                             <p>• Ótimo: PV maior que 5% do sugerido</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </TableHead>
                     <TableHead>Ações</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {filteredProdutos.map((produto) => (
                    <TableRow key={produto.id} className={produto.status !== 'ativo' ? "opacity-60" : ""}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(produto.id)}
                          className="p-1 h-auto"
                        >
                          {produto.status === 'ativo' ? (
                            <div className="flex items-center gap-2 text-success">
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-xs font-medium">Ativo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <XCircle className="h-5 w-5" />
                              <span className="text-xs font-medium">Inativo</span>
                            </div>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{produto.nome}</p>
                            {produto.observacoes && (
                              <p className="text-sm text-muted-foreground">{produto.observacoes}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{produto.codigo_pdv || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(produto.categoria)}>
                          {produto.categoria || 'Sem categoria'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {produto.preco_custo?.toFixed(2) || '0,00'}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {produto.preco_venda?.toFixed(2) || '0,00'}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {produto.preco_venda_ifood?.toFixed(2) || '0,00'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        R$ {calcularMargemContribuicao(produto.preco_venda || 0, produto.preco_custo || 0).valor.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {calcularMargemContribuicao(produto.preco_venda || 0, produto.preco_custo || 0).percentual.toFixed(1)}%
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        R$ {calcularMargemIfood(produto.preco_venda_ifood || 0, produto.preco_custo || 0).valor.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {calcularMargemIfood(produto.preco_venda_ifood || 0, produto.preco_custo || 0).percentual.toFixed(1)}%
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        R$ {calcularPrecoSugerido(produto.preco_custo || 0, produto.categoria || '', 'Venda Direta').toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-accent">
                        R$ {calcularPrecoSugerido(produto.preco_custo || 0, produto.categoria || '', 'iFood').toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          try {
                            const precoSugerido = calcularPrecoSugerido(produto.preco_custo || 0, produto.categoria || '', 'Venda Direta')
                            const statusPreco = calcularStatusPreco(produto.preco_venda || 0, precoSugerido)
                            return (
                              <Badge 
                                variant={statusPreco.status === 'ruim' ? 'destructive' : statusPreco.status === 'bom' ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  statusPreco.status === 'ruim' ? 'bg-red-100 text-red-800' :
                                  statusPreco.status === 'bom' ? 'bg-green-100 text-green-800' :
                                  statusPreco.status === 'otimo' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {statusPreco.texto}
                              </Badge>
                            )
                          } catch (error) {
                            console.warn('Erro ao calcular status do preço na tabela:', error)
                            return (
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
                                N/A
                              </Badge>
                            )
                          }
                        })()}
                      </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(produto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(produto)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalCategoriaOpen} onOpenChange={setIsModalCategoriaOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
              <DialogDescription>
                Digite o nome da nova categoria que será criada e estará disponível para todos os produtos.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Input
                placeholder="Nome da nova categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalCategoriaOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarNovaCategoria}>
                  Salvar Categoria
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão de Produto</DialogTitle>
              <DialogDescription>
                O produto "{produtoParaExcluir?.nome}" está sendo usado em outras partes do sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Dependências encontradas:</h4>
                
                {dependenciasProduto?.fichasTecnicas && dependenciasProduto.fichasTecnicas.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-yellow-700 mb-1">Fichas técnicas (como produto final):</p>
                    <ul className="text-sm text-yellow-600 ml-4">
                      {dependenciasProduto.fichasTecnicas.map((ficha: string, index: number) => (
                        <li key={index} className="list-disc">• {ficha}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dependenciasProduto?.fichasProdutosProntos && dependenciasProduto.fichasProdutosProntos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-yellow-700 mb-1">Fichas técnicas (como produto pronto):</p>
                    <ul className="text-sm text-yellow-600 ml-4">
                      {dependenciasProduto.fichasProdutosProntos.map((ficha: string, index: number) => (
                        <li key={index} className="list-disc">• {ficha}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">💡 Opções disponíveis:</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• <strong>Desativar:</strong> Remove o produto da lista ativa, mas mantém os dados</li>
                  <li>• <strong>Excluir:</strong> Remove permanentemente (não recomendado se há dependências)</li>
                  <li>• <strong>Cancelar:</strong> Remove as vinculações primeiro e tente novamente</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setProdutoParaExcluir(null)
                    setDependenciasProduto(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={confirmarDesativacao}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Desativar Produto
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmarExclusao}
                >
                  Excluir Permanentemente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}