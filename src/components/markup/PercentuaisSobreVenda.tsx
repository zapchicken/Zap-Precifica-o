import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Percent, DollarSign } from "lucide-react"

type Props = {
  values: any
  onChange: (key: string, value: number | boolean | string) => void
}

export default function PercentuaisSobreVenda({ values, onChange }: Props) {
  const impostosFaturamento = values?.impostosFaturamento ?? 0
  const marketing = values?.marketing ?? 0
  const cartao = values?.cartao ?? 0
  const despesasPorcentagem = values?.despesasPorcentagem ?? 0
  const aplicarDespesasFixas = values?.aplicarDespesasFixas ?? true
  const outrosSobreVenda = values?.outrosSobreVenda ?? 0
  const lucroLiquidoDesejado = values?.lucroLiquidoDesejado ?? 0
  const investimentosReserva = values?.investimentosReserva ?? 0
  const faturamentoPrevisto = values?.faturamentoPrevisto ?? 0

  const total = (
    Number(impostosFaturamento || 0) +
    Number(marketing || 0) +
    Number(cartao || 0) +
    (aplicarDespesasFixas ? Number(despesasPorcentagem || 0) : 0) +
    Number(outrosSobreVenda || 0) +
    Number(lucroLiquidoDesejado || 0) +
    Number(investimentosReserva || 0)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Percentuais que variam por venda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="faturamentoPrevisto">Faturamento Previsto (R$)</Label>
            <Input
              id="faturamentoPrevisto"
              type="number"
              step="100"
              placeholder="40000"
              value={faturamentoPrevisto}
              onChange={(e) => onChange("faturamentoPrevisto", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impostosFaturamento">Impostos sobre faturamento (%)</Label>
            <Input
              id="impostosFaturamento"
              type="number"
              step="0.1"
              value={impostosFaturamento}
              onChange={(e) => onChange("impostosFaturamento", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marketing">Investimento em Marketing (%)</Label>
            <Input
              id="marketing"
              type="number"
              step="0.1"
              value={marketing}
              onChange={(e) => onChange("marketing", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cartao">% de cartão crédito / débito</Label>
            <Input
              id="cartao"
              type="number"
              step="0.1"
              value={cartao}
              onChange={(e) => onChange("cartao", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="despesasFixas">% das Despesas Fixas x Faturamento</Label>
            <Input
              id="despesasFixas"
              type="number"
              step="0.1"
              value={despesasPorcentagem}
              onChange={(e) => onChange("despesasPorcentagem", parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Este campo é o mesmo "Despesas Fixas" das configurações globais.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outrosSobreVenda">Outro % sobre venda</Label>
            <Input
              id="outrosSobreVenda"
              type="number"
              step="0.1"
              value={outrosSobreVenda}
              onChange={(e) => onChange("outrosSobreVenda", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lucroLiquidoDesejado">% Lucro Líquido desejado</Label>
            <Input
              id="lucroLiquidoDesejado"
              type="number"
              step="0.1"
              value={lucroLiquidoDesejado}
              onChange={(e) => onChange("lucroLiquidoDesejado", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="investimentosReserva">% de Investimentos / Reserva de dinheiro</Label>
            <Input
              id="investimentosReserva"
              type="number"
              step="0.1"
              value={investimentosReserva}
              onChange={(e) => onChange("investimentosReserva", parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-primary" />
            <span className="font-medium">Total % sobre venda</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Somatório dos percentuais</span>
            <Badge variant="outline">{total.toFixed(1)}%</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
