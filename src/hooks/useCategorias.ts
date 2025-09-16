import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { useToast } from './use-toast'

export interface Categoria {
  id: string
  nome: string
  created_at?: string
}

const categoriasIniciais: string[] = [
  'ALIMENTOS',
  'BEBIDAS', 
  'EMBALAGENS',
  'HORTIFRUTI',
  'MATERIAL DE LIMPEZA',
  'TEMPEROS',
  'UTILIDADES'
]

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<string[]>(categoriasIniciais)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Carregar categorias únicas das tabelas produtos e fichas_tecnicas
  const carregarCategorias = async () => {
    try {
      setLoading(true)
      
      // Buscar categorias de fichas_tecnicas
      const { data: fichasData } = await supabase
        .from('fichas_tecnicas')
        .select('categoria')
        .not('categoria', 'is', null)
        .not('categoria', 'eq', '')
      
      // Buscar categorias de produtos
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('categoria')
        .not('categoria', 'is', null)
        .not('categoria', 'eq', '')
      
      // Combinar categorias das duas tabelas
      const categoriasDB = new Set<string>()
      
      fichasData?.forEach(item => {
        if (item.categoria) categoriasDB.add(item.categoria)
      })
      
      produtosData?.forEach(item => {
        if (item.categoria) categoriasDB.add(item.categoria)
      })
      
      // Combinar categorias padrão com as do banco
      const todasCategorias = [...new Set([...categoriasIniciais, ...Array.from(categoriasDB)])]
      setCategorias(todasCategorias.sort())
      
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar nova categoria (apenas local, será persistida quando usada em registros)
  const addCategoria = async (novaCategoria: string) => {
    try {
      // Verificar se já existe localmente
      if (categorias.includes(novaCategoria)) {
        toast({
          variant: "destructive",
          title: "Categoria já existe",
          description: `A categoria "${novaCategoria}" já existe.`,
        })
        return false
      }

      // Atualizar estado local (a categoria será persistida quando usada em um registro)
      setCategorias(prev => [...prev, novaCategoria].sort())
      
      toast({
        title: "Categoria criada",
        description: `"${novaCategoria}" foi adicionada às categorias disponíveis`
      })
      
      return true
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao adicionar categoria.",
      })
      return false
    }
  }

  // Carregar categorias na inicialização
  useEffect(() => {
    carregarCategorias()
  }, [])

  return {
    categorias,
    loading,
    addCategoria,
    recarregarCategorias: carregarCategorias
  }
}