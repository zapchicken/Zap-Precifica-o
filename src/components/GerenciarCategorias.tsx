import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const categoriasDefault = [
  "ALIMENTOS", "BEBIDAS", "EMBALAGENS", "HORTIFRUTI", 
  "MATERIAL DE LIMPEZA", "TEMPEROS", "UTILIDADES"
]

interface GerenciarCategoriasProps {
  onCategoriaAdded?: () => void
}

export function GerenciarCategorias({ onCategoriaAdded }: GerenciarCategoriasProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState("")
  const [categoriasCustom, setCategoriasCustom] = useState<Array<{id: string, nome: string}>>(
    // Dados mock para demonstração
    [
      { id: "1", nome: "Conservas" },
      { id: "2", nome: "Produtos Orgânicos" }
    ]
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaCategoria.trim()) return
    
    setIsLoading(true)
    
    // Simular delay de API
    setTimeout(() => {
      // Verificar se categoria já existe
      const categoriaExiste = categoriasCustom.some(
        cat => cat.nome.toLowerCase() === novaCategoria.trim().toLowerCase()
      ) || categoriasDefault.some(
        cat => cat.toLowerCase() === novaCategoria.trim().toLowerCase()
      )
      
      if (categoriaExiste) {
        toast({
          title: "Erro ao adicionar categoria",
          description: "Esta categoria já existe",
          variant: "destructive"
        })
      } else {
        // Adicionar nova categoria
        const novaId = Date.now().toString()
        setCategoriasCustom(prev => [...prev, { id: novaId, nome: novaCategoria.trim() }])
        toast({ title: "Categoria adicionada com sucesso!" })
        setNovaCategoria("")
        onCategoriaAdded?.()
      }
      
      setIsLoading(false)
    }, 500)
  }

  const handleRemoverCategoria = (id: string) => {
    setIsLoading(true)
    
    // Simular delay de API
    setTimeout(() => {
      setCategoriasCustom(prev => prev.filter(cat => cat.id !== id))
      toast({ title: "Categoria removida com sucesso!" })
      onCategoriaAdded?.()
      setIsLoading(false)
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
          Gerenciar Categorias
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias de Insumos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Formulário para adicionar nova categoria */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="nova-categoria">Nova Categoria</Label>
              <div className="flex gap-2">
                <Input
                  id="nova-categoria"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Ex: Conservas"
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!novaCategoria.trim() || isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>

          <div className="space-y-3">
            {/* Categorias padrão */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Categorias Padrão
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categoriasDefault.map(categoria => (
                  <Badge key={categoria} variant="secondary" className="text-xs">
                    {categoria}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Categorias customizadas */}
            {categoriasCustom.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Suas Categorias Personalizadas
                </Label>
                <div className="space-y-2 mt-2">
                  {categoriasCustom.map(categoria => (
                    <div key={categoria.id} className="flex items-center justify-between p-2 border rounded-md">
                      <span className="text-sm">{categoria.nome}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoverCategoria(categoria.id)}
                        disabled={isLoading}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            💡 As categorias padrão sempre estarão disponíveis. Você pode adicionar suas próprias categorias personalizadas.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}