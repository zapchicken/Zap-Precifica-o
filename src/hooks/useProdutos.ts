// src/hooks/useProdutos.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'



// Interface para produto final
export interface Produto {
  id: string
  nome: string
  codigo_pdv: string | null
  descricao: string | null
  categoria: string | null
  preco_custo: number | null
  preco_venda: number | null
  preco_venda_ifood: number | null
  margem_lucro: number | null
  status: 'ativo' | 'inativo'
  origem: 'manual' | 'ficha_tecnica' | 'importacao'
  ficha_tecnica_id: string | null
  observacoes: string | null
  user_id: string
  created_at: string
  updated_at: string
}

// Hook principal
export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Carregar produtos
  const loadProdutos = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true })

      if (error) throw error
      if (data) setProdutos(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Criar produto
  const createProduto = async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      // Validar código PDV duplicado
      if (produto.codigo_pdv) {
        const { data: existingProduto, error: checkError } = await supabase
          .from('produtos')
          .select('id, codigo_pdv')
          .eq('codigo_pdv', produto.codigo_pdv)
          .eq('user_id', user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingProduto) {
          throw new Error(`Já existe um produto com o código PDV "${produto.codigo_pdv}". Códigos PDV devem ser únicos.`)
        }
      }

      const produtoComUserId = { ...produto, user_id: user.id }
      const { data, error } = await supabase
        .from('produtos')
        .insert([produtoComUserId])
        .select()

      if (error) throw error
      if (data) await loadProdutos()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Atualizar produto
  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      // Validar código PDV duplicado se estiver sendo alterado
      if (updates.codigo_pdv) {
        const { data: existingProduto, error: checkError } = await supabase
          .from('produtos')
          .select('id, codigo_pdv')
          .eq('codigo_pdv', updates.codigo_pdv)
          .eq('user_id', user.id)
          .not('id', 'eq', id) // Excluir o próprio produto da verificação
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingProduto) {
          throw new Error(`Já existe um produto com o código PDV "${updates.codigo_pdv}". Códigos PDV devem ser únicos.`)
        }
      }

      const { error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await loadProdutos()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Verificar dependências de um produto
  const verificarDependenciasProduto = async (id: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const dependencias = {
      fichasTecnicas: [],
      fichasProdutosProntos: [],
      temDependencias: false
    }

    try {
      // 1. Verificar se o produto está vinculado a uma ficha técnica (como produto final)
      const { data: produto, error: produtoError } = await supabase
        .from('produtos')
        .select('id, nome, ficha_tecnica_id')
        .eq('id', id)
        .single()

      if (produtoError) throw produtoError

      if (produto && produto.ficha_tecnica_id) {
        // Buscar nome da ficha técnica
        const { data: ficha, error: fichaError } = await supabase
          .from('fichas_tecnicas')
          .select('nome, codigo')
          .eq('id', produto.ficha_tecnica_id)
          .single()

        if (!fichaError && ficha) {
          dependencias.fichasTecnicas.push(`${ficha.nome} (${ficha.codigo})`)
        }
      }

      // 2. Verificar se o produto é usado como "produto pronto" em outras fichas técnicas
      const { data: fichasProdutosProntos, error: fichasError } = await supabase
        .from('fichas_produtosprontos')
        .select(`
          fichas_tecnicas!fichas_produtosprontos_ficha_id_fkey(
            nome,
            codigo
          )
        `)
        .eq('produto_ficha_id', id)
        .limit(10)

      if (!fichasError && fichasProdutosProntos) {
        fichasProdutosProntos.forEach(item => {
          if (item.fichas_tecnicas) {
            dependencias.fichasProdutosProntos.push(
              `${item.fichas_tecnicas?.[0]?.nome} (${item.fichas_tecnicas?.[0]?.codigo})`
            )
          }
        })
      }

      dependencias.temDependencias = 
        dependencias.fichasTecnicas.length > 0 || 
        dependencias.fichasProdutosProntos.length > 0

      return dependencias
    } catch (err: any) {
      console.error('Erro ao verificar dependências:', err)
      throw err
    }
  }

  // Excluir produto (hard delete)
  const deleteProduto = async (id: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      // Verificar dependências primeiro
      const dependencias = await verificarDependenciasProduto(id)

      if (dependencias.temDependencias) {
        let mensagem = 'Este produto não pode ser excluído porque está sendo usado em:\n\n'
        
        if (dependencias.fichasTecnicas.length > 0) {
          mensagem += '• Fichas técnicas (como produto final):\n'
          dependencias.fichasTecnicas.forEach(ficha => {
            mensagem += `  - ${ficha}\n`
          })
          mensagem += '\n'
        }

        if (dependencias.fichasProdutosProntos.length > 0) {
          mensagem += '• Fichas técnicas (como produto pronto):\n'
          dependencias.fichasProdutosProntos.forEach(ficha => {
            mensagem += `  - ${ficha}\n`
          })
        }

        mensagem += '\nRemova essas vinculações primeiro ou use a opção de desativar.'
        
        throw new Error(mensagem)
      }

      // Se não há dependências, excluir fisicamente
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await loadProdutos()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Desativar produto (soft delete)
  const desativarProduto = async (id: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      const { error } = await supabase
        .from('produtos')
        .update({ status: 'inativo' })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await loadProdutos()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Reativar produto
  const reativarProduto = async (id: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      const { error } = await supabase
        .from('produtos')
        .update({ status: 'ativo' })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await loadProdutos()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Carregar ao montar e quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      loadProdutos()
    }
  }, [user?.id])

  return {
    produtos,
    loading,
    error,
    createProduto,
    updateProduto,
    deleteProduto,
    desativarProduto,
    reativarProduto,
    verificarDependenciasProduto,
    refresh: loadProdutos
  }
}