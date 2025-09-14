import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useInsumos } from "@/hooks/useInsumos"
import { 
  ShoppingCart, 
  Package, 
  Filter,
  Plus,
  Minus,
  CheckCircle,
  Circle,
  MessageCircle,
  Send,
  Loader2
} from "lucide-react"
import type { InsumoComFornecedor } from "@/integrations/supabase/types"

// Lista padrão de depósitos
const DEPOSITOS_PADRAO = [
  'Depósito Principal',
  'Depósito Seco',
  'Depósito Congelados',
  'Câmara Fria',
  'Depósito Padaria',
  'Balcão',
  'Cozinha',
  'Freezers',
  'Corredor'
]

interface ListaComprasProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ListaCompras({ open, onOpenChange }: ListaComprasProps) {
  const { toast } = useToast()
  const { insumos, loading } = useInsumos()
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [filtroDeposito, setFiltroDeposito] = useState<string>("todos")
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>("todos")
  const [insumosVerificados, setInsumosVerificados] = useState<Set<string>>(new Set())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Filtrar apenas insumos ativos
  const insumosParaCompra = insumos.filter(insumo => 
    insumo.ativo === true
  )
  
  // Obter lista de depósitos únicos dos insumos
  const depositosDosInsumos = Array.from(
    new Set(insumosParaCompra.map(insumo => insumo.deposito).filter(Boolean))
  )
  
  // Combinar depósitos padrão com depósitos únicos dos insumos
  const depositosUnicos = Array.from(
    new Set([...DEPOSITOS_PADRAO, ...depositosDosInsumos])
  ).sort()
  
  // Obter lista de fornecedores únicos
  const fornecedoresUnicos = Array.from(
    new Set(
      insumosParaCompra
        .map(insumo => (insumo as any).fornecedor)
        .filter(Boolean)
    )
  ).sort()
  
  // Aplicar filtros de depósito e fornecedor
  const insumosFiltrados = insumosParaCompra.filter(insumo => {
    const passaFiltroDeposito = filtroDeposito === "todos" || insumo.deposito === filtroDeposito
    const passaFiltroFornecedor = filtroFornecedor === "todos" || (insumo as any).fornecedor === filtroFornecedor
    return passaFiltroDeposito && passaFiltroFornecedor
  })

  // Contar insumos verificados na lista filtrada
  const insumosVerificadosNaLista = insumosFiltrados.filter(insumo => insumosVerificados.has(insumo.id)).length

  // Calcular valor total
  const calcularValorTotal = () => {
    return insumosFiltrados.reduce((total, insumo) => {
      const quantidade = quantidades[insumo.id] || insumo.quantidade_comprar
      if (quantidade > 0) {
        const valorInsumo = quantidade * insumo.preco_por_unidade * insumo.quantidade_minima_compra
        return total + valorInsumo
      }
      return total
    }, 0)
  }

  const valorTotal = calcularValorTotal()

  // Obter fornecedores com itens selecionados
  const fornecedoresComItens = fornecedoresUnicos.filter(fornecedor => {
    return insumosFiltrados.some(insumo => {
      const quantidade = quantidades[insumo.id] || insumo.quantidade_comprar
      return (insumo as any).fornecedor === fornecedor && quantidade > 0
    })
  })

