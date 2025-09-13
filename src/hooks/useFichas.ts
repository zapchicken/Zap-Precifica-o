// src/hooks/useFichas.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useRecalculoAutomatico } from './useRecalculoAutomatico'

// Interface principal da ficha técnica
export interface Ficha {
  id: string
  nome: string
  codigo: string
  descricao: string | null
  categoria: string | null
  tipo_produto: string | null
  rendimento: number | null
  unidade_rendimento: string | null
  tempo_preparo: number | null
  modo_preparo: string | null
  custo_total_producao: number | null
  custo_por_unidade: number | null
  preco_sugerido: number | null
  margem_contribuicao: number | null
  observacoes: string | null
  foto: string | null
  data_ficha: string | null
  ativo: boolean
  user_id: string
  created_at: string
  updated_at: string
}

// Interface para insumos da ficha
export interface InsumoFicha {
  id: string
  ficha_id: string
  insumo_id: string | null
  quantidade: number
  unidade: string
  custo_unitario: number
  custo_total: number | null
  user_id: string
  created_at: string
  // ✅ Propriedade aninhada retornada pelo JOIN
  insumos?: {
    nome: string
    codigo_insumo: string
  }
}

// Interface para bases da ficha
export interface BaseFicha {
  id: string
  ficha_id: string
  base_id: string
  quantidade: number
  unidade: string
  custo_unitario: number | null
  custo_total: number | null
  user_id: string
  created_at: string | null
  bases?: {
    nome: string
    codigo: string
  }
}

// Interface para produtos prontos da ficha (fichas existentes)
export interface ProdutoProntoFicha {
  id: string
  ficha_id: string
  produto_ficha_id: string
  quantidade: number
  unidade: string
  custo_unitario: number | null
  custo_total: number | null
  user_id: string
  created_at: string | null
  // ✅ Propriedade aninhada retornada pelo JOIN
  fichas_tecnicas?: {
    nome: string
    codigo: string
  }
}

// Interface para embalagem delivery
export interface EmbalagemFicha {
  id: string
  ficha_id: string
  nome: string
  codigo: string | null
  quantidade: number
  unidade: string
  custo_unitario: number | null  // ✅ NOVO campo
  custo_total: number | null     // ✅ NOVO campo
}

// Interface extendida da ficha com dados relacionados
export interface FichaDetalhada extends Ficha {
  insumos?: InsumoFicha[]
  produtosProntos?: ProdutoProntoFicha[]  // ✅ NOVO - para fichas existentes
  bases?: BaseFicha[]                      // ✅ Para bases (ingredientes prontos)
  embalagem?: EmbalagemFicha[]
}

