import { useState } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useDespesasFixas, DespesaFixa, NovaDespesaFixa } from "@/hooks/useDespesasFixas"
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2,
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt,
  Building,
  Zap,
  Wifi,
  Car,
  Users,
  Save,
  Search,
  Settings2
} from "lucide-react"

// Tipos para categorias
interface Categoria {
  label: string
  icon: string
  color: string
}

type CategoriaKey = string
type CategoriasType = Record<CategoriaKey, Categoria>

// Dados vindos do Supabase

const iconesDisponiveis = {
  Building, Zap, Wifi, Users, Car, Receipt, DollarSign, Calendar, TrendingUp, TrendingDown
}

const initialCategorias = {
  estrutura: { label: "Estrutura", icon: "Building", color: "text-primary" },
  utilitarios: { label: "Utilitários", icon: "Zap", color: "text-warning" },
  tecnologia: { label: "Tecnologia", icon: "Wifi", color: "text-accent" },
  servicos: { label: "Serviços", icon: "Users", color: "text-success" },
  transporte: { label: "Transporte", icon: "Car", color: "text-destructive" },
  seguros: { label: "Seguros", icon: "Receipt", color: "text-muted-foreground" }
}

export default function DespesasFixas() {
  const { 
    despesas, 
    loading, 
    error, 
    createDespesa, 
    updateDespesa, 
    deleteDespesa, 
    getTotalMensal,
    getDespesasByStatus 
  } = useDespesasFixas()
  
  const [categorias, setCategorias] = useState<CategoriasType>(initialCategorias)
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [busca, setBusca] = useState("")
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogCategoriasAberto, setDialogCategoriasAberto] = useState(false)
  const [despesaEditando, setDespesaEditando] = useState<DespesaFixa | null>(null)
  const [categoriaEditando, setCategoriaEditando] = useState<{ key: string; categoria: Categoria } | null>(null)
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Formulário para categoria
  const [formularioCategoria, setFormularioCategoria] = useState({
    key: "",
    label: "",
    icon: "Building",
    color: "text-primary"
  })

  // Formulário para nova despesa
  const [formulario, setFormulario] = useState({
    nome: "",
    categoria: "",
    valor: "",
    frequencia: "mensal" as 'mensal' | 'anual' | 'semanal' | 'quinzenal',
    dia_vencimento: "",
    descricao: "",
    status: "ativa" as 'ativa' | 'inativa'
  })

  const despesasFiltradas = despesas.filter(despesa => {
    const matchBusca = despesa.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      despesa.descricao?.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = filtroCategoria === "todas" || despesa.categoria === filtroCategoria
    return matchBusca && matchCategoria
  })

  const totalMensal = getTotalMensal()

  const totalPorCategoria = Object.keys(categorias).map(categoria => ({
    categoria,
    total: despesas
      .filter(d => d.status === 'ativa' && d.categoria === categoria)
      .reduce((total, despesa) => {
        // Converter para valor mensal baseado na frequência
        switch (despesa.frequencia) {
          case 'mensal':
            return total + despesa.valor;
          case 'quinzenal':
            return total + (despesa.valor * 2);
          case 'semanal':
            return total + (despesa.valor * 4.33);
          case 'anual':
            return total + (despesa.valor / 12);
          default:
            return total;
        }
      }, 0)
  })).filter(item => item.total > 0)

  const resetarFormulario = () => {
    setFormulario({
      nome: "",
      categoria: "",
      valor: "",
      frequencia: "mensal",
      dia_vencimento: "",
      descricao: "",
      status: "ativa"
    })
    setDespesaEditando(null)
  }

  const abrirEdicao = (despesa: DespesaFixa) => {
    setDespesaEditando(despesa)
    setFormulario({
      nome: despesa.nome,
      categoria: despesa.categoria,
      valor: despesa.valor.toString(),
      frequencia: despesa.frequencia,
      dia_vencimento: despesa.dia_vencimento?.toString() || "",
      descricao: despesa.descricao || "",
      status: despesa.status
    })
    setDialogAberto(true)
  }

  const salvarDespesa = async () => {
    if (!formulario.nome || !formulario.categoria || !formulario.valor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    const dadosDespesa: NovaDespesaFixa = {
      nome: formulario.nome,
      categoria: formulario.categoria,
      valor: parseFloat(formulario.valor),
      frequencia: formulario.frequencia,
      dia_vencimento: formulario.dia_vencimento ? parseInt(formulario.dia_vencimento) : undefined,
      descricao: formulario.descricao,
      status: formulario.status
    }

    try {
      if (despesaEditando) {
        const sucesso = await updateDespesa(despesaEditando.id, dadosDespesa)
        if (sucesso) {
          toast({
            title: "Sucesso",
            description: "Despesa atualizada com sucesso!"
          })
        } else {
          toast({
            title: "Erro",
            description: "Erro ao atualizar despesa",
            variant: "destructive"
          })
          return
        }
      } else {
        const novaDespesa = await createDespesa(dadosDespesa)
        if (novaDespesa) {
          toast({
            title: "Sucesso", 
            description: "Nova despesa cadastrada!"
          })
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar despesa",
            variant: "destructive"
          })
          return
        }
      }

      setDialogAberto(false)
      resetarFormulario()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar despesa",
        variant: "destructive"
      })
    }
  }

  const excluirDespesa = async (id: string) => {
    try {
      const sucesso = await deleteDespesa(id)
      if (sucesso) {
        toast({
          title: "Sucesso",
          description: "Despesa excluída com sucesso!"
        })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao excluir despesa",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa",
        variant: "destructive"
      })
    }
  }

  const alternarStatus = async (id: string) => {
    const despesa = despesas.find(d => d.id === id)
    if (!despesa) return

    const novoStatus = despesa.status === 'ativa' ? 'inativa' : 'ativa'
    try {
      const sucesso = await updateDespesa(id, { status: novoStatus })
      if (sucesso) {
        toast({
          title: "Sucesso",
          description: `Despesa ${novoStatus === 'ativa' ? 'ativada' : 'inativada'} com sucesso!`
        })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao alterar status da despesa",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status da despesa",
        variant: "destructive"
      })
    }
  }

  const getCategoriaInfo = (categoria: string) => {
    const info = categorias[categoria] || categorias.servicos
    return {
      ...info,
      icon: iconesDisponiveis[info.icon as keyof typeof iconesDisponiveis] || iconesDisponiveis.Building
    }
  }

  // Funções para gerenciar categorias
  const resetarFormularioCategoria = () => {
    setFormularioCategoria({
      key: "",
      label: "",
      icon: "Building",
      color: "text-primary"
    })
    setCategoriaEditando(null)
  }

  const abrirEdicaoCategoria = (key: string, categoria: Categoria) => {
    setCategoriaEditando({ key, categoria })
    setFormularioCategoria({
      key,
      label: categoria.label,
      icon: categoria.icon,
      color: categoria.color
    })
    setDialogCategoriasAberto(true)
  }

  const salvarCategoria = () => {
    if (!formularioCategoria.key || !formularioCategoria.label) {
      toast({
        title: "Erro",
        description: "Preencha a chave e o nome da categoria",
        variant: "destructive"
      })
      return
    }

    const novaCategoria: Categoria = {
      label: formularioCategoria.label,
      icon: formularioCategoria.icon,
      color: formularioCategoria.color
    }

    setCategorias(prev => ({
      ...prev,
      [formularioCategoria.key]: novaCategoria
    }))

    toast({
      title: "Sucesso",
      description: categoriaEditando ? "Categoria atualizada!" : "Nova categoria criada!"
    })

    setDialogCategoriasAberto(false)
    resetarFormularioCategoria()
  }

  const excluirCategoria = (key: string) => {
    // Verifica se existe despesa usando esta categoria
    const despesasUsandoCategoria = despesas.filter(d => d.categoria === key)
    if (despesasUsandoCategoria.length > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir uma categoria que está sendo usada por despesas",
        variant: "destructive"
      })
      return
    }

    setCategorias(prev => {
      const novasCategorias = { ...prev }
      delete novasCategorias[key]
      return novasCategorias
    })

    toast({
      title: "Sucesso",
      description: "Categoria excluída com sucesso!"
    })
  }

  // Mostrar loading se estiver carregando
  if (loading) {
    return (
      <Layout currentPage="despesas">
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando despesas fixas...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <Layout currentPage="despesas">
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-destructive mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Erro ao carregar despesas</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout currentPage="despesas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Despesas Fixas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as despesas fixas do seu negócio
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg"
          >
            📋 Filtrar
          </button>
          
          <div className="flex gap-2">
            <Dialog open={dialogCategoriasAberto} onOpenChange={setDialogCategoriasAberto}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={resetarFormularioCategoria}>
                  <Settings2 className="h-4 w-4" />
                  Categorias
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Gerenciar Categorias</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Formulário para nova categoria */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="key">Chave *</Label>
                          <Input
                            id="key"
                            value={formularioCategoria.key}
                            onChange={(e) => setFormularioCategoria(prev => ({ ...prev, key: e.target.value }))}
                            placeholder="Ex: marketing"
                            disabled={!!categoriaEditando}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="label">Nome *</Label>
                          <Input
                            id="label"
                            value={formularioCategoria.label}
                            onChange={(e) => setFormularioCategoria(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Ex: Marketing"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="icon">Ícone</Label>
                          <Select value={formularioCategoria.icon} onValueChange={(value) => setFormularioCategoria(prev => ({ ...prev, icon: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border z-50">
                              {Object.entries(iconesDisponiveis).map(([nome, IconeComponent]) => (
                                <SelectItem key={nome} value={nome}>
                                  <div className="flex items-center gap-2">
                                    <IconeComponent className="h-4 w-4" />
                                    {nome}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Cor</Label>
                          <Select value={formularioCategoria.color} onValueChange={(value) => setFormularioCategoria(prev => ({ ...prev, color: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border z-50">
                              <SelectItem value="text-primary">Primária</SelectItem>
                              <SelectItem value="text-success">Sucesso</SelectItem>
                              <SelectItem value="text-warning">Aviso</SelectItem>
                              <SelectItem value="text-destructive">Destrutiva</SelectItem>
                              <SelectItem value="text-accent">Accent</SelectItem>
                              <SelectItem value="text-muted-foreground">Secundária</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={resetarFormularioCategoria} className="flex-1">
                          Cancelar
                        </Button>
                        <Button onClick={salvarCategoria} className="flex-1">
                          <Save className="h-4 w-4" />
                          Salvar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de categorias existentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Categorias Existentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(categorias).map(([key, categoria]) => {
                          const IconeComponent = iconesDisponiveis[categoria.icon as keyof typeof iconesDisponiveis] || Building
                          return (
                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-primary/10 ${categoria.color}`}>
                                  <IconeComponent className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{categoria.label}</p>
                                  <p className="text-sm text-muted-foreground">{key}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => abrirEdicaoCategoria(key, categoria)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir a categoria "{categoria.label}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => excluirCategoria(key)}
                                        className="bg-destructive text-destructive-foreground"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button onClick={resetarFormulario}>
                  <Plus className="h-4 w-4" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {despesaEditando ? "Editar Despesa" : "Nova Despesa Fixa"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formulario.nome}
                        onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Aluguel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select value={formulario.categoria} onValueChange={(value) => setFormulario(prev => ({ ...prev, categoria: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categorias).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={formulario.valor}
                        onChange={(e) => setFormulario(prev => ({ ...prev, valor: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequencia">Frequência *</Label>
                      <Select value={formulario.frequencia} onValueChange={(value: 'mensal' | 'anual' | 'semanal' | 'quinzenal') => setFormulario(prev => ({ ...prev, frequencia: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="quinzenal">Quinzenal</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dia_vencimento">Dia do Vencimento</Label>
                    <Input
                      id="dia_vencimento"
                      type="number"
                      min="1"
                      max="31"
                      value={formulario.dia_vencimento}
                      onChange={(e) => setFormulario(prev => ({ ...prev, dia_vencimento: e.target.value }))}
                      placeholder="10 (opcional)"
                    />
                    <p className="text-sm text-muted-foreground">Dia do mês em que a despesa vence (opcional)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formulario.descricao}
                      onChange={(e) => setFormulario(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Detalhes adicionais sobre a despesa..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Despesa Ativa</Label>
                      <p className="text-sm text-muted-foreground">Incluir nos cálculos</p>
                    </div>
                    <Switch
                      checked={formulario.status === 'ativa'}
                      onCheckedChange={(checked) => setFormulario(prev => ({ ...prev, status: checked ? 'ativa' : 'inativa' }))}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogAberto(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={salvarDespesa} className="flex-1">
                      <Save className="h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-20 md:mt-0">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Mensal</p>
                  <p className="text-lg md:text-2xl font-bold text-primary">R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Despesas Ativas</p>
                  <p className="text-lg md:text-2xl font-bold text-success">{getDespesasByStatus('ativa').length}</p>
                </div>
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Despesas Inativas</p>
                  <p className="text-lg md:text-2xl font-bold text-muted-foreground">{getDespesasByStatus('inativa').length}</p>
                </div>
                <TrendingDown className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div
              className={`${
                isMenuOpen ? 'block' : 'hidden'
              } md:block absolute top-16 left-4 right-4 bg-white p-4 rounded-lg shadow-xl z-40 md:static md:shadow-none`}
            >
              <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar despesas..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {Object.entries(categorias).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Despesas */}
          <div className="lg:col-span-2 space-y-4">
            {despesasFiltradas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {busca || filtroCategoria !== "todas" 
                      ? "Nenhuma despesa encontrada com os filtros aplicados"
                      : "Nenhuma despesa cadastrada"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              despesasFiltradas.map(despesa => {
                const categoriaInfo = getCategoriaInfo(despesa.categoria)
                const IconeCategoria = categoriaInfo.icon
                
                return (
                  <Card key={despesa.id} className={despesa.status !== 'ativa' ? "opacity-60" : ""}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-lg bg-primary/10 ${categoriaInfo.color}`}>
                            <IconeCategoria className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{despesa.nome}</h3>
                              <Badge variant={despesa.status === 'ativa' ? "default" : "secondary"}>
                                {despesa.status === 'ativa' ? "Ativa" : "Inativa"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {despesa.frequencia}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {categoriaInfo.label}
                              {despesa.dia_vencimento && ` • Vence dia ${despesa.dia_vencimento}`}
                            </p>
                            {despesa.descricao && (
                              <p className="text-sm text-muted-foreground mb-2">{despesa.descricao}</p>
                            )}
                            <p className="text-lg font-bold text-primary">
                              R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={despesa.status === 'ativa'} 
                              onCheckedChange={() => alternarStatus(despesa.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {despesa.status === 'ativa' ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[48px] min-w-[48px]"
                              onClick={() => abrirEdicao(despesa)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="min-h-[48px] min-w-[48px]">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a despesa "{despesa.nome}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => excluirDespesa(despesa.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Resumo por Categoria */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Resumo por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalPorCategoria.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma despesa ativa
                  </p>
                ) : (
                  totalPorCategoria.map(({ categoria, total }) => {
                    const categoriaInfo = getCategoriaInfo(categoria)
                    const IconeCategoria = categoriaInfo.icon
                    const percentual = (total / totalMensal) * 100
                    
                    return (
                      <div key={categoria} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconeCategoria className={`h-4 w-4 ${categoriaInfo.color}`} />
                            <span className="text-sm font-medium">{categoriaInfo.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className="text-xs text-muted-foreground">{percentual.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  )
}