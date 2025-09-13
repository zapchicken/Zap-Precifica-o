import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Utensils, Download, Search, Filter } from "lucide-react"
import * as XLSX from "xlsx"
import { useState, useMemo } from "react"

// Dados serão carregados do Supabase
const itensPDV: any[] = []

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

export default function CardapioProposto() {
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  
  // Filtros aplicados
  const itensFiltrados = useMemo(() => {
    return itensPDV.filter((item) => {
      const matchTexto = item.item.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                        item.codigoPdv.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                        item.descricao.toLowerCase().includes(filtroTexto.toLowerCase())
      
      const matchCategoria = filtroCategoria === "todos" || item.categoria === filtroCategoria
      
      return matchTexto && matchCategoria
    })
  }, [filtroTexto, filtroCategoria])

  // Categorias únicas
  const categorias = useMemo(() => {
    const cats = [...new Set(itensPDV.map(item => item.categoria))]
    return cats.sort()
  }, [])

  // Exportar para Excel
  const exportarExcel = () => {
    const dadosParaExportar = itensFiltrados.map(item => ({
      'Código PDV': item.codigoPdv,
      'Item': item.item,
      'Descrição': item.descricao,
      'Categoria': item.categoria,
      'Custo': item.custo,
      'Valor Ideal': item.valorIdeal,
      'Preço Praticado': item.precoPraticado,
      'Preço iFood': item.precoIfood,
      'Margem Ideal (%)': ((item.valorIdeal - item.custo) / item.custo * 100).toFixed(1),
      'Margem Praticada (%)': ((item.precoPraticado - item.custo) / item.custo * 100).toFixed(1)
    }))

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Cardápio Proposto")
    
    // Auto-ajustar largura das colunas
    const wscols = [
      { wch: 12 }, // Código PDV
      { wch: 25 }, // Item
      { wch: 40 }, // Descrição
      { wch: 15 }, // Categoria
      { wch: 12 }, // Custo
      { wch: 12 }, // Valor Ideal
      { wch: 15 }, // Preço Praticado
      { wch: 12 }, // Preço iFood
      { wch: 15 }, // Margem Ideal
      { wch: 18 }  // Margem Praticada
    ]
    ws['!cols'] = wscols

    XLSX.writeFile(wb, `cardapio-proposto-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Layout currentPage="cardapio">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Cardápio Proposto
            </h1>
            <p className="text-muted-foreground mt-1">
              Itens de PDV, descrição e valores: custo, valor ideal, preço praticado e preço iFood
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="self-start md:self-auto">
              {itensFiltrados.length} de {itensPDV.length} itens
            </Badge>
            <Button onClick={exportarExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, nome ou descrição..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Itens do PDV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código PDV</TableHead>
                    <TableHead>Item PDV</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Valor Ideal</TableHead>
                    <TableHead className="text-right">Preço Praticado</TableHead>
                    <TableHead className="text-right">Preço iFood</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensFiltrados.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.codigoPdv}</TableCell>
                      <TableCell className="font-medium">{p.item}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {p.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.descricao}</TableCell>
                      <TableCell className="text-right">{formatBRL(p.custo)}</TableCell>
                      <TableCell className="text-right font-medium text-success">{formatBRL(p.valorIdeal)}</TableCell>
                      <TableCell className="text-right">{formatBRL(p.precoPraticado)}</TableCell>
                      <TableCell className="text-right">{formatBRL(p.precoIfood)}</TableCell>
                    </TableRow>
                  ))}
                  {itensFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        Nenhum item encontrado com os filtros aplicados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