  // Função para gerar mensagem do WhatsApp por fornecedor
  const gerarMensagemWhatsApp = (fornecedor: string) => {
    const insumosDoFornecedor = insumosFiltrados.filter(insumo => {
      const quantidade = quantidades[insumo.id] || insumo.quantidade_comprar
      return (insumo as any).fornecedor === fornecedor && quantidade > 0
    })
  
    if (insumosDoFornecedor.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: `Não há itens com quantidade para o fornecedor ${fornecedor}`,
        variant: "destructive"
      })
      return
    }
  
    let mensagem = `🛒 *Lista de Compras - ${fornecedor}*\n\n`
    let valorTotalFornecedor = 0
  
    insumosDoFornecedor.forEach(insumo => {
      const quantidadeMarcada = quantidades[insumo.id] || insumo.quantidade_comprar
      // Quantidade total = quantidade marcada no form × quantidade mínima
      const quantidadeTotal = quantidadeMarcada * insumo.quantidade_minima_compra
      const valorItem = quantidadeMarcada * insumo.preco_por_unidade * insumo.quantidade_minima_compra
      valorTotalFornecedor += valorItem
      
      mensagem += `• ${insumo.nome}\n`
      mensagem += `  Qtd: ${quantidadeTotal} ${insumo.unidade_medida}\n`
      mensagem += `  Valor: R$ ${valorItem.toFixed(2)}\n\n`
    })
  
    mensagem += `💰 *Total: R$ ${valorTotalFornecedor.toFixed(2)}*\n\n`
    
    // Adicionar data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    mensagem += `Enviado via ZapPrice 🚀 - ${dataAtual}`
  
    const mensagemCodificada = encodeURIComponent(mensagem)
    const urlWhatsApp = `https://wa.me/?text=${mensagemCodificada}`
    
    window.open(urlWhatsApp, '_blank')
    
    toast({
      title: "WhatsApp aberto",
      description: `Mensagem preparada para ${fornecedor}`,
      variant: "default"
    })
  }

  const incrementarQuantidade = (insumoId: string) => {
    setQuantidades(prev => ({
      ...prev,
      [insumoId]: (prev[insumoId] || 0) + 1
    }))
  }

  const decrementarQuantidade = (insumoId: string) => {
    setQuantidades(prev => {
      const novaQuantidade = Math.max(0, (prev[insumoId] || 0) - 1)
      return {
        ...prev,
        [insumoId]: novaQuantidade
      }
    })
  }

  const toggleVerificado = (insumoId: string) => {
    setInsumosVerificados(prev => {
      const newSet = new Set(prev)
      if (newSet.has(insumoId)) {
        newSet.delete(insumoId)
      } else {
        newSet.add(insumoId)
      }
      return newSet
    })
  }

  const marcarTodosComoVerificados = () => {
    const idsInsumosFiltrados = new Set(insumosFiltrados.map(insumo => insumo.id))
    setInsumosVerificados(prev => {
      const newSet = new Set(prev)
      idsInsumosFiltrados.forEach(id => newSet.add(id))
      return newSet
    })
    toast({
      title: "Todos marcados como verificados",
      description: `${insumosFiltrados.length} insumos marcados como verificados`
    })
  }

  const desmarcarTodos = () => {
    setInsumosVerificados(new Set())
    toast({
      title: "Todos desmarcados",
      description: "Todos os insumos foram desmarcados"
    })
  }

  const limparQuantidades = () => {
    setQuantidades({})
    toast({
      title: "Quantidades zeradas",
      description: "Todas as quantidades foram zeradas"
    })
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Lista de Compras
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando insumos...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Lista de Compras
          </DialogTitle>
          <DialogDescription>
            Gerencie sua lista de compras de insumos com filtros por depósito e fornecedor
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg"
          >
            📋 Filtrar
          </button>

          {/* Filtros e Estatísticas */}
          <div className="flex flex-col gap-4 pb-4 border-b flex-shrink-0">
            {/* Filtros */}
            <div
              className={`${
                isMenuOpen ? 'block' : 'hidden'
              } md:block absolute top-16 left-4 right-4 bg-white p-4 rounded-lg shadow-xl z-40 md:static md:shadow-none`}
            >
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={filtroDeposito} onValueChange={setFiltroDeposito}>
                  <SelectTrigger className="w-full sm:w-[140px] min-h-[48px]">
                    <SelectValue placeholder="Depósito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Depósitos</SelectItem>
                    {depositosUnicos.map(deposito => (
                      <SelectItem key={deposito} value={deposito}>
                        {deposito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
                  <SelectTrigger className="w-full sm:w-[160px] min-h-[48px]">
                    <SelectValue placeholder="Fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Fornecedores</SelectItem>
                    {fornecedoresUnicos.map(fornecedor => (
                      <SelectItem key={fornecedor} value={fornecedor}>
                        {fornecedor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Itens</p>
                    <p className="text-sm font-semibold">{insumosFiltrados.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Verificados</p>
                    <p className="text-sm font-semibold">{insumosVerificadosNaLista}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fornecedores</p>
                    <p className="text-sm font-semibold">{fornecedoresComItens.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">R$</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-sm font-semibold">R$ {valorTotal.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="min-h-[48px]"
                onClick={marcarTodosComoVerificados}
                disabled={insumosFiltrados.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar Todos
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="min-h-[48px]"
                onClick={desmarcarTodos}
                disabled={insumosVerificados.size === 0}
              >
                <Circle className="h-4 w-4 mr-1" />
                Desmarcar Todos
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="min-h-[48px]"
                onClick={limparQuantidades}
                disabled={Object.keys(quantidades).length === 0}
              >
                Zerar Quantidades
              </Button>
            </div>
          </div>

          {/* Lista de Insumos */}
          <div className="flex-1 overflow-auto min-h-0">
            {insumosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum insumo para compra</h3>
                <p className="text-muted-foreground">
                  {insumosParaCompra.length === 0 
                    ? "Não há insumos com quantidade para compra definida."
                    : "Nenhum insumo corresponde aos filtros selecionados."
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">✓</TableHead>
                        <TableHead className="min-w-[200px]">Insumo</TableHead>
                        <TableHead className="w-[80px]">Depósito</TableHead>
                        <TableHead className="w-[130px]">Fornecedor</TableHead>
                        <TableHead className="w-[80px]">Preço Unit.</TableHead>
                        <TableHead className="w-[80px]">Qtd. Mín.</TableHead>
                        <TableHead className="w-[120px]">Quantidade</TableHead>
                        <TableHead className="w-[100px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insumosFiltrados.map((insumo: InsumoComFornecedor) => {
                        const quantidade = quantidades[insumo.id] || insumo.quantidade_comprar
                        const verificado = insumosVerificados.has(insumo.id)
                        const valorTotal = quantidade * insumo.preco_por_unidade * insumo.quantidade_minima_compra
                        
                        return (
                          <TableRow key={insumo.id} className={verificado ? 'bg-green-50' : ''}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleVerificado(insumo.id)}
                                className="h-6 w-6 p-0"
                              >
                                {verificado ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className={`font-medium ${verificado ? 'text-green-800' : ''}`}>
                              <div className="max-w-[230px]">
                                <p className="truncate" title={insumo.nome}>
                                  {insumo.nome}
                                </p>
                                {insumo.codigo_insumo && (
                                  <p className="text-xs text-muted-foreground">
                                    {insumo.codigo_insumo}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[80px]">
                                <p className="truncate" title={insumo.deposito || 'N/A'}>
                                  {insumo.deposito || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[130px]">
                                <p className="truncate" title={(insumo as any).fornecedor || 'N/A'}>
                                  {(insumo as any).fornecedor || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              R$ {insumo.preco_por_unidade.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {insumo.quantidade_minima_compra}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => decrementarQuantidade(insumo.id)}
                                  className="h-6 w-6 p-0"
                                  disabled={quantidade <= 0}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={quantidade}
                                  onChange={(e) => {
                                    const valor = Math.max(0, parseInt(e.target.value) || 0)
                                    setQuantidades(prev => ({
                                      ...prev,
                                      [insumo.id]: valor
                                    }))
                                  }}
                                  className="w-16 h-6 text-center text-xs"
                                  min="0"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => incrementarQuantidade(insumo.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              R$ {valorTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3 mt-20 md:mt-0">
                  {insumosFiltrados.map((insumo: InsumoComFornecedor) => {
                    const quantidade = quantidades[insumo.id] || insumo.quantidade_comprar
                    const verificado = insumosVerificados.has(insumo.id)
                    const valorTotal = quantidade * insumo.preco_por_unidade * insumo.quantidade_minima_compra
                    
                    return (
                      <Card key={insumo.id} className={`p-4 ${verificado ? 'bg-green-50 border-green-200' : ''}`}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleVerificado(insumo.id)}
                                  className="h-8 w-8 p-0 min-h-[48px] min-w-[48px]"
                                >
                                  {verificado ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-medium text-lg whitespace-normal ${verificado ? 'text-green-800' : ''}`}>
                                    {insumo.nome}
                                  </h3>
                                  {insumo.codigo_insumo && (
                                    <p className="text-sm text-muted-foreground">
                                      {insumo.codigo_insumo}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Depósito:</span>
                              <p className="font-medium">{insumo.deposito || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fornecedor:</span>
                              <p className="font-medium">{(insumo as any).fornecedor || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Preço Unit.:</span>
                              <p className="font-medium">R$ {insumo.preco_por_unidade.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qtd. Mín.:</span>
                              <p className="font-medium">{insumo.quantidade_minima_compra}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Quantidade:</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => decrementarQuantidade(insumo.id)}
                                  className="h-8 w-8 p-0 min-h-[48px] min-w-[48px]"
                                  disabled={quantidade <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  value={quantidade}
                                  onChange={(e) => {
                                    const valor = Math.max(0, parseInt(e.target.value) || 0)
                                    setQuantidades(prev => ({
                                      ...prev,
                                      [insumo.id]: valor
                                    }))
                                  }}
                                  className="w-20 h-8 text-center text-sm min-h-[48px]"
                                  min="0"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => incrementarQuantidade(insumo.id)}
                                  className="h-8 w-8 p-0 min-h-[48px] min-w-[48px]"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-muted-foreground">Total:</span>
                              <p className="text-lg font-bold text-primary">R$ {valorTotal.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Resumo por Fornecedor e WhatsApp */}
          {fornecedoresComItens.length > 0 && (
            <div className="border-t pt-4 mt-4 flex-shrink-0">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Enviar por WhatsApp
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-32 overflow-y-auto">
                {fornecedoresComItens.map(fornecedor => {
                  const itensCount = insumosFiltrados.filter(insumo => {
                    const quantidade = quantidades[insumo.id] || insumo.quantidade_comprar
                    return (insumo as any).fornecedor === fornecedor && quantidade > 0
                  }).length
                  
                  const valorFornecedor = insumosFiltrados
                    .filter(insumo => (insumo as any).fornecedor === fornecedor)
                    .reduce((total, insumo) => {
                      const quantidade = quantidades[insumo.id] || insumo.quantidade_comprar
                      if (quantidade > 0) {
                        return total + (quantidade * insumo.preco_por_unidade * insumo.quantidade_minima_compra)
                      }
                      return total
                    }, 0)
                  
                  return (
                    <div key={fornecedor} className="flex items-center justify-between p-2 bg-white rounded border gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate" title={fornecedor}>
                          {fornecedor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {itensCount} {itensCount === 1 ? 'item' : 'itens'} • R$ {valorFornecedor.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => gerarMensagemWhatsApp(fornecedor)}
                        className="h-8 px-2 text-xs min-h-[48px]"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Enviar
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}