// Hook principal
export const useFichas = () => {
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { recalcularCustoTotalFicha } = useRecalculoAutomatico()

  // Carregar todas as fichas
  const loadFichas = async () => {
    if (!user?.id) {
      return
    }

    try {
      setLoading(true)
      
      // ✅ RESTAURADO filtro com user_id - Supabase RLS precisa deste filtro
      const { data, error } = await supabase
        .from('fichas_tecnicas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setFichas(data)
      } else {
        setFichas([])
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as fichas técnicas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

    // Carregar ficha detalhada com insumos, produtos prontos e embalagens
  const loadFichaDetalhada = async (fichaId: string): Promise<FichaDetalhada | null> => {
    if (!user?.id) {
      return null
    }

    try {
      // Carregar ficha principal
      // ✅ REMOVIDO filtro manual com user_id - RLS já garante segurança
      const { data: ficha, error: fichaError } = await supabase
        .from('fichas_tecnicas')
        .select('*')
        .eq('id', fichaId)
        .single()

      if (fichaError) throw fichaError


      // Carregar insumos com JOIN para pegar o nome
      if (import.meta.env.DEV) console.log('🔍 Carregando insumos para ficha:', fichaId)
      // ✅ REMOVIDO filtro manual com user_id - RLS já garante segurança
      const { data: insumos, error: insumosError } = await supabase
        .from('fichas_insumos')
        .select(`
          *,
          insumos!inner(
            nome,
            codigo_insumo
          )
        `)
        .eq('ficha_id', fichaId)

      if (import.meta.env.DEV) {
        console.log('🔍 Resultado insumos:', { insumos, insumosError })
        console.log('🔍 Insumos detalhados:', insumos)
        console.log('🔍 Quantidade de insumos:', insumos?.length || 0)
      }
      
      if (insumosError) {
        console.warn('Erro ao carregar insumos:', insumosError)
      }

      // Carregar produtos prontos (fichas existentes) com JOIN para pegar o nome
      if (import.meta.env.DEV) console.log('🔍 Carregando produtos prontos para ficha:', fichaId)
      // ✅ REMOVIDO filtro manual com user_id - RLS já garante segurança
      const { data: produtosProntos, error: produtosError } = await supabase
        .from('fichas_produtosprontos')
        .select(`
          *,
          fichas_tecnicas!fichas_produtosprontos_produto_ficha_id_fkey!left(
            nome,
            codigo
          )
        `)
        .eq('ficha_id', fichaId)

      if (import.meta.env.DEV) {
        console.log('🔍 Resultado produtos prontos:', { produtosProntos, produtosError })
        console.log('🔍 Produtos prontos detalhados:', produtosProntos)
        console.log('🔍 Quantidade de produtos prontos:', produtosProntos?.length || 0)
      }

      if (produtosError) {
        console.warn('Erro ao carregar produtos prontos (fichas_produtosprontos):', produtosError)
        console.error('🔍 Detalhes do erro:', {
          code: produtosError.code,
          message: produtosError.message,
          details: produtosError.details,
          hint: produtosError.hint
        })
        console.error('🔍 Erro completo:', produtosError)
      }

      // Carregar bases (ingredientes prontos) com JOIN para pegar o nome
      if (import.meta.env.DEV) console.log('🔍 Carregando bases para ficha:', fichaId)
      // ✅ REMOVIDO filtro manual com user_id - RLS já garante segurança
      const { data: bases, error: basesError } = await supabase
        .from('fichas_bases')
        .select(`
          *,
          bases!inner(
            nome,
            codigo
          )
        `)
        .eq('ficha_id', fichaId)

      if (import.meta.env.DEV) {
        console.log('🔍 Resultado bases:', { bases, basesError })
        console.log('🔍 Bases detalhadas:', bases)
        console.log('🔍 Quantidade de bases:', bases?.length || 0)
      }

      if (basesError) {
        console.warn('Erro ao carregar bases (fichas_bases):', basesError)
      }

      // Carregar embalagens delivery da tabela específica
      // ✅ REMOVIDO filtro manual com user_id - RLS já garante segurança
      const { data: embalagens, error: embalagensError } = await supabase
        .from('insumos_embalagem_delivery')
        .select('*')
        .eq('ficha_id', fichaId)

      if (embalagensError) {
        console.warn('Erro ao carregar embalagens (insumos):', embalagensError)
      }

      // Montar ficha detalhada
      const fichaDetalhada = {
        ...ficha,
        insumos: insumos || [],
        produtosProntos: produtosProntos || [],  // ✅ NOVO
        bases: bases || [],                      // ✅ Para bases
        embalagem: embalagens || []
      } as FichaDetalhada

      if (import.meta.env.DEV) {
        console.log('🔍 Ficha detalhada montada:', fichaDetalhada)
        console.log('🔍 Insumos na ficha detalhada:', fichaDetalhada.insumos)
        console.log('🔍 Produtos Prontos na ficha detalhada:', fichaDetalhada.produtosProntos)
        console.log('🔍 Bases na ficha detalhada:', fichaDetalhada.bases)
        console.log('🔍 Embalagem na ficha detalhada:', fichaDetalhada.embalagem)
      }

      return fichaDetalhada
    } catch (err: any) {
      console.error('Erro ao carregar ficha detalhada:', err)
      return null
    }
  }

  // Criar nova ficha
  const createFicha = async (ficha: any) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // ✅ Extrair dados relacionados antes da inserção
      const { 
        insumos, 
        produtosProntos, 
        insumosEmbalagemDelivery, 
        bases,
        embalagem,
        ...fichaLimpa 
      } = ficha
      
      // ✅ DEBUG: Log do campo foto antes de salvar (apenas em desenvolvimento)
      if (import.meta.env.DEV) {
        console.log('🔍 Campo foto sendo salvo:', fichaLimpa.foto)
        console.log('🔍 Tipo do campo foto:', typeof fichaLimpa.foto)
      }
      
      // ✅ CORREÇÃO: Validar foto (URL do Storage ou base64)
      if (fichaLimpa.foto && typeof fichaLimpa.foto === 'string') {
        const isBase64 = fichaLimpa.foto.startsWith('data:image/')
        const isStorageUrl = fichaLimpa.foto.startsWith('http') && fichaLimpa.foto.includes('supabase.co/storage')
        
        if (isBase64) {
          // Validar tamanho apenas para base64 (URLs são pequenas)
          if (fichaLimpa.foto.length > 500000) {
            console.warn('⚠️ Foto base64 muito grande para criação, removendo...')
            console.warn('⚠️ Tamanho atual:', fichaLimpa.foto.length, 'bytes')
            fichaLimpa.foto = null
          }
        } else if (!isStorageUrl) {
          console.warn('⚠️ Formato de foto inválido (deve ser base64 ou URL do Storage), removendo...')
          fichaLimpa.foto = null
        }
      }
      // ✅ Adicionar user_id aos dados da ficha
      const fichaComUserId = {
        ...fichaLimpa,
        user_id: user.id
      }
      
      // ✅ Validar campos obrigatórios
      if (!fichaComUserId.nome || !fichaComUserId.codigo) {
        throw new Error('Nome e código são campos obrigatórios')
      }
      
      // ✅ Validar formato da data
      if (fichaComUserId.data_ficha) {
        try {
          new Date(fichaComUserId.data_ficha)
        } catch (error) {
          console.warn('⚠️ Data inválida, usando data atual')
          fichaComUserId.data_ficha = new Date().toISOString().split('T')[0]
        }
      }
      
      // ✅ Filtrar apenas campos que existem na tabela fichas_tecnicas
      const camposValidos = [
        'nome', 'codigo', 'descricao', 'categoria', 'tipo_produto',
        'rendimento', 'unidade_rendimento', 'tempo_preparo', 'modo_preparo',
        'custo_total_producao', 'custo_por_unidade', 'preco_sugerido',
        'margem_contribuicao', 'observacoes', 'foto', 'data_ficha',
        'ativo', 'user_id'
      ]
      
      const fichaFiltrada = Object.keys(fichaComUserId)
        .filter(key => camposValidos.includes(key))
        .reduce((obj, key) => {
          obj[key] = fichaComUserId[key]
          return obj
        }, {} as any)
      
      // ✅ Log dos campos filtrados para debug
      console.log('🔍 Campos filtrados para inserção:', Object.keys(fichaFiltrada))
      console.log('🔍 Dados filtrados:', fichaFiltrada)
      
      // ✅ Inserir apenas os campos válidos na tabela fichas_tecnicas
      const { data, error } = await supabase
        .from('fichas_tecnicas')
        .insert([fichaFiltrada])
        .select()
    
      if (error) throw error
      if (data && data.length > 0) {
        const fichaId = data[0].id
    
        // ✅ Processar dados relacionados nas tabelas corretas
        if (insumos?.length) {
          console.log('🔍 Salvando insumos e bases:', insumos)
          
          // Separar insumos e bases
          const insumosReais = insumos.filter(item => item.tipo !== 'base')
          const basesReais = insumos.filter(item => item.tipo === 'base')
          
          // Processar insumos reais
          for (const insumo of insumosReais) {
            try {
              // Verificar se o insumo já existe na tabela insumos
              let insumoId = insumo.insumo_id // Se já tiver um ID
              
              if (!insumoId) {
                // Buscar insumo pelo nome na tabela insumos
                const { data: insumoExistente, error: buscaError } = await supabase
                  .from('insumos')
                  .select('id')
                  .eq('nome', insumo.nome)
                  .eq('user_id', user.id)
                  .single()
                
                if (buscaError && buscaError.code !== 'PGRST116') {
                  console.warn('❌ Erro ao buscar insumo:', buscaError)
                }
                
                if (insumoExistente) {
                  insumoId = insumoExistente.id
                  console.log('✅ Insumo encontrado:', insumo.nome, 'ID:', insumoId)
                } else {
                  // Criar novo insumo na tabela insumos
                  const { data: novoInsumo, error: createError } = await supabase
                    .from('insumos')
                    .insert([{
                      nome: insumo.nome,
                      codigo_insumo: insumo.codigo || '',
                      categoria: 'OUTROS', // Categoria padrão
                      unidade_medida: insumo.unidade,
                      preco_por_unidade: parseFloat(insumo.custo) || 0,
                      user_id: user.id
                    }])
                    .select()
                  
                  if (createError) {
                    console.error('❌ Erro ao criar insumo:', createError)
                    throw createError
                  }
                  
                  insumoId = novoInsumo[0].id
                  console.log('✅ Novo insumo criado:', insumo.nome, 'ID:', insumoId)
                }
              }
              
              // Agora salvar na tabela fichas_insumos
              const { error: insumoError } = await supabase
                .from('fichas_insumos')
                .insert([{
                  ficha_id: fichaId,
                  insumo_id: insumoId,
                  quantidade: parseFloat(insumo.quantidade) || 0,
                  unidade: insumo.unidade,
                  custo_unitario: parseFloat(insumo.custo) || 0,
                  custo_total: (parseFloat(insumo.quantidade) || 0) * (parseFloat(insumo.custo) || 0),
                  user_id: user.id
                }])
              
              if (insumoError) {
                console.error('❌ Erro ao salvar insumo na ficha:', insumoError)
                throw insumoError
              }
              
              console.log('✅ Insumo salvo na ficha:', insumo.nome)
            } catch (error) {
              console.error('❌ Erro ao processar insumo:', insumo.nome, error)
              throw error
            }
          }
          
          // Processar bases
          for (const base of basesReais) {
            try {
              // Buscar base pelo nome na tabela bases
              const { data: baseExistente, error: buscaError } = await supabase
                .from('bases')
                .select('id')
                .eq('nome', base.nome)
                .eq('user_id', user.id)
                .single()
              
              if (buscaError && buscaError.code !== 'PGRST116') {
                console.warn('❌ Erro ao buscar base:', buscaError)
              }
              
              if (baseExistente) {
                // Salvar na tabela fichas_bases
                const { error: baseError } = await supabase
                  .from('fichas_bases')
                  .insert([{
                    ficha_id: fichaId,
                    base_id: baseExistente.id,
                    quantidade: parseFloat(base.quantidade) || 0,
                    unidade: base.unidade || 'kg',
                    custo_unitario: parseFloat(base.custo) || 0,
                    custo_total: (parseFloat(base.quantidade) || 0) * (parseFloat(base.custo) || 0),
                    user_id: user.id
                  }])
                
                if (baseError) {
                  console.error('❌ Erro ao salvar base na ficha:', baseError)
                  throw baseError
                }
                
                console.log('✅ Base salva na ficha:', base.nome)
              } else {
                console.warn('⚠️ Base não encontrada:', base.nome)
              }
            } catch (error) {
              console.error('❌ Erro ao processar base:', base.nome, error)
              throw error
            }
          }
          
          console.log('✅ Todos os insumos e bases salvos com sucesso')
        }
        
        
                 if (produtosProntos?.length) {
           console.log('🔍 Salvando produtos prontos:', produtosProntos)
           
           // Salvar produtos prontos na tabela fichas_produtosprontos
           const produtosParaSalvar = produtosProntos.map(produto => ({
             ficha_id: fichaId,
             produto_ficha_id: produto.fichaId,  // ✅ NOVO campo
             quantidade: parseFloat(produto.quantidade) || 0,
             unidade: produto.unidade || 'un',
             custo_unitario: parseFloat(produto.custo) || 0,
             custo_total: parseFloat(produto.custoTotal) || 0,
             user_id: user.id
           }))
           
           const { error: produtosError } = await supabase
             .from('fichas_produtosprontos')  // ✅ NOVA tabela
             .insert(produtosParaSalvar)
           
           if (produtosError) {
             console.error('❌ Erro ao salvar produtos prontos:', produtosError)
             throw produtosError
           }
           
           console.log('✅ Produtos prontos salvos com sucesso')
         }
        
        if (insumosEmbalagemDelivery?.length) {
          console.log('🔍 Salvando embalagens delivery:', insumosEmbalagemDelivery)
          
                     // Salvar embalagens delivery na tabela insumos_embalagem_delivery
           const embalagensParaSalvar = insumosEmbalagemDelivery.map(embalagem => ({
             ficha_id: fichaId,
             nome: embalagem.nome,
             codigo: embalagem.codigo,
             quantidade: parseFloat(embalagem.quantidade) || 0,
             unidade: embalagem.unidade,
             custo_unitario: parseFloat(embalagem.custo) || 0,        // ✅ NOVO
             custo_total: (parseFloat(embalagem.quantidade) || 0) * (parseFloat(embalagem.custo) || 0)  // ✅ NOVO
           }))
          
          const { error: embalagensError } = await supabase
            .from('insumos_embalagem_delivery')
            .insert(embalagensParaSalvar)
          
          if (embalagensError) {
            console.error('❌ Erro ao salvar embalagens delivery:', embalagensError)
            throw embalagensError
          }
          
          console.log('✅ Embalagens delivery salvas com sucesso')
        }
      }
      
      // 🔄 Recarregar a lista de fichas
      await loadFichas()
      
      // 🔄 SINCRONIZAÇÃO AUTOMÁTICA: Criar/atualizar produto no catálogo
      if (data && data.length > 0) {
        const fichaCriada = data[0]
        await sincronizarComProdutos(fichaCriada)
        console.log('✅ Produto sincronizado automaticamente com o catálogo')
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: "Não foi possível criar a ficha técnica",
        variant: "destructive"
      })
      throw err
    }
  }

  // Atualizar ficha
  const updateFicha = async (id: string, updates: any) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // ✅ DEBUG: Log do campo foto antes de atualizar (apenas em desenvolvimento)
      if (import.meta.env.DEV) {
        console.log('🔍 Campo foto sendo atualizado:', updates.foto)
        console.log('🔍 Tipo do campo foto:', typeof updates.foto)
        console.log('🔍 Tamanho da foto:', updates.foto ? updates.foto.length : 0)
      }
      
      // ✅ CORREÇÃO: Validar foto (URL do Storage ou base64)
      if (updates.foto && typeof updates.foto === 'string') {
        const isBase64 = updates.foto.startsWith('data:image/')
        const isStorageUrl = updates.foto.startsWith('http') && updates.foto.includes('supabase.co/storage')
        
        if (isBase64) {
          // Validar tamanho apenas para base64 (URLs são pequenas)
          if (updates.foto.length > 500000) {
            console.warn('⚠️ Foto base64 muito grande para atualização, removendo...')
            console.warn('⚠️ Tamanho atual:', updates.foto.length, 'bytes')
            updates.foto = null
          }
        } else if (!isStorageUrl) {
          console.warn('⚠️ Formato de foto inválido (deve ser base64 ou URL do Storage), removendo...')
          updates.foto = null
        }
      }
      
      // ✅ Filtrar apenas campos que existem na tabela fichas_tecnicas
      const camposValidos = [
        'nome', 'codigo', 'descricao', 'categoria', 'tipo_produto',
        'rendimento', 'unidade_rendimento', 'tempo_preparo', 'modo_preparo',
        'custo_total_producao', 'custo_por_unidade', 'preco_sugerido',
        'margem_contribuicao', 'observacoes', 'foto', 'data_ficha',
        'ativo'
      ]
      
      const updatesFiltrados = Object.keys(updates)
        .filter(key => camposValidos.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key]
          return obj
        }, {} as any)
      
             // ✅ Log dos campos filtrados para debug (apenas em desenvolvimento)
       if (import.meta.env.DEV) {
         console.log('🔍 Campos filtrados para atualização:', Object.keys(updatesFiltrados))
         console.log('🔍 Dados filtrados:', updatesFiltrados)
         console.log('🔍 Campo foto nos dados filtrados:', updatesFiltrados.foto)
         console.log('🔍 Tipo do campo foto nos dados filtrados:', typeof updatesFiltrados.foto)
       }
      
      // ✅ RESTAURADO filtro com user_id - RLS precisa deste filtro para UPDATEs
      const { error } = await supabase
        .from('fichas_tecnicas')
        .update(updatesFiltrados)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      // 🔄 PROCESSAR DADOS RELACIONADOS (insumos, embalagens, produtos prontos)
      const { insumos, produtosProntos, insumosEmbalagemDelivery } = updates
      
      if (insumos || produtosProntos || insumosEmbalagemDelivery) {
        if (import.meta.env.DEV) console.log('🔍 Processando dados relacionados na atualização...')
        
        // Limpar dados antigos primeiro
        await supabase.from('fichas_insumos').delete().eq('ficha_id', id)
        await supabase.from('fichas_bases').delete().eq('ficha_id', id)
        await supabase.from('fichas_produtosprontos').delete().eq('ficha_id', id)
        await supabase.from('insumos_embalagem_delivery').delete().eq('ficha_id', id)
        
        // Processar insumos e bases
        if (insumos?.length) {
          console.log('🔍 Salvando insumos e bases na atualização:', insumos)
          
          for (const insumo of insumos) {
            if (insumo.nome && insumo.quantidade) {
              try {
                if (insumo.tipo === 'base') {
                  // ✅ Salvar base na tabela fichas_bases
                  const { data: baseData } = await supabase
                    .from('bases')
                    .select('id')
                    .eq('nome', insumo.nome)
                    .eq('user_id', user.id)
                    .single()
                  
                  if (baseData) {
                    const { error: baseError } = await supabase
                      .from('fichas_bases')
                      .insert([{
                        ficha_id: id,
                        base_id: baseData.id,
                        quantidade: parseFloat(insumo.quantidade) || 0,
                        unidade: insumo.unidade || 'kg',
                        custo_unitario: parseFloat(insumo.custo) || 0,
                        custo_total: (parseFloat(insumo.quantidade) || 0) * (parseFloat(insumo.custo) || 0),
                        user_id: user.id
                      }])
                    
                    if (baseError) {
                      console.error('❌ Erro ao salvar base na atualização:', baseError)
                      throw baseError
                    }
                    
                    console.log('✅ Base salva na atualização:', insumo.nome)
                  }
                } else {
                  // ✅ Salvar insumo na tabela fichas_insumos
                  // Buscar insumo pelo nome na tabela insumos
                  const { data: insumoCompleto, error: buscaInsumoError } = await supabase
                    .from('insumos')
                    .select('id')
                    .eq('nome', insumo.nome)
                    .eq('user_id', user.id)
                    .single()
                  
                  if (buscaInsumoError && buscaInsumoError.code !== 'PGRST116') {
                    console.warn('❌ Erro ao buscar insumo:', buscaInsumoError)
                  }
                  
                  if (insumoCompleto) {
                    const { error: insumoError } = await supabase
                      .from('fichas_insumos')
                      .insert([{
                        ficha_id: id,
                        insumo_id: insumoCompleto.id,
                        quantidade: parseFloat(insumo.quantidade) || 0,
                        unidade: insumo.unidade || 'un',
                        custo_unitario: parseFloat(insumo.custo) || 0,
                        custo_total: (parseFloat(insumo.quantidade) || 0) * (parseFloat(insumo.custo) || 0),
                        user_id: user.id
                      }])
                    
                    if (insumoError) {
                      console.error('❌ Erro ao salvar insumo na atualização:', insumoError)
                      throw insumoError
                    }
                    
                    console.log('✅ Insumo salvo na atualização:', insumo.nome)
                  }
                }
              } catch (error) {
                console.error('❌ Erro ao processar item na atualização:', insumo.nome, error)
                throw error
              }
            }
          }
          
          console.log('✅ Todos os insumos e bases salvos na atualização')
        }
        
        // Processar produtos prontos
        if (produtosProntos?.length) {
          console.log('🔍 Salvando produtos prontos na atualização:', produtosProntos)
          
          const produtosParaSalvar = produtosProntos.map(produto => ({
            ficha_id: id,
            produto_ficha_id: produto.fichaId,
            quantidade: parseFloat(produto.quantidade) || 0,
            unidade: produto.unidade || 'un',
            custo_unitario: parseFloat(produto.custo) || 0,
            custo_total: parseFloat(produto.custoTotal) || 0,
            user_id: user.id
          }))
          
          const { error: produtosError } = await supabase
            .from('fichas_produtosprontos')
            .insert(produtosParaSalvar)
          
          if (produtosError) {
            console.error('❌ Erro ao salvar produtos prontos na atualização:', produtosError)
            throw produtosError
          }
          
          console.log('✅ Produtos prontos salvos na atualização')
        }
        
        // Processar embalagens delivery
        if (insumosEmbalagemDelivery?.length) {
          console.log('🔍 Salvando embalagens delivery na atualização:', insumosEmbalagemDelivery)
          
          const embalagensParaSalvar = insumosEmbalagemDelivery.map(embalagem => ({
            ficha_id: id,
            nome: embalagem.nome,
            codigo: embalagem.codigo,
            quantidade: parseFloat(embalagem.quantidade) || 0,
            unidade: embalagem.unidade,
            custo_unitario: parseFloat(embalagem.custo) || 0,
            custo_total: (parseFloat(embalagem.quantidade) || 0) * (parseFloat(embalagem.custo) || 0)
          }))
          
          const { error: embalagensError } = await supabase
            .from('insumos_embalagem_delivery')
            .insert(embalagensParaSalvar)
          
          if (embalagensError) {
            console.error('❌ Erro ao salvar embalagens delivery na atualização:', embalagensError)
            throw embalagensError
          }
          
          console.log('✅ Embalagens delivery salvas na atualização')
        }
      }
      
      await loadFichas()
      
      // 🔄 SINCRONIZAÇÃO AUTOMÁTICA: Atualizar produto no catálogo
      const fichaAtualizada = { id, ...updatesFiltrados }
      await sincronizarComProdutos(fichaAtualizada)
      console.log('✅ Produto atualizado automaticamente no catálogo')
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a ficha técnica",
        variant: "destructive"
      })
      throw err
    }
  }

  // Calcular custo apenas dos insumos de uma ficha (sem embalagem)
  const calcularCustoApenasInsumos = async (fichaId: string): Promise<number> => {
    if (!user?.id) {
      return 0
    }

    try {
      // ✅ REMOVIDO filtro manual com user_id - RLS já garante segurança
      const { data, error } = await supabase
        .from('fichas_insumos')
        .select('quantidade, custo_unitario')
        .eq('ficha_id', fichaId)

      if (error) throw error

      if (!data || data.length === 0) {
        return 0
      }

      // Calcular custo total apenas dos insumos
      const custoTotal = data.reduce((acc, insumo) => {
        const quantidade = insumo.quantidade || 0
        const custoUnitario = insumo.custo_unitario || 0
        return acc + (quantidade * custoUnitario)
      }, 0)

      return custoTotal
    } catch (err: any) {
      console.error('Erro ao calcular custo dos insumos:', err)
      return 0
    }
  }

  // Excluir ficha
  const deleteFicha = async (id: string, forcarExclusao: boolean = false) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Verificar dependências antes de excluir
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('id, nome')
        .eq('ficha_tecnica_id', id)
        .limit(10)

      const { data: embalagemDelivery, error: embalagemError } = await supabase
        .from('insumos_embalagem_delivery')
        .select('id, ficha_id')
        .eq('ficha_id', id)
        .limit(10)

      if (produtosError) throw produtosError
      if (embalagemError) throw embalagemError

      // Se há dependências, mostrar erro informativo ou remover automaticamente
      if (produtos && produtos.length > 0) {
        const produtosNomes = produtos.map((item: any) => item.nome).join(', ')
        
        if (!forcarExclusao) {
          throw new Error(`Esta ficha técnica está sendo usada nos seguintes produtos: ${produtosNomes}. Use a opção "Forçar Exclusão" para remover automaticamente a ficha dos produtos.`)
        }
        
        // Remover automaticamente a ficha dos produtos
        console.log(`🔄 Removendo ficha técnica dos produtos: ${produtosNomes}`)
        for (const produto of produtos) {
          await supabase
            .from('produtos')
            .update({ ficha_tecnica_id: null })
            .eq('id', produto.id)
          console.log(`✅ Ficha removida do produto: ${produto.nome}`)
        }
      }

      if (embalagemDelivery && embalagemDelivery.length > 0) {
        if (!forcarExclusao) {
          throw new Error(`Esta ficha técnica está sendo usada em embalagens de delivery. Use a opção "Forçar Exclusão" para remover automaticamente.`)
        }
        
        // Remover automaticamente das embalagens de delivery
        console.log(`🔄 Removendo ficha técnica das embalagens de delivery`)
        await supabase
          .from('insumos_embalagem_delivery')
          .delete()
          .eq('ficha_id', id)
        console.log(`✅ Ficha removida das embalagens de delivery`)
      }

      // Se não há dependências, excluir
      // Deletar registros relacionados primeiro
      await supabase.from('fichas_insumos').delete().eq('ficha_id', id)
      await supabase.from('fichas_produtosprontos').delete().eq('ficha_id', id)
      await supabase.from('fichas_bases').delete().eq('ficha_id', id)

      // Deletar a ficha principal
      const { error } = await supabase
        .from('fichas_tecnicas')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadFichas()
      toast({
        title: "Sucesso",
        description: "Ficha técnica excluída com sucesso"
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message || "Não foi possível excluir a ficha técnica",
        variant: "destructive"
      })
      throw err
    }
  }

  // Sincronizar ficha técnica com catálogo de produtos
  const sincronizarComProdutos = async (ficha: Ficha) => {
    if (!user?.id) return

    try {
      const produtoData = {
        nome: ficha.nome,
        codigo_pdv: ficha.codigo,
        descricao: ficha.descricao,
        categoria: ficha.categoria,
        preco_custo: ficha.custo_total_producao || 0,
        preco_venda: ficha.preco_sugerido || 0,
        margem_lucro: ficha.margem_contribuicao || 0,
        origem: 'ficha_tecnica' as const,
        ficha_tecnica_id: ficha.id,
        observacoes: ficha.observacoes,
        status: 'ativo'
      }

      // Verificar se já existe produto para esta ficha
      const { data: produtoExistente } = await supabase
        .from('produtos')
        .select('id')
        .eq('ficha_tecnica_id', ficha.id)
        .single()

      if (produtoExistente) {
        // Atualizar produto existente
        await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', produtoExistente.id)
      } else {
        // Criar novo produto
        await supabase
          .from('produtos')
          .insert([{ ...produtoData, user_id: user.id }])
      }
    } catch (err: any) {
      console.error('Erro ao sincronizar com produtos:', err)
      // Não interromper o fluxo principal se a sincronização falhar
    }
  }

  // Carregar dados ao montar
  useEffect(() => {
    if (user?.id) {
      loadFichas()
    }
  }, [user?.id])


  // ✅ NOVO: Função para recálculo manual de todas as fichas
  const recalcularTodasAsFichas = async () => {
    if (!user?.id) {
      console.warn('⚠️ Usuário não autenticado para recálculo manual')
      return
    }

    try {
      console.log('🔄 Iniciando recálculo manual de todas as fichas...')
      
      // Buscar todas as fichas do usuário
      const { data: todasFichas, error: fichasError } = await supabase
        .from('fichas_tecnicas')
        .select('id, nome')
        .eq('user_id', user.id)
        .eq('ativo', true)

      if (fichasError) {
        console.error('❌ Erro ao buscar fichas:', fichasError)
        return
      }

      if (!todasFichas || todasFichas.length === 0) {
        console.log('✅ Nenhuma ficha encontrada para recálculo')
        return
      }

      console.log('🔍 Recalculando', todasFichas.length, 'fichas...')

      // Recalcular cada ficha
      for (const ficha of todasFichas) {
        await recalcularCustoTotalFicha(ficha.id)
      }

      console.log('✅ Recálculo manual concluído para', todasFichas.length, 'fichas')
      
      toast({
        title: "Recálculo Concluído",
        description: `${todasFichas.length} fichas foram recalculadas com sucesso`
      })
      
    } catch (error) {
      console.error('❌ Erro no recálculo manual:', error)
      toast({
        title: "Erro no Recálculo",
        description: "Não foi possível recalcular todas as fichas",
        variant: "destructive"
      })
    }
  }

  return {
    fichas,
    loading,
    error,
    createFicha,
    updateFicha,
    deleteFicha,
    calcularCustoApenasInsumos,
    loadFichaDetalhada,
    sincronizarComProdutos,
    recalcularTodasAsFichas, // ✅ NOVO
    refresh: loadFichas
  }
}