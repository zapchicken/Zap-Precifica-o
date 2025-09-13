// src/components/RecalculoStatus.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { useInsumos } from '../hooks/useInsumos'
import { useBases } from '../hooks/useBases'
import { useFichas } from '../hooks/useFichas'
import { RefreshCw, CheckCircle } from 'lucide-react'

interface RecálculoStatusProps {
  className?: string
}

export const RecálculoStatus: React.FC<RecálculoStatusProps> = ({ className }) => {
  const { insumos } = useInsumos()
  const { bases } = useBases()
  const { fichas } = useFichas()


  // Contar quantos insumos têm preços recentemente alterados
  const insumosComPrecosRecentes = insumos.filter(insumo => {
    if (!insumo.updated_at) return false
    const dataAtualizacao = new Date(insumo.updated_at)
    const agora = new Date()
    const diferencaHoras = (agora.getTime() - dataAtualizacao.getTime()) / (1000 * 60 * 60)
    return diferencaHoras < 24 // Últimas 24 horas
  }).length


  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-5 w-5" />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="font-medium">Sistema Sincronizado</span>
          </div>
          <Badge className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        </div>

        {/* Informações do Sistema */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Insumos:</span>
            <span className="ml-2 font-medium">{insumos.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Bases:</span>
            <span className="ml-2 font-medium">{bases.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Fichas:</span>
            <span className="ml-2 font-medium">{fichas.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Atualizados:</span>
            <span className="ml-2 font-medium text-green-600">{insumosComPrecosRecentes}</span>
          </div>
        </div>



        {/* Informação sobre Recálculo Automático */}
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <strong>🔄 Recálculo Automático Ativo:</strong><br />
          Quando você alterar o preço ou fator de correção de um insumo, 
          todas as fichas e bases que o utilizam serão recalculadas automaticamente.
        </div>
      </CardContent>
    </Card>
  )
}
