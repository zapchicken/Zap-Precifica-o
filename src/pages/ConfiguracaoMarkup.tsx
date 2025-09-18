import { useState, useEffect, useCallback, useRef } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Settings, 
  Calculator, 
  Percent,
  TrendingUp,
  Target,
  DollarSign,
  Smartphone,
  ShoppingBag,
  Store,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  Download,
  AlertTriangle,
  Info,
  RefreshCw
} from "lucide-react"
import { useMarkup } from "@/hooks/useMarkup"

export default function ConfiguracaoMarkup() {
  const { 
    loading,
    configGeral,
    setConfigGeral,
    canaisVenda,
    configCategorias,
    modelos,
    calculosMarkup,
    salvarConfigGeral,
    adicionarCanalVenda,
    atualizarCanalVenda,
    removerCanalVenda,
    salvarConfigCategoria,
    removerConfigCategoria,
    salvarModelo,
    carregarModelo,
    removerModelo,
    calcularMarkup,
    getPercentualDespesasFixas,
    exportarCSV,
    totalDespesasFixas,
    totalMaoDeObra,
    percentualDespesasFixas
  } = useMarkup()

  // Categorias hard coded da página de fichas técnicas
  const categorias = [
    'ACOMPANHAMENTOS',
    'BEBIDAS CERVEJAS E CHOPP',
    'BEBIDAS REFRIGERANTES',
    'BEBIDAS SUCOS',
    'COMBO LANCHES CARNE ANGUS',
    'COMBO LANCHES FRANGO',
    'FRANGO AMERICANO',
    'JUMBOS (COMBINADOS GRANDES)',
    'LANCHES',
    'MOLHOS',
    'PROMOÇÕES',
    'SALADAS',
    'SOBREMESAS',
    'ZAPBOX (COMBINADOS INDIVIDUÁIS)'
  ]

  // Estados locais
  const [hasChanges, setHasChanges] = useState(false)
  const [novoCanal, setNovoCanal] = useState({ nome: '', taxa_marketplace: 0, taxa_antecipacao: 0 })
  const [editingCanal, setEditingCanal] = useState<string | null>(null)
  const [novoModelo, setNovoModelo] = useState('')
  const [showNovoCanal, setShowNovoCanal] = useState(false)
  const [showNovoModelo, setShowNovoModelo] = useState(false)
  
  // Estado local para valores em edição (resposta imediata)
  const [valoresLocais, setValoresLocais] = useState<{[key: string]: {lucro: number, reserva: number}}>({})

  // Atualizar cálculos quando dados mudarem
  useEffect(() => {
    if (configGeral && canaisVenda.length > 0 && configCategorias.length > 0) {
      calcularMarkup()
    }
  }, [configGeral, canaisVenda, configCategorias])

  // Cleanup do timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Removido useEffect problemático que estava limpando valores locais

  // Funções de atualização
  const updateConfigGeral = async (key: string, value: number) => {
    if (!configGeral) return

    const updated = { ...configGeral, [key]: value }
    setConfigGeral(updated)
    setHasChanges(true)
    
    try {
      await salvarConfigGeral(updated)
      setHasChanges(false)
    } catch (error) {
      console.error('Erro ao salvar configuração geral:', error)
    }
  }

  const handleAdicionarCanal = async () => {
    if (!novoCanal.nome.trim()) return

    try {
      await adicionarCanalVenda({
        nome: novoCanal.nome,
        taxa_marketplace: novoCanal.taxa_marketplace,
        taxa_antecipacao: novoCanal.taxa_antecipacao,
        ativo: true
      })
      setNovoCanal({ nome: '', taxa_marketplace: 0, taxa_antecipacao: 0 })
      setShowNovoCanal(false)
    } catch (error) {
      console.error('Erro ao adicionar canal:', error)
    }
  }

  const handleAtualizarCanal = async (id: string, updates: Partial<typeof novoCanal>) => {
    try {
      await atualizarCanalVenda(id, updates)
      setEditingCanal(null)
    } catch (error) {
      console.error('Erro ao atualizar canal:', error)
    }
  }

  const handleRemoverCanal = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este canal?')) {
      try {
        await removerCanalVenda(id)
      } catch (error) {
        console.error('Erro ao remover canal:', error)
      }
    }
  }

  // Debounce para salvamento (mais rápido)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  
  const handleSalvarConfigCategoria = useCallback(async (categoria: string, lucro: number, reserva: number) => {
    // Atualizar estado local imediatamente para resposta visual
    setValoresLocais(prev => ({
      ...prev,
      [categoria]: { lucro, reserva }
    }))
    
    // Limpar timeout anterior se existir
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Aguardar apenas 300ms antes de salvar
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Encontrar a configuração existente para manter o ID
        const configExistente = configCategorias.find(c => c.categoria === categoria)
        
        const dadosParaSalvar = {
          id: configExistente?.id,
          categoria,
          lucro_desejado: lucro,
          reserva_operacional: reserva
        }
        
        await salvarConfigCategoria(dadosParaSalvar)
        
        // Limpar valor local após salvamento bem-sucedido
        setValoresLocais(prev => {
          const newState = { ...prev }
          delete newState[categoria]
          return newState
        })
      } catch (error) {
        console.error('Erro ao salvar configuração de categoria:', error)
        // Em caso de erro, reverter o estado local
        setValoresLocais(prev => {
          const newState = { ...prev }
          delete newState[categoria]
          return newState
        })
      }
    }, 300)
  }, [configCategorias, salvarConfigCategoria])

  const handleSalvarModelo = async () => {
    if (!novoModelo.trim()) return

    try {
      await salvarModelo(novoModelo)
      setNovoModelo('')
      setShowNovoModelo(false)
    } catch (error) {
      console.error('Erro ao salvar modelo:', error)
    }
  }

  const handleCarregarModelo = async (id: string) => {
    try {
      await carregarModelo(id)
      setHasChanges(false)
    } catch (error) {
      console.error('Erro ao carregar modelo:', error)
    }
  }

  const handleRemoverModelo = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este modelo?')) {
      try {
        await removerModelo(id)
      } catch (error) {
        console.error('Erro ao remover modelo:', error)
      }
    }
  }

  // Verificar se há custos excedendo 100%
  const hasInvalidCalculations = calculosMarkup.some(calc => calc.custos_totais >= 100)

  return (
    <Layout currentPage="markup">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Taxa de Marcação
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure as taxas e custos necessários para calcular o markup por categoria e canal de venda
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => calcularMarkup()}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportarCSV} disabled={calculosMarkup.length === 0}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Dialog open={showNovoModelo} onOpenChange={setShowNovoModelo}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Save className="h-4 w-4" />
                  Salvar como Modelo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Modelo de Markup</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomeModelo">Nome do Modelo</Label>
                    <Input
                      id="nomeModelo"
                      value={novoModelo}
                      onChange={(e) => setNovoModelo(e.target.value)}
                      placeholder="Ex: Configuração Padrão 2024"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNovoModelo(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSalvarModelo} disabled={!novoModelo.trim()}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alert para custos excedendo 100% */}
        {hasInvalidCalculations && (
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>Atenção:</strong> Alguns cálculos mostram custos excedendo 100% do faturamento. 
              Verifique as configurações para garantir a viabilidade dos negócios.
            </AlertDescription>
          </Alert>
        )}

        {/* Alert para mudanças não salvas */}
        {hasChanges && (
          <Alert className="border-warning/20 bg-warning/5">
            <Settings className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              Você tem alterações não salvas. As configurações serão salvas automaticamente.
            </AlertDescription>
          </Alert>
        )}

        {/* 1. Bloco: Configurações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Configurações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="faturamento">Faturamento Estimado Mensal (R$)</Label>
                  <Input
                    id="faturamento"
                    type="number"
                    step="0.01"
                    value={configGeral?.faturamento_estimado_mensal || 0}
                    onChange={(e) => updateConfigGeral('faturamento_estimado_mensal', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="impostos">% Impostos sobre faturamento</Label>
                  <Input
                    id="impostos"
                    type="number"
                    step="0.1"
                    value={configGeral?.impostos_faturamento || 0}
                    onChange={(e) => updateConfigGeral('impostos_faturamento', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taxaCartao">% Taxa de cartão (crédito/débito)</Label>
                  <Input
                    id="taxaCartao"
                    type="number"
                    step="0.1"
                    value={configGeral?.taxa_cartao || 0}
                    onChange={(e) => updateConfigGeral('taxa_cartao', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="outrosCustos">% Outros custos</Label>
                  <Input
                    id="outrosCustos"
                    type="number"
                    step="0.1"
                    value={configGeral?.outros_custos || 0}
                    onChange={(e) => updateConfigGeral('outros_custos', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Campo calculado: % Despesas Fixas / Faturamento */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>% Despesas Fixas / Faturamento</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <p><strong>Despesas Fixas:</strong> R$ {totalDespesasFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p><strong>Mão de Obra:</strong> R$ {totalMaoDeObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p><strong>Total:</strong> R$ {(totalDespesasFixas + totalMaoDeObra).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <span className="text-2xl font-bold text-primary">
                  {percentualDespesasFixas.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Bloco: Canais de Venda */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Canais de Venda
              </CardTitle>
              <Dialog open={showNovoCanal} onOpenChange={setShowNovoCanal}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Adicionar Canal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Canal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nomeCanal">Nome do Canal</Label>
                      <Input
                        id="nomeCanal"
                        value={novoCanal.nome}
                        onChange={(e) => setNovoCanal(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: 99Food, Uber Eats"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxaMarketplace">% Taxa do Marketplace</Label>
                      <Input
                        id="taxaMarketplace"
                        type="number"
                        step="0.1"
                        value={novoCanal.taxa_marketplace}
                        onChange={(e) => setNovoCanal(prev => ({ ...prev, taxa_marketplace: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxaAntecipacao">% Taxa de Antecipação (opcional)</Label>
                      <Input
                        id="taxaAntecipacao"
                        type="number"
                        step="0.1"
                        value={novoCanal.taxa_antecipacao}
                        onChange={(e) => setNovoCanal(prev => ({ ...prev, taxa_antecipacao: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNovoCanal(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAdicionarCanal} disabled={!novoCanal.nome.trim()}>
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead>% Taxa Marketplace</TableHead>
                  <TableHead>% Taxa Antecipação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {canaisVenda.map((canal) => (
                  <TableRow key={canal.id}>
                    <TableCell className="font-medium">{canal.nome}</TableCell>
                    <TableCell>
                      {editingCanal === canal.id ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={canal.taxa_marketplace}
                          onChange={(e) => handleAtualizarCanal(canal.id!, { taxa_marketplace: parseFloat(e.target.value) || 0 })}
                          className="w-20"
                        />
                      ) : (
                        canal.taxa_marketplace.toFixed(1) + '%'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCanal === canal.id ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={canal.taxa_antecipacao}
                          onChange={(e) => handleAtualizarCanal(canal.id!, { taxa_antecipacao: parseFloat(e.target.value) || 0 })}
                          className="w-20"
                        />
                      ) : (
                        canal.taxa_antecipacao.toFixed(1) + '%'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={canal.ativo ? "default" : "secondary"}>
                        {canal.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCanal(editingCanal === canal.id ? null : canal.id!)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAtualizarCanal(canal.id!, { nome: canal.nome, taxa_marketplace: canal.taxa_marketplace, taxa_antecipacao: canal.taxa_antecipacao })}
                        >
                          {canal.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoverCanal(canal.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 3. Bloco: Configurações por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Configurações por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>% Lucro Desejado</TableHead>
                  <TableHead>% Reserva Operacional</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((categoria) => {
                  const config = configCategorias.find(c => c.categoria === categoria)
                  const valorLocal = valoresLocais[categoria]
                  
                  // Usar valor local se disponível, senão usar valor do banco
                  const lucroAtual = valorLocal?.lucro ?? config?.lucro_desejado ?? 0
                  const reservaAtual = valorLocal?.reserva ?? config?.reserva_operacional ?? 0
                  
                  return (
                    <TableRow key={categoria}>
                      <TableCell className="font-medium">{categoria}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={lucroAtual}
                          onChange={(e) => handleSalvarConfigCategoria(
                            categoria, 
                            parseFloat(e.target.value) || 0, 
                            reservaAtual
                          )}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={reservaAtual}
                          onChange={(e) => handleSalvarConfigCategoria(
                            categoria, 
                            lucroAtual, 
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {config && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removerConfigCategoria(config.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 4. Bloco: Resultado – Tabela de Markup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tabela de Markup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculosMarkup.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure as categorias e canais para ver os cálculos de markup</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      {canaisVenda.filter(c => c.ativo).map((canal) => (
                        <TableHead key={canal.id} className="text-center">
                          {canal.nome}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorias.map((categoria) => (
                      <TableRow key={categoria}>
                        <TableCell className="font-medium">{categoria}</TableCell>
                        {canaisVenda.filter(c => c.ativo).map((canal) => {
                          const calculo = calculosMarkup.find(
                            calc => calc.categoria === categoria && calc.canal === canal.nome
                          )
                          return (
                            <TableCell key={canal.id} className="text-center">
                              {calculo ? (
                                <div className="space-y-1">
                                  <div className={`text-lg font-bold ${
                                    calculo.custos_totais >= 100 ? 'text-destructive' : 'text-primary'
                                  }`}>
                                    {calculo.custos_totais >= 100 ? 'N/A' : `${calculo.markup}x`}
                                  </div>
                                  {calculo.custos_totais >= 100 && (
                                    <div className="text-xs text-destructive">
                                      Custos: {calculo.custos_totais.toFixed(1)}%
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modelos Salvos */}
        {modelos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-primary" />
                Modelos Salvos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelos.map((modelo) => (
                  <div key={modelo.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{modelo.nome}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCarregarModelo(modelo.id!)}
                        >
                          Carregar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoverModelo(modelo.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Criado em: {new Date(modelo.created_at!).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explicação da Fórmula */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Como Funciona o Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Fórmula do Markup:</h4>
                <div className="text-center text-lg font-mono">
                  M = (1 + L + R) / (1 - T)
                </div>
                <div className="mt-3 text-sm space-y-1">
                  <p><strong>M</strong> = Markup (fator multiplicador)</p>
                  <p><strong>L</strong> = % Lucro desejado</p>
                  <p><strong>R</strong> = % Reserva operacional</p>
                  <p><strong>T</strong> = Soma de todos os % sobre faturamento</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Exemplo:</strong> Se um produto custa R$ 10,00 e o markup calculado é 2,5x, 
                o preço de venda será R$ 25,00 (R$ 10,00 × 2,5).</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}