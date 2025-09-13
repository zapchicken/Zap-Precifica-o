import React, { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'
import { Plus, Search, FileText, Calculator, Clock, Eye, Edit, Trash2, Copy, Camera, X, Filter, RotateCcw } from 'lucide-react'
import { InsumoCombobox } from '../components/InsumoCombobox'
import { ProdutoProntoCombobox } from '../components/ProdutoProntoCombobox'
import ImportarFichasTecnicas from '../components/ImportarFichasTecnicas'
import { useFichas } from '../hooks/useFichas'
import { useInsumos } from '../hooks/useInsumos'
import { useBases } from '../hooks/useBases'
import { supabase } from '../lib/supabase'
import { uploadAndCompressImage, deleteImageFromStorage } from '../lib/imageUpload'

// Interface da ficha técnica
interface Ficha {
  id: string
  nome: string
  codigo: string
  descricao: string | null
  categoria: string | null
  tempo_preparo: number | null
  rendimento: number | null
  custo_total_producao: number | null
  modo_preparo: string | null
  foto: string | null
  data_ficha: string
  ativo: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export default function FichasTecnicas() {
  const { fichas, loading, error, createFicha, updateFicha, deleteFicha, calcularCustoApenasInsumos, loadFichaDetalhada, refresh } = useFichas()
  const { insumos } = useInsumos()
  const { bases } = useBases()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Filtros avançados para cada coluna
  const [filtros, setFiltros] = useState({
    codigoPdv: '',
    nomeProduto: '',
    categoria: 'all',
    dataInicio: '',
    dataFim: '',
    custoMinimo: '',
    custoMaximo: ''
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingFicha, setEditingFicha] = useState<Ficha | null>(null)
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null)
  const { toast } = useToast()

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

  const [formData, setFormData] = useState({
    produto: '',
    codigoPdv: '',
    categoria: '',
    descricao: '',
    tempoPreparo: '',
    rendimento: '',
    custoUnitario: '',
    dataFicha: '',
    modoPreparo: '',
    fotos: [] as string[],
    produtosProntos: [{ fichaId: '', quantidade: '', custo: '', custoTotal: '0.00' }],
    insumosEmbalagemDelivery: [{ nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }],
    insumos: [{ tipo: 'insumo', nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }]
  })

  // Monitorar mudanças no formData.fotos
  useEffect(() => {
    // Lógica para processar fotos se necessário
  }, [formData.fotos])

  // ✅ Calcular custo unitário automaticamente baseado na soma das 3 seções
  const calcularCustoTotal = () => {
    let custoTotal = 0

    // Soma dos custos dos produtos prontos
    formData.produtosProntos.forEach(produto => {
      if (produto.custoTotal && produto.custoTotal !== '0.00' && produto.fichaId) {
        custoTotal += parseFloat(produto.custoTotal) || 0
      }
    })

    // Soma dos custos dos insumos
    formData.insumos.forEach(insumo => {
      if (insumo.custoTotal && insumo.custoTotal !== '0.00' && insumo.nome) {
        custoTotal += parseFloat(insumo.custoTotal) || 0
      }
    })

    // Soma dos custos das embalagens
    formData.insumosEmbalagemDelivery.forEach(embalagem => {
      if (embalagem.custoTotal && embalagem.custoTotal !== '0.00' && embalagem.nome) {
        const custoEmbalagem = parseFloat(embalagem.custoTotal) || 0
        if (import.meta.env.DEV) console.log('🔍 Embalagem:', embalagem.nome, 'Custo Total:', custoEmbalagem)
        custoTotal += custoEmbalagem
      }
    })

    return custoTotal
  }

  // Atualizar custo unitário automaticamente quando qualquer custo mudar
  useEffect(() => {
    const custoTotal = calcularCustoTotal()
    if (import.meta.env.DEV) console.log('🔍 Custo total calculado:', custoTotal)
    
    setFormData(prev => ({
      ...prev,
      custoUnitario: custoTotal.toFixed(2)
    }))
  }, [formData.produtosProntos, formData.insumos, formData.insumosEmbalagemDelivery])

  const resetForm = () => {
    setFormData({
      produto: '',
      codigoPdv: '',
      categoria: '',
      descricao: '',
      tempoPreparo: '',
      rendimento: '',
      custoUnitario: '',
      dataFicha: '',
      modoPreparo: '',
      fotos: [],
      produtosProntos: [{ fichaId: '', quantidade: '', custo: '', custoTotal: '0.00' }],
      insumosEmbalagemDelivery: [{ nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }],
      insumos: [{ tipo: 'insumo', nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }]
    })
    setEditingFicha(null)
    setSelectedFicha(null)
  }

  const handleSave = async () => {
    if (!formData.produto || !formData.codigoPdv) {
      toast({
        title: 'Erro',
        description: 'Preencha os campos obrigatórios: Produto e Código PDV',
        variant: 'destructive'
      })
      return
    }

    try {
      // Processar foto antes de salvar
      
      const novaFicha = {
        nome: formData.produto,
        codigo: formData.codigoPdv,
        descricao: formData.descricao,
        categoria: formData.categoria,
        tempo_preparo: parseInt(formData.tempoPreparo) || 0,
        rendimento: parseFloat(formData.rendimento) || 1,
        custo_total_producao: parseFloat(formData.custoUnitario) || 0,
        data_ficha: formData.dataFicha,
        modo_preparo: formData.modoPreparo,
        foto: formData.fotos[0] || null, // ✅ Campo foto sendo salvo corretamente
        ativo: true,
      // ✅ ADICIONANDO os dados relacionados
      insumos: formData.insumos.filter(insumo => insumo.nome && insumo.quantidade),
      produtosProntos: formData.produtosProntos.filter(produto => produto.fichaId && produto.quantidade),
      insumosEmbalagemDelivery: formData.insumosEmbalagemDelivery.filter(embalagem => embalagem.nome && embalagem.quantidade)
    }
    
    // ✅ DEBUG: Log dos dados que serão salvos
      if (import.meta.env.DEV) {
        console.log('🔍 Dados da ficha que serão salvos:', novaFicha)
        console.log('🔍 Insumos filtrados:', novaFicha.insumos)
        console.log('🔍 Produtos prontos filtrados:', novaFicha.produtosProntos)
        console.log('🔍 Embalagens filtradas:', novaFicha.insumosEmbalagemDelivery)
      }
      
      // Salvar ficha técnica

      if (editingFicha) {
        await updateFicha(editingFicha.id, novaFicha)
        toast({ title: 'Sucesso', description: 'Ficha técnica atualizada!' })
      } else {
        await createFicha(novaFicha)
        toast({ title: 'Sucesso', description: 'Ficha técnica criada!' })
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível salvar a ficha.',
        variant: 'destructive'
      })
    }
  }

  const carregarFichaParaEdicao = async (ficha: Ficha) => {
    try {
      // Carregar detalhes da ficha antes de editar
      const fichaDetalhada = await loadFichaDetalhada(ficha.id)
      
      setEditingFicha(ficha)
      setFormData({
        produto: ficha.nome,
        codigoPdv: ficha.codigo,
        categoria: ficha.categoria || '',
        descricao: ficha.descricao || '',
        tempoPreparo: ficha.tempo_preparo?.toString() || '',
        rendimento: ficha.rendimento?.toString() || '',
        custoUnitario: ficha.custo_total_producao?.toString() || '',
        dataFicha: ficha.data_ficha,
        modoPreparo: ficha.modo_preparo || '',
        fotos: fichaDetalhada?.foto ? [fichaDetalhada.foto] : [],
        // ✅ Carregar dados relacionados
        produtosProntos: fichaDetalhada?.produtosProntos?.map(produto => ({
          fichaId: produto.produto_ficha_id,
          quantidade: produto.quantidade.toString(),
          observacao: '',
          custo: produto.custo_unitario?.toString() || '0.00',
          custoTotal: produto.custo_total?.toString() || '0.00'
        })) || [{ fichaId: '', quantidade: '', custo: '', custoTotal: '0.00' }],
        insumosEmbalagemDelivery: fichaDetalhada?.embalagem?.map(emb => ({
          nome: emb.nome,
          codigo: emb.codigo || '',
          quantidade: emb.quantidade.toString(),
          unidade: emb.unidade,
          custo: emb.custo_unitario?.toString() || '0.00',
          custoTotal: emb.custo_total?.toString() || '0.00'
        })) || [{ nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }],
        insumos: [
          // Mapear insumos reais
          ...(fichaDetalhada?.insumos?.map(insumo => ({
            tipo: 'insumo',
            nome: insumo.insumos?.nome || '',
            codigo: insumo.insumos?.codigo_insumo || '',
            quantidade: insumo.quantidade.toString(),
            unidade: insumo.unidade,
            custo: insumo.custo_unitario.toString(),
            custoTotal: (insumo.quantidade * insumo.custo_unitario).toFixed(2)
          })) || []),
          // Mapear bases
          ...(fichaDetalhada?.bases?.map(base => ({
            tipo: 'base',
            nome: base.bases?.nome || '',
            codigo: base.bases?.codigo || '',
            quantidade: base.quantidade.toString(),
            unidade: base.unidade,
            custo: base.custo_unitario.toString(),
            custoTotal: (base.quantidade * base.custo_unitario).toFixed(2)
          })) || [])
        ]
      })
      
      setIsDialogOpen(true)
    } catch (error) {
      console.error('❌ Erro ao carregar ficha para edição:', error)
      // Fallback para versão simples
      setEditingFicha(ficha)
      setFormData({
        produto: ficha.nome,
        codigoPdv: ficha.codigo,
        categoria: ficha.categoria || '',
        descricao: ficha.descricao || '',
        tempoPreparo: ficha.tempo_preparo?.toString() || '',
        rendimento: ficha.rendimento?.toString() || '',
        custoUnitario: ficha.custo_total_producao?.toString() || '',
        dataFicha: ficha.data_ficha,
        modoPreparo: ficha.modo_preparo || '',
        fotos: ficha.foto ? [ficha.foto] : [],
        produtosProntos: [{ fichaId: '', quantidade: '', custo: '', custoTotal: '0.00' }],
        insumosEmbalagemDelivery: [{ nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }],
        insumos: [{ tipo: 'insumo', nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }]
      })
      setIsDialogOpen(true)
    }
  }

  const duplicarFicha = async (ficha: Ficha) => {
    try {
      // Carregar detalhes da ficha antes de duplicar
      const fichaDetalhada = await loadFichaDetalhada(ficha.id)
      
      setFormData({
        produto: `${ficha.nome} (Cópia)`,
        codigoPdv: '',
        categoria: ficha.categoria || '',
        descricao: ficha.descricao || '',
        tempoPreparo: ficha.tempo_preparo?.toString() || '',
        rendimento: ficha.rendimento?.toString() || '',
        custoUnitario: ficha.custo_total_producao?.toString() || '',
        dataFicha: new Date().toISOString().split('T')[0],
        modoPreparo: ficha.modo_preparo || '',
                fotos: ficha.foto ? [ficha.foto] : [],
        produtosProntos: fichaDetalhada?.produtosProntos?.map(produto => ({
          fichaId: produto.produto_ficha_id,
          quantidade: produto.quantidade.toString(),
          observacao: '',
          custo: produto.custo_unitario?.toString() || '0.00',
          custoTotal: produto.custo_total?.toString() || '0.00'
        })) || [{ fichaId: '', quantidade: '', custo: '', custoTotal: '0.00' }],
        insumosEmbalagemDelivery: fichaDetalhada?.embalagem?.map(emb => ({
          nome: emb.nome,
          codigo: emb.codigo || '',
          quantidade: emb.quantidade.toString(),
          unidade: emb.unidade,
          custo: emb.custo_unitario?.toString() || '0.00',
          custoTotal: emb.custo_total?.toString() || '0.00'
        })) || [{ nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }],
        insumos: [
          // Mapear insumos reais
          ...(fichaDetalhada?.insumos?.map(insumo => ({
            tipo: 'insumo',
            nome: insumo.insumos?.nome || '',
            codigo: insumo.insumos?.codigo_insumo || '',
            quantidade: insumo.quantidade.toString(),
            unidade: insumo.unidade,
            custo: insumo.custo_unitario.toString(),
            custoTotal: (insumo.quantidade * insumo.custo_unitario).toFixed(2)
          })) || []),
          // Mapear bases
          ...(fichaDetalhada?.bases?.map(base => ({
            tipo: 'base',
            nome: base.bases?.nome || '',
            codigo: base.bases?.codigo || '',
            quantidade: base.quantidade.toString(),
            unidade: base.unidade,
            custo: base.custo_unitario.toString(),
            custoTotal: (base.quantidade * base.custo_unitario).toFixed(2)
          })) || [])
        ]
      })
      setIsDialogOpen(true)
    } catch (error) {
      console.error('❌ Erro ao duplicar ficha:', error)
      // Fallback para versão simples
      setFormData({
        produto: `${ficha.nome} (Cópia)`,
        codigoPdv: '',
        categoria: ficha.categoria || '',
        descricao: ficha.descricao || '',
        tempoPreparo: ficha.tempo_preparo?.toString() || '',
        rendimento: ficha.rendimento?.toString() || '',
        custoUnitario: ficha.custo_total_producao?.toString() || '',
        dataFicha: new Date().toISOString().split('T')[0],
        modoPreparo: ficha.modo_preparo || '',
        fotos: ficha.foto ? [ficha.foto] : [],
        produtosProntos: [{ fichaId: '', quantidade: '', custo: '', custoTotal: '0.00' }],
        insumosEmbalagemDelivery: [{ nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }],
        insumos: [{ tipo: 'insumo', nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }]
      })
      setIsDialogOpen(true)
    }
  }

  const openFichaDetails = async (ficha: Ficha) => {
    try {
      const fichaDetalhada = await loadFichaDetalhada(ficha.id)
      
      if (fichaDetalhada) {
        
        setSelectedFicha(fichaDetalhada)
      } else {
        setSelectedFicha(ficha)
      }
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes da ficha:', error)
      setSelectedFicha(ficha)
      setIsViewDialogOpen(true)
    }
  }

  // Função para calcular o custo total da embalagem de delivery
  const calcularCustoTotalEmbalagemDelivery = () => {
    return formData.insumosEmbalagemDelivery.reduce((total, embalagem) => {
      return total + (parseFloat(embalagem.custoTotal) || 0)
    }, 0)
  }

  const addProdutoPronto = () => {
    setFormData(prev => ({
      ...prev,
      produtosProntos: [...prev.produtosProntos, { fichaId: '', quantidade: '', observacao: '', custo: '', custoTotal: '0.00' }]
    }))
  }

  const removeProdutoPronto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      produtosProntos: prev.produtosProntos.filter((_, i) => i !== index)
    }))
  }

  const addInsumo = () => {
    setFormData(prev => ({
      ...prev,
      insumos: [...prev.insumos, { tipo: 'insumo', nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }]
    }))
  }

  const removeInsumo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      insumos: prev.insumos.filter((_, i) => i !== index)
    }))
  }

  const addEmbalagemDelivery = () => {
    setFormData(prev => ({
      ...prev,
      insumosEmbalagemDelivery: [...prev.insumosEmbalagemDelivery, { nome: '', codigo: '', quantidade: '', unidade: '', custo: '', custoTotal: '0.00' }]
    }))
  }

  const removeEmbalagemDelivery = (index: number) => {
    setFormData(prev => ({
      ...prev,
      insumosEmbalagemDelivery: prev.insumosEmbalagemDelivery.filter((_, i) => i !== index)
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Processar cada arquivo
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          try {
            // Mostrar loading
            toast({
              title: "Upload em andamento...",
              description: `Enviando ${file.name}...`,
            })

            // Fazer upload para Supabase Storage
            const result = await uploadAndCompressImage(file, 'fichas')
            
            if (result.success && result.url) {
              // Adicionar URL da imagem ao formData
              setFormData(prev => ({ 
                ...prev, 
                fotos: [...prev.fotos, result.url!] 
              }))
              
              toast({
                title: "Sucesso!",
                description: `Imagem ${file.name} enviada com sucesso!`,
              })
            } else {
              toast({
                title: "Erro no upload",
                description: result.error || "Erro desconhecido",
                variant: "destructive"
              })
            }
          } catch (error: any) {
            console.error('Erro no upload:', error)
            toast({
              title: "Erro no upload",
              description: `Erro ao enviar ${file.name}: ${error.message}`,
              variant: "destructive"
            })
          }
        } else {
              toast({
            title: "Arquivo inválido",
            description: `${file.name} não é uma imagem válida`,
                variant: "destructive"
              })
        }
      }
      
      // Limpar input
      event.target.value = ''
    }
  }

  const removePhoto = async (index: number) => {
    const photoToRemove = formData.fotos[index]
    
    // Se for uma URL do Storage (não base64), remover do Storage também
    if (photoToRemove && photoToRemove.startsWith('http')) {
      try {
        const result = await deleteImageFromStorage(photoToRemove)
        if (!result.success) {
          console.warn('Erro ao remover imagem do Storage:', result.error)
          // Continuar mesmo se falhar a remoção do Storage
        }
      } catch (error) {
        console.warn('Erro ao remover imagem do Storage:', error)
        // Continuar mesmo se falhar a remoção do Storage
      }
    }
    
    // Remover da lista local
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }))
  }

  const copiarDeFicha = (fichaOrigem: Ficha) => {
    setFormData({
      produto: `${fichaOrigem.nome} (Cópia)`,
      codigoPdv: '',
      categoria: fichaOrigem.categoria || '',
      descricao: fichaOrigem.descricao || '',
      tempoPreparo: fichaOrigem.tempo_preparo?.toString() || '',
      rendimento: fichaOrigem.rendimento?.toString() || '',
      custoUnitario: fichaOrigem.custo_total_producao?.toString() || '',
      dataFicha: new Date().toISOString().split('T')[0],
      modoPreparo: fichaOrigem.modo_preparo || '',
      fotos: fichaOrigem.foto ? [fichaOrigem.foto] : [],
      produtosProntos: [],
      insumosEmbalagemDelivery: [],
      insumos: []
    })
    toast({ title: 'Sucesso', description: `Dados copiados da ficha "${fichaOrigem.nome}"!` })
  }

  const limparFiltros = () => {
    setFiltros({
      codigoPdv: '',
      nomeProduto: '',
      categoria: 'all',
      dataInicio: '',
      dataFim: '',
      custoMinimo: '',
      custoMaximo: ''
    })
    setSearchTerm('')
    setSelectedCategory('all')
  }

  const filteredFichas = fichas.filter(ficha => {
    // Filtro de busca geral (mantém compatibilidade)
    const matchesSearch = ficha.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtros específicos por coluna
    const matchesCodigoPdv = !filtros.codigoPdv || 
                            ficha.codigo?.toLowerCase().includes(filtros.codigoPdv.toLowerCase())
    
    const matchesNomeProduto = !filtros.nomeProduto || 
                              ficha.nome?.toLowerCase().includes(filtros.nomeProduto.toLowerCase())
    
    const matchesCategoria = filtros.categoria === 'all' || ficha.categoria === filtros.categoria
    
    // Filtro por data
    const dataFicha = new Date(ficha.data_ficha)
    const matchesDataInicio = !filtros.dataInicio || dataFicha >= new Date(filtros.dataInicio)
    const matchesDataFim = !filtros.dataFim || dataFicha <= new Date(filtros.dataFim)
    
    // Filtro por custo
    const custoFicha = ficha.custo_total_producao || 0
    const matchesCustoMinimo = !filtros.custoMinimo || custoFicha >= parseFloat(filtros.custoMinimo)
    const matchesCustoMaximo = !filtros.custoMaximo || custoFicha <= parseFloat(filtros.custoMaximo)
    
    return matchesSearch && 
           matchesCodigoPdv && 
           matchesNomeProduto && 
           matchesCategoria && 
           matchesDataInicio && 
           matchesDataFim && 
           matchesCustoMinimo && 
           matchesCustoMaximo
  })

  return (
    <Layout currentPage="fichas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Fichas Técnicas
            </h1>
            <p className="text-muted-foreground mt-1">Controle completo de custos e receitas dos produtos</p>
          </div>
          <div className="flex gap-2">
            <ImportarFichasTecnicas onImportSuccess={() => {
              // Recarregar a lista de fichas após importação bem-sucedida
              refresh()
              toast({
                title: "Sucesso!",
                description: "Fichas técnicas importadas com sucesso! A lista foi atualizada.",
                variant: "default"
              })
            }} />
            <Button variant="default" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova Ficha Técnica
            </Button>
          </div>
        </div>

        {/* Busca e Filtros Avançados */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Busca Geral */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                    placeholder="Busca geral (nome ou código)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
                <Button variant="outline" onClick={limparFiltros} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Limpar Filtros
                </Button>
        </div>

              {/* Filtros Específicos por Coluna */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Código PDV */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Código PDV</Label>
                  <Input
                    placeholder="Ex: PRD001"
                    value={filtros.codigoPdv}
                    onChange={(e) => setFiltros(prev => ({ ...prev, codigoPdv: e.target.value }))}
                  />
                </div>

                {/* Nome do Produto */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome do Produto</Label>
                  <Input
                    placeholder="Ex: Combo Família"
                    value={filtros.nomeProduto}
                    onChange={(e) => setFiltros(prev => ({ ...prev, nomeProduto: e.target.value }))}
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoria</Label>
                  <Select value={filtros.categoria} onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data de Cadastro - Início */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data Início</Label>
                  <Input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                  />
                </div>

                {/* Data de Cadastro - Fim */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data Fim</Label>
                  <Input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                  />
                </div>
              </div>

              {/* Filtros de Custo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custo Mínimo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10.00"
                    value={filtros.custoMinimo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, custoMinimo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custo Máximo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 50.00"
                    value={filtros.custoMaximo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, custoMaximo: e.target.value }))}
                  />
                </div>
              </div>

              {/* Resumo dos Filtros Ativos */}
              {(filtros.codigoPdv || filtros.nomeProduto || filtros.categoria !== 'all' || 
                filtros.dataInicio || filtros.dataFim || filtros.custoMinimo || filtros.custoMaximo) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filtros ativos:</span>
                  {filtros.codigoPdv && <Badge variant="secondary">Código: {filtros.codigoPdv}</Badge>}
                  {filtros.nomeProduto && <Badge variant="secondary">Nome: {filtros.nomeProduto}</Badge>}
                  {filtros.categoria !== 'all' && <Badge variant="secondary">Categoria: {filtros.categoria}</Badge>}
                  {filtros.dataInicio && <Badge variant="secondary">De: {new Date(filtros.dataInicio).toLocaleDateString('pt-BR')}</Badge>}
                  {filtros.dataFim && <Badge variant="secondary">Até: {new Date(filtros.dataFim).toLocaleDateString('pt-BR')}</Badge>}
                  {filtros.custoMinimo && <Badge variant="secondary">Custo ≥ R$ {filtros.custoMinimo}</Badge>}
                  {filtros.custoMaximo && <Badge variant="secondary">Custo ≤ R$ {filtros.custoMaximo}</Badge>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Fichas</p>
                  <p className="text-2xl font-bold">{fichas.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resultados Filtrados</p>
                  <p className="text-2xl font-bold">{filteredFichas.length}</p>
                </div>
                <Filter className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
                  <p className="text-2xl font-bold">
                    R$ {filteredFichas.length > 0 ? (filteredFichas.reduce((acc, f) => acc + (f.custo_total_producao || 0), 0) / filteredFichas.length).toFixed(2) : '0,00'}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">
                    {filteredFichas.length > 0 ? Math.round(filteredFichas.reduce((acc, f) => acc + (f.tempo_preparo || 0), 0) / filteredFichas.length) : 0} min
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Fichas */}
        <Card>
          <CardContent className="p-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código PDV</TableHead>
                    <TableHead>Nome do Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Custo Unitário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFichas.map((ficha) => (
                    <TableRow key={ficha.id}>
                      <TableCell className="font-medium">{ficha.codigo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ficha.nome}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {ficha.categoria || 'Sem categoria'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ficha.data_ficha).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>R$ {ficha.custo_total_producao?.toFixed(2) || '0,00'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openFichaDetails(ficha)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => carregarFichaParaEdicao(ficha)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja excluir esta ficha?')) {
                                try {
                                  await deleteFicha(ficha.id)
                                } catch (error: any) {
                                  if (error.message.includes('está sendo usada')) {
                                    const forcarExclusao = confirm(
                                      `${error.message}\n\nDeseja forçar a exclusão removendo automaticamente a ficha dos produtos que a estão usando?`
                                    )
                                    if (forcarExclusao) {
                                      try {
                                        await deleteFicha(ficha.id, true)
                                        toast({
                                          title: 'Sucesso',
                                          description: 'Ficha técnica excluída com sucesso!'
                                        })
                                      } catch (erroForcar: any) {
                                        toast({
                                          title: 'Erro',
                                          description: erroForcar.message,
                                          variant: 'destructive'
                                        })
                                      }
                                    }
                                  } else {
                                    toast({
                                      title: 'Erro',
                                      description: error.message,
                                      variant: 'destructive'
                                    })
                                  }
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => duplicarFicha(ficha)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog de criação/edição */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFicha ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}</DialogTitle>
              <DialogDescription>
                Preencha os dados da ficha técnica do produto
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-4">
              <div className="lg:col-span-3 space-y-6">
                {/* Duplicar Ficha Existente */}
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Duplicar ficha existente:</span>
                    <Select onValueChange={(fichaId) => {
                      const fichaSelecionada = fichas.find(f => f.id === fichaId)
                      if (fichaSelecionada) {
                        duplicarFicha(fichaSelecionada)
                      }
                    }}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Escolha uma ficha para duplicar" />
                      </SelectTrigger>
                      <SelectContent>
                        {fichas.map((ficha) => (
                          <SelectItem key={ficha.id} value={ficha.id}>
                            {ficha.codigo} - {ficha.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Informações Básicas */}
                <Card className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Informações Básicas</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Código PDV *</Label>
                      <Input
                        placeholder="Código do PDV"
                        value={formData.codigoPdv}
                        onChange={(e) => setFormData(prev => ({ ...prev, codigoPdv: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Produto *</Label>
                      <Input
                        placeholder="Nome do produto"
                        value={formData.produto}
                        onChange={(e) => setFormData(prev => ({ ...prev, produto: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data da Ficha *</Label>
                      <Input
                        type="date"
                        value={formData.dataFicha}
                        onChange={(e) => setFormData(prev => ({ ...prev, dataFicha: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Custo Unitário (R$) - Calculado Automaticamente</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={formData.custoUnitario}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                        title="Custo calculado automaticamente: Produtos Prontos + Insumos + Embalagens"
                      />
                      <p className="text-xs text-muted-foreground">
                        Soma automática: Produtos Prontos + Insumos + Embalagens
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tempo de Preparo (min)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.tempoPreparo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tempoPreparo: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rendimento</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 8 porções"
                        value={formData.rendimento}
                        onChange={(e) => setFormData(prev => ({ ...prev, rendimento: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição do Produto</Label>
                      <Textarea
                        placeholder="Descreva as características do produto..."
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fotos</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Camera className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-500">Clique para adicionar fotos</p>
                            <p className="text-xs text-gray-400">Ou arraste</p>
                          </div>
                        </label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        Adicionar Fotos
                      </Button>
                      {formData.fotos.length > 0 && (
                        <div className="mt-2">
                          <Label>Fotos Adicionadas</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {formData.fotos.map((foto, index) => (
                              <div key={index} className="relative group">
                                <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removePhoto(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Produtos Prontos */}
                <Card className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Produtos Prontos (Fichas Existentes)</h3>
                    <Button variant="outline" size="sm" onClick={addProdutoPronto}>
                      <Plus className="h-4 w-4" />
                      Adicionar Produto
                    </Button>
                  </div>
                      <div className="space-y-2">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div>Código</div>
                      <div>Nome do Produto</div>
                      <div>Qtd.</div>
                      <div>Und.</div>
                      <div>Custo (R$)</div>
                      <div>Ações</div>
                    </div>
                    {formData.produtosProntos.map((produto, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 p-3 border rounded">
                        <Input 
                          placeholder="Código automático" 
                          value={fichas.find(f => f.id === produto.fichaId)?.codigo || ''} 
                          readOnly 
                          className="bg-gray-50" 
                        />
                        <ProdutoProntoCombobox
                          items={fichas}
                          selectedLabel={fichas.find(f => f.id === produto.fichaId)?.nome || ''}
                          onSelect={async (ficha) => {
                            
                            const newProdutos = [...formData.produtosProntos]
                            const quantidade = parseFloat(newProdutos[index].quantidade) || 1
                            
                            try {
                              // ✅ CORREÇÃO: Usar custo_total_producao diretamente (já inclui embalagem)
                              // O custo_total_producao já é o custo final da ficha (insumos + embalagem)
                              let custoFinal = ficha.custo_total_producao || 0
                              
                              // Se não houver custo_total_producao, calcular apenas insumos
                              if (custoFinal === 0) {
                                custoFinal = await calcularCustoApenasInsumos(ficha.id)
                              }
                              
                              // ✅ CORREÇÃO: NÃO adicionar embalagem de delivery novamente
                              // O custo_total_producao já inclui a embalagem da ficha original
                              const custoTotal = (quantidade * custoFinal).toFixed(2)
                              
                              newProdutos[index] = {
                                ...newProdutos[index],
                                fichaId: ficha.id,
                                quantidade: '1',
                                custo: custoFinal.toFixed(2), // ✅ Custo final (insumos ou total)
                                custoTotal: custoTotal
                              }
                              setFormData(prev => ({ ...prev, produtosProntos: newProdutos }))
                              
                            } catch (error) {
                              console.error('❌ Erro ao calcular custo:', error)
                            }
                          }}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.00"
                          value={produto.quantidade}
                          onChange={(e) => {
                            const newProdutos = [...formData.produtosProntos]
                            const quantidade = parseFloat(e.target.value) || 0
                            const custoUnitario = parseFloat(newProdutos[index].custo) || 0
                            // ✅ CORREÇÃO: NÃO adicionar embalagem de delivery novamente
                            // O custo_unitario já é o custo final da ficha (insumos + embalagem)
                            const custoTotal = (quantidade * custoUnitario).toFixed(2)
                            
                            newProdutos[index] = {
                              ...newProdutos[index],
                              quantidade: e.target.value,
                              custoTotal: custoTotal
                            }
                            setFormData(prev => ({ ...prev, produtosProntos: newProdutos }))
                          }}
                        />
                        <Input value="un" readOnly className="bg-gray-50" />
                        <Input
                          value={produto.custoTotal || '0.00'}
                          readOnly
                          className="bg-gray-50"
                          title="Custo apenas dos insumos do produto, menos o custo da embalagem de delivery"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProdutoPronto(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  ))}
                  </div>
                </Card>

                {/* Insumos */}
                <Card className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Insumos</h3>
                    <Button variant="outline" size="sm" onClick={addInsumo}>
                      <Plus className="h-4 w-4" />
                      Adicionar Insumo
                    </Button>
                  </div>
                      <div className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div className="hidden md:block">Tipo</div>
                      <div className="hidden md:block">Código</div>
                      <div className="col-span-2">Nome</div>
                      <div className="hidden md:block">Qtd.</div>
                      <div className="hidden md:block">Unidade</div>
                      <div className="hidden md:block">Custo (R$)</div>
                    </div>
                    {formData.insumos.map((insumo, index) => (
                      <div key={index} className="grid grid-cols-2 md:grid-cols-7 gap-3 p-3 border rounded">
                        <div className="hidden md:block">
                        <Select
                          value={insumo.tipo || 'insumo'}
                          onValueChange={(value) => {
                            const newInsumos = [...formData.insumos]
                            newInsumos[index] = {
                              ...newInsumos[index],
                              tipo: value,
                              nome: '',
                              codigo: '',
                              unidade: '',
                              custo: '',
                              custoTotal: '0.00'
                            }
                            setFormData(prev => ({ ...prev, insumos: newInsumos }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="insumo">Insumo</SelectItem>
                            <SelectItem value="base">Base</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                        <div className="hidden md:block">
                        <Input
                          placeholder="Código automático"
                          value={insumo.codigo}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                        <div className="col-span-2">
                        {insumo.tipo === 'base' ? (
                          <Select
                            value={insumo.nome}
                            onValueChange={(value) => {
                              const newInsumos = [...formData.insumos]
                              const selectedBase = bases.find(b => b.nome === value)
                              if (selectedBase) {
                                // ✅ CORREÇÃO: Calcular custo unitário da base (custo total da batelada ÷ quantidade total)
                                const custoUnitario = selectedBase.quantidade_total > 0 
                                  ? parseFloat(selectedBase.custo_total_batelada?.toString() || '0') / selectedBase.quantidade_total
                                  : 0
                                const quantidade = parseFloat(newInsumos[index].quantidade) || 0
                                const custoTotal = (quantidade * custoUnitario).toFixed(2)
                                
                                newInsumos[index] = {
                                  ...newInsumos[index],
                                  nome: selectedBase.nome || '',
                                  codigo: selectedBase.codigo || '',
                                  unidade: selectedBase.unidade_produto || 'kg',
                                  custo: custoUnitario.toFixed(2),
                                  custoTotal: custoTotal
                                }
                                setFormData(prev => ({ ...prev, insumos: newInsumos }))
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a base" />
                            </SelectTrigger>
                            <SelectContent>
                              {bases.map((base) => (
                                <SelectItem key={base.id} value={base.nome}>
                                  {base.nome} - {base.codigo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <InsumoCombobox
                            items={insumos}
                            selectedLabel={insumo.nome}
                            onSelect={(item) => {
                              const newInsumos = [...formData.insumos]
                              // CALCULAR CUSTO UNITÁRIO CORRETO: preço × fator de correção
                              const custoUnitario = parseFloat(item.preco_por_unidade?.toString() || '0') * parseFloat(item.fator_correcao?.toString() || '1')
                              const quantidade = parseFloat(newInsumos[index].quantidade) || 0
                              const custoTotal = (quantidade * custoUnitario).toFixed(2)
                              
                              newInsumos[index] = {
                                ...newInsumos[index],
                                nome: item.nome || '',
                                codigo: item.codigo_insumo || '',
                                unidade: item.unidade_medida || '',
                                custo: custoUnitario.toFixed(2),
                                custoTotal: custoTotal
                              }
                              setFormData(prev => ({ ...prev, insumos: newInsumos }))
                            }}
                            placeholder="Buscar insumo"
                          />
                        )}
                      </div>
                        <div className="hidden md:block">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={insumo.quantidade}
                          onChange={(e) => {
                            const newInsumos = [...formData.insumos]
                            const quantidade = parseFloat(e.target.value) || 0
                            const custoUnitario = parseFloat(newInsumos[index].custo) || 0
                            const custoTotal = (quantidade * custoUnitario).toFixed(2)
                            
                            newInsumos[index] = {
                              ...newInsumos[index],
                              quantidade: e.target.value,
                              custoTotal: custoTotal
                            }
                            setFormData(prev => ({ ...prev, insumos: newInsumos }))
                          }}
                        />
                      </div>
                        <div className="hidden md:block">
                        <Input
                          value={insumo.unidade}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                        <div className="hidden md:block">
                        <Input
                          value={insumo.custoTotal || '0.00'}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                        <div className="flex items-center justify-between md:justify-center">
                          <div className="md:hidden space-y-2">
                            <div className="text-xs text-muted-foreground">Qtd: {insumo.quantidade} {insumo.unidade}</div>
                            <div className="text-xs text-muted-foreground">Custo: R$ {insumo.custoTotal || '0.00'}</div>
                          </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInsumo(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                </Card>

                {/* Embalagem */}
                <Card className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Embalagem</h3>
                    <Button variant="outline" size="sm" onClick={addEmbalagemDelivery}>
                      <Plus className="h-4 w-4" />
                      Adicionar Embalagem
                    </Button>
                  </div>
                      <div className="space-y-2">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div>Código</div>
                      <div>Nome da Embalagem</div>
                      <div>Qtd.</div>
                      <div>Unidade</div>
                      <div>Custo (R$)</div>
                      <div>Ações</div>
                    </div>
                    {formData.insumosEmbalagemDelivery.map((embalagem, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 p-3 border rounded">
                        <Input
                          placeholder="Código automático"
                          value={embalagem.codigo}
                          readOnly
                          className="bg-gray-50"
                        />
                        <Select 
                          value={embalagem.nome} 
                          onValueChange={(value) => {
                            const newEmbalagens = [...formData.insumosEmbalagemDelivery]
                            const selectedInsumo = insumos.find(i => i.nome === value)
                            if (selectedInsumo) {
                              // ✅ Calcular custo unitário: preço × fator de correção
                              const custoUnitario = (selectedInsumo.preco_por_unidade * selectedInsumo.fator_correcao).toFixed(2)
                              console.log('🔍 Embalagem selecionada:', value, 'Preço:', selectedInsumo.preco_por_unidade, 'Fator:', selectedInsumo.fator_correcao, 'Custo unitário:', custoUnitario)
                              newEmbalagens[index] = {
                                ...newEmbalagens[index],
                                nome: value,
                                codigo: selectedInsumo.codigo_insumo || '',
                                unidade: selectedInsumo.unidade_medida || '',
                                custo: custoUnitario
                              }
                              setFormData(prev => ({ ...prev, insumosEmbalagemDelivery: newEmbalagens }))
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a embalagem" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {insumos
                              .filter(i => i.categoria === 'EMBALAGENS' && i.ativo)
                              .map((insumo) => (
                                <SelectItem key={insumo.id} value={insumo.nome || ''}>
                                  {insumo.nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {insumos.filter(i => i.categoria === 'EMBALAGENS' && i.ativo).length === 0 && (
                          <p className="text-sm text-muted-foreground mt-1">Nenhuma embalagem cadastrada</p>
                        )}
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={embalagem.quantidade}
                          onChange={(e) => {
                            const newEmbalagens = [...formData.insumosEmbalagemDelivery]
                            const quantidade = parseFloat(e.target.value) || 0
                            const custo = parseFloat(newEmbalagens[index].custo) || 0
                            const custoTotal = (quantidade * custo).toFixed(2)
                            
                            console.log('🔍 Embalagem quantidade alterada:', newEmbalagens[index].nome, 'Qtd:', quantidade, 'Custo unitário:', custo, 'Custo total:', custoTotal)
                            
                            newEmbalagens[index] = {
                              ...newEmbalagens[index],
                              quantidade: e.target.value,
                              custoTotal: custoTotal
                            }
                            setFormData(prev => ({ ...prev, insumosEmbalagemDelivery: newEmbalagens }))
                          }}
                        />
                        <Input
                          value={embalagem.unidade}
                          readOnly
                          className="bg-gray-50"
                        />
                        <Input
                          value={embalagem.custoTotal || '0.00'}
                          readOnly
                          className="bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEmbalagemDelivery(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  ))}
                  </div>
                </Card>

                {/* Modo de Preparação */}
                <Card className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Modo de Preparação</h3>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="1. Primeiro passo...
2. Segundo passo...
3. Continue descrevendo cada etapa."
                      value={formData.modoPreparo}
                      onChange={(e) => setFormData(prev => ({ ...prev, modoPreparo: e.target.value }))}
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                Salvar Ficha
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Ficha Técnica</DialogTitle>
              <DialogDescription>
                Visualização completa da ficha técnica
              </DialogDescription>
            </DialogHeader>

            {selectedFicha && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código PDV</Label>
                    <p className="text-base">{selectedFicha.codigo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nome do Produto</Label>
                    <p className="text-base font-medium">{selectedFicha.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                    <p className="text-base">{selectedFicha.categoria || 'Não definida'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data da Ficha</Label>
                    <p className="text-base">{new Date(selectedFicha.data_ficha).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tempo de Preparo</Label>
                    <p className="text-base">{selectedFicha.tempo_preparo} min</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Rendimento</Label>
                    <p className="text-base">{selectedFicha.rendimento} porções</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Custo Total</Label>
                    <p className="text-base font-bold text-green-600">
                      R$ {selectedFicha.custo_total_producao?.toFixed(2) || '0,00'}
                    </p>
                  </div>
                </div>

                {/* Seção de Produtos Prontos */}
                {'produtosProntos' in selectedFicha && (selectedFicha as any).produtosProntos && (selectedFicha as any).produtosProntos.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Produtos Prontos (Fichas Existentes)</h3>
                    <div className="space-y-2">
                      {(selectedFicha as any).produtosProntos.map((produto: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <span className="font-medium">{produto.fichas_tecnicas?.nome || 'Produto não encontrado'}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {produto.quantidade} {produto.unidade} - Código: {produto.fichas_tecnicas?.codigo}
                            </span>
                          </div>
                          <span className="font-medium text-green-600">
                            R$ {produto.custo_total?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção de Insumos */}
                {'insumos' in selectedFicha && (selectedFicha as any).insumos && (selectedFicha as any).insumos.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Insumos</h3>
                    <div className="space-y-2">
                      {(selectedFicha as any).insumos.map((insumo: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <span className="font-medium">{insumo.insumos?.nome || 'Nome não encontrado'}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {insumo.quantidade} {insumo.unidade}
                            </span>
                          </div>
                          <span className="font-medium text-green-600">
                            R$ {((insumo.quantidade || 0) * (insumo.custo_unitario || 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção de Bases */}
                {'bases' in selectedFicha && (selectedFicha as any).bases && (selectedFicha as any).bases.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Bases</h3>
                    <div className="space-y-2">
                      {(selectedFicha as any).bases.map((base: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <span className="font-medium">{base.bases?.nome || `Base ${index + 1}`}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {base.quantidade} {base.unidade}
                            </span>
                          </div>
                          <span className="font-medium text-green-600">
                            R$ {base.custo_total?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção de Embalagens */}
                {'embalagem' in selectedFicha && (selectedFicha as any).embalagem && (selectedFicha as any).embalagem.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Embalagens</h3>
                    <div className="space-y-2">
                      {(selectedFicha as any).embalagem.map((emb: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <span className="font-medium">{emb.nome}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {emb.quantidade} {emb.unidade} - Código: {emb.codigo}
                            </span>
                          </div>
                          <span className="font-medium text-green-600">
                            R$ {emb.custo_total?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFicha.descricao && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                    <p className="text-base">{selectedFicha.descricao}</p>
                  </div>
                )}

                {selectedFicha.foto && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Foto do Produto</Label>
                    <img
                      src={selectedFicha.foto}
                      alt="Foto do produto"
                      className="w-full max-w-md h-64 object-cover rounded-lg border mt-2"
                    />
                  </div>
                )}

                {selectedFicha.modo_preparo && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Modo de Preparo</Label>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2 whitespace-pre-line">
                      <p className="text-sm font-mono">{selectedFicha.modo_preparo}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t">
              <Button onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}