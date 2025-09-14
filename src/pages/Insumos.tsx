import React, { useState } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { ListaCompras } from "@/components/ListaCompras"
import { InsumosList } from "@/components/insumos/InsumosList"
import { Insumo } from "@/integrations/supabase/types"

export default function Insumos() {
  const [isListaComprasOpen, setIsListaComprasOpen] = useState(false)

  return (
    <Layout currentPage="insumos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Cadastro de Insumos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os insumos e matérias-primas integrado com Supabase
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsListaComprasOpen(true)}>
              <ShoppingCart className="h-4 w-4" />
              Lista de Compras
            </Button>
          </div>
        </div>

        {/* Componente de Lista de Insumos */}
        <InsumosList />

        {/* Lista de Compras Modal */}
        <ListaCompras 
          open={isListaComprasOpen}
          onOpenChange={setIsListaComprasOpen}
        />
      </div>
    </Layout>
  )
}