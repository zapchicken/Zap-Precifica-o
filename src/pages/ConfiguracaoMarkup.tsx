import { useState, useEffect, useMemo } from "react"
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORIAS_FIXAS, CategoriaValor } from '@/data/categorias-fixas';
import { useDespesasFixas } from '@/hooks/useDespesasFixas';
import { useMaoDeObra } from '@/hooks/useMaoDeObra';
import { useMarkup } from '@/hooks/useMarkup';

type ConfigGeral = {
  faturamento_estimado: number;
  taxa_cartao: number;
  taxa_imposto: number;
  investimento_mkt: number;
  reserva_operacional: number;
  despesas_fixas: number;
  lucro_desejado_acompanhamentos: number;
  reserva_operacional_acompanhamentos: number;
  valor_cupom_vd_acompanhamentos: number;
  valor_cupom_mkt_acompanhamentos: number;
  lucro_desejado_bebidas_cervejas_e_chopp: number;
  reserva_operacional_bebidas_cervejas_e_chopp: number;
  valor_cupom_vd_bebidas_cervejas_e_chopp: number;
  valor_cupom_mkt_bebidas_cervejas_e_chopp: number;
  lucro_desejado_bebidas_refrigerantes: number;
  reserva_operacional_bebidas_refrigerantes: number;
  valor_cupom_vd_bebidas_refrigerantes: number;
  valor_cupom_mkt_bebidas_refrigerantes: number;
  lucro_desejado_bebidas_sucos: number;
  reserva_operacional_bebidas_sucos: number;
  valor_cupom_vd_bebidas_sucos: number;
  valor_cupom_mkt_bebidas_sucos: number;
  lucro_desejado_combo_lanches_carne_angus: number;
  reserva_operacional_combo_lanches_carne_angus: number;
  valor_cupom_vd_combo_lanches_carne_angus: number;
  valor_cupom_mkt_combo_lanches_carne_angus: number;
  lucro_desejado_combo_lanches_frango: number;
  reserva_operacional_combo_lanches_frango: number;
  valor_cupom_vd_combo_lanches_frango: number;
  valor_cupom_mkt_combo_lanches_frango: number;
  lucro_desejado_frango_americano: number;
  reserva_operacional_frango_americano: number;
  valor_cupom_vd_frango_americano: number;
  valor_cupom_mkt_frango_americano: number;
  lucro_desejado_jumbos: number;
  reserva_operacional_jumbos: number;
  valor_cupom_vd_jumbos: number;
  valor_cupom_mkt_jumbos: number;
  lucro_desejado_lanches: number;
  reserva_operacional_lanches: number;
  valor_cupom_vd_lanches: number;
  valor_cupom_mkt_lanches: number;
  lucro_desejado_molhos: number;
  reserva_operacional_molhos: number;
  valor_cupom_vd_molhos: number;
  valor_cupom_mkt_molhos: number;
  lucro_desejado_promocoes: number;
  reserva_operacional_promocoes: number;
  valor_cupom_vd_promocoes: number;
  valor_cupom_mkt_promocoes: number;
  lucro_desejado_saladas: number;
  reserva_operacional_saladas: number;
  valor_cupom_vd_saladas: number;
  valor_cupom_mkt_saladas: number;
  lucro_desejado_sobremesas: number;
  reserva_operacional_sobremesas: number;
  valor_cupom_vd_sobremesas: number;
  valor_cupom_mkt_sobremesas: number;
  lucro_desejado_zapbox: number;
  reserva_operacional_zapbox: number;
  valor_cupom_vd_zapbox: number;
  valor_cupom_mkt_zapbox: number;
};

export default function ConfiguracaoMarkup() {
  const { user } = useAuth();
  const { getTotalMensal: getTotalDespesasFixas } = useDespesasFixas();
  const { totalGeral: totalMaoDeObra } = useMaoDeObra();
  const { canaisVenda, adicionarCanalVenda, atualizarCanalVenda, removerCanalVenda } = useMarkup();
  const [configGeral, setConfigGeral] = useState<ConfigGeral>({
    faturamento_estimado: 0,
    taxa_cartao: 4,
    taxa_imposto: 4,
    investimento_mkt: 15,
    reserva_operacional: 5,
    despesas_fixas: 10,
    lucro_desejado_acompanhamentos: 17,
    reserva_operacional_acompanhamentos: 5,
    valor_cupom_vd_acompanhamentos: 0,
    valor_cupom_mkt_acompanhamentos: 0,
    lucro_desejado_bebidas_cervejas_e_chopp: 15,
    reserva_operacional_bebidas_cervejas_e_chopp: 5,
    valor_cupom_vd_bebidas_cervejas_e_chopp: 0,
    valor_cupom_mkt_bebidas_cervejas_e_chopp: 0,
    lucro_desejado_bebidas_refrigerantes: 15,
    reserva_operacional_bebidas_refrigerantes: 5,
    valor_cupom_vd_bebidas_refrigerantes: 0,
    valor_cupom_mkt_bebidas_refrigerantes: 0,
    lucro_desejado_bebidas_sucos: 15,
    reserva_operacional_bebidas_sucos: 5,
    valor_cupom_vd_bebidas_sucos: 0,
    valor_cupom_mkt_bebidas_sucos: 0,
    lucro_desejado_combo_lanches_carne_angus: 15,
    reserva_operacional_combo_lanches_carne_angus: 5,
    valor_cupom_vd_combo_lanches_carne_angus: 0,
    valor_cupom_mkt_combo_lanches_carne_angus: 0,
    lucro_desejado_combo_lanches_frango: 15,
    reserva_operacional_combo_lanches_frango: 5,
    valor_cupom_vd_combo_lanches_frango: 0,
    valor_cupom_mkt_combo_lanches_frango: 0,
    lucro_desejado_frango_americano: 15,
    reserva_operacional_frango_americano: 5,
    valor_cupom_vd_frango_americano: 0,
    valor_cupom_mkt_frango_americano: 0,
    lucro_desejado_jumbos: 15,
    reserva_operacional_jumbos: 5,
    valor_cupom_vd_jumbos: 0,
    valor_cupom_mkt_jumbos: 0,
    lucro_desejado_lanches: 15,
    reserva_operacional_lanches: 5,
    valor_cupom_vd_lanches: 0,
    valor_cupom_mkt_lanches: 0,
    lucro_desejado_molhos: 15,
    reserva_operacional_molhos: 5,
    valor_cupom_vd_molhos: 0,
    valor_cupom_mkt_molhos: 0,
    lucro_desejado_promocoes: 15,
    reserva_operacional_promocoes: 5,
    valor_cupom_vd_promocoes: 0,
    valor_cupom_mkt_promocoes: 0,
    lucro_desejado_saladas: 15,
    reserva_operacional_saladas: 5,
    valor_cupom_vd_saladas: 0,
    valor_cupom_mkt_saladas: 0,
    lucro_desejado_sobremesas: 15,
    reserva_operacional_sobremesas: 5,
    valor_cupom_vd_sobremesas: 0,
    valor_cupom_mkt_sobremesas: 0,
    lucro_desejado_zapbox: 15,
    reserva_operacional_zapbox: 5,
    valor_cupom_vd_zapbox: 0,
    valor_cupom_mkt_zapbox: 0,
  });

  const [valoresPorCategoria, setValoresPorCategoria] = useState<CategoriaValor[]>([]);

  // Calcular percentual de despesas fixas automaticamente
  const percentualDespesasFixasCalculado = useMemo(() => {
    if (configGeral.faturamento_estimado > 0) {
      const totalDespesasFixas = getTotalDespesasFixas();
      const totalMaoDeObraCalculado = totalMaoDeObra;
      const totalDespesasOperacionais = totalDespesasFixas + totalMaoDeObraCalculado;
      
      // Calcular % de despesas fixas sobre faturamento
      return Math.round((totalDespesasOperacionais / configGeral.faturamento_estimado) * 100 * 100) / 100;
    }
    return 0;
  }, [configGeral.faturamento_estimado, getTotalDespesasFixas, totalMaoDeObra]);

  // Atualizar o estado quando o valor calculado mudar
  useEffect(() => {
    setConfigGeral(prev => ({
      ...prev,
      despesas_fixas: percentualDespesasFixasCalculado
    }));
  }, [percentualDespesasFixasCalculado]);

  useEffect(() => {
    const loadConfig = async () => {
      if (!user) {
        return;
      }

      try {
      const { data, error } = await supabase
        .from('modelos_markup')
        .select('*')
        .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

      if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const item = data[0]; // Agora é um array, não objeto único
          setConfigGeral(prev => ({
            ...prev,
            faturamento_estimado: parseFloat(item.faturamento_estimado) || 0,
            taxa_cartao: parseFloat(item.taxa_cartao) || 0,
            taxa_imposto: parseFloat(item.taxa_imposto) || 0,
            investimento_mkt: parseFloat(item.investimento_mkt) || 0,
            reserva_operacional: parseFloat(item.reserva_operacional) || 0,
            lucro_desejado_acompanhamentos: parseFloat(item.lucro_desejado_acompanhamentos) || 0,
            reserva_operacional_acompanhamentos: parseFloat(item.reserva_operacional_acompanhamentos) || 0,
            valor_cupom_vd_acompanhamentos: parseFloat(item.valor_cupom_vd_acompanhamentos) || 0,
            valor_cupom_mkt_acompanhamentos: parseFloat(item.valor_cupom_mkt_acompanhamentos) || 0,
            lucro_desejado_bebidas_cervejas_e_chopp: parseFloat(item.lucro_desejado_bebidas_cervejas_e_chopp) || 0,
            reserva_operacional_bebidas_cervejas_e_chopp: parseFloat(item.reserva_operacional_bebidas_cervejas_e_chopp) || 0,
            valor_cupom_vd_bebidas_cervejas_e_chopp: parseFloat(item.valor_cupom_vd_bebidas_cervejas_e_chopp) || 0,
            valor_cupom_mkt_bebidas_cervejas_e_chopp: parseFloat(item.valor_cupom_mkt_bebidas_cervejas_e_chopp) || 0,
            lucro_desejado_bebidas_refrigerantes: parseFloat(item.lucro_desejado_bebidas_refrigerantes) || 0,
            reserva_operacional_bebidas_refrigerantes: parseFloat(item.reserva_operacional_bebidas_refrigerantes) || 0,
            valor_cupom_vd_bebidas_refrigerantes: parseFloat(item.valor_cupom_vd_bebidas_refrigerantes) || 0,
            valor_cupom_mkt_bebidas_refrigerantes: parseFloat(item.valor_cupom_mkt_bebidas_refrigerantes) || 0,
            lucro_desejado_bebidas_sucos: parseFloat(item.lucro_desejado_bebidas_sucos) || 0,
            reserva_operacional_bebidas_sucos: parseFloat(item.reserva_operacional_bebidas_sucos) || 0,
            valor_cupom_vd_bebidas_sucos: parseFloat(item.valor_cupom_vd_bebidas_sucos) || 0,
            valor_cupom_mkt_bebidas_sucos: parseFloat(item.valor_cupom_mkt_bebidas_sucos) || 0,
            lucro_desejado_combo_lanches_carne_angus: parseFloat(item.lucro_desejado_combo_lanches_carne_angus) || 0,
            reserva_operacional_combo_lanches_carne_angus: parseFloat(item.reserva_operacional_combo_lanches_carne_angus) || 0,
            valor_cupom_vd_combo_lanches_carne_angus: parseFloat(item.valor_cupom_vd_combo_lanches_carne_angus) || 0,
            valor_cupom_mkt_combo_lanches_carne_angus: parseFloat(item.valor_cupom_mkt_combo_lanches_carne_angus) || 0,
            lucro_desejado_combo_lanches_frango: parseFloat(item.lucro_desejado_combo_lanches_frango) || 0,
            reserva_operacional_combo_lanches_frango: parseFloat(item.reserva_operacional_combo_lanches_frango) || 0,
            valor_cupom_vd_combo_lanches_frango: parseFloat(item.valor_cupom_vd_combo_lanches_frango) || 0,
            valor_cupom_mkt_combo_lanches_frango: parseFloat(item.valor_cupom_mkt_combo_lanches_frango) || 0,
            lucro_desejado_frango_americano: parseFloat(item.lucro_desejado_frango_americano) || 0,
            reserva_operacional_frango_americano: parseFloat(item.reserva_operacional_frango_americano) || 0,
            valor_cupom_vd_frango_americano: parseFloat(item.valor_cupom_vd_frango_americano) || 0,
            valor_cupom_mkt_frango_americano: parseFloat(item.valor_cupom_mkt_frango_americano) || 0,
            lucro_desejado_jumbos: parseFloat(item.lucro_desejado_jumbos) || 0,
            reserva_operacional_jumbos: parseFloat(item.reserva_operacional_jumbos) || 0,
            valor_cupom_vd_jumbos: parseFloat(item.valor_cupom_vd_jumbos) || 0,
            valor_cupom_mkt_jumbos: parseFloat(item.valor_cupom_mkt_jumbos) || 0,
            lucro_desejado_lanches: parseFloat(item.lucro_desejado_lanches) || 0,
            reserva_operacional_lanches: parseFloat(item.reserva_operacional_lanches) || 0,
            valor_cupom_vd_lanches: parseFloat(item.valor_cupom_vd_lanches) || 0,
            valor_cupom_mkt_lanches: parseFloat(item.valor_cupom_mkt_lanches) || 0,
            lucro_desejado_molhos: parseFloat(item.lucro_desejado_molhos) || 0,
            reserva_operacional_molhos: parseFloat(item.reserva_operacional_molhos) || 0,
            valor_cupom_vd_molhos: parseFloat(item.valor_cupom_vd_molhos) || 0,
            valor_cupom_mkt_molhos: parseFloat(item.valor_cupom_mkt_molhos) || 0,
            lucro_desejado_promocoes: parseFloat(item.lucro_desejado_promocoes) || 0,
            reserva_operacional_promocoes: parseFloat(item.reserva_operacional_promocoes) || 0,
            valor_cupom_vd_promocoes: parseFloat(item.valor_cupom_vd_promocoes) || 0,
            valor_cupom_mkt_promocoes: parseFloat(item.valor_cupom_mkt_promocoes) || 0,
            lucro_desejado_saladas: parseFloat(item.lucro_desejado_saladas) || 0,
            reserva_operacional_saladas: parseFloat(item.reserva_operacional_saladas) || 0,
            valor_cupom_vd_saladas: parseFloat(item.valor_cupom_vd_saladas) || 0,
            valor_cupom_mkt_saladas: parseFloat(item.valor_cupom_mkt_saladas) || 0,
            lucro_desejado_sobremesas: parseFloat(item.lucro_desejado_sobremesas) || 0,
            reserva_operacional_sobremesas: parseFloat(item.reserva_operacional_sobremesas) || 0,
            valor_cupom_vd_sobremesas: parseFloat(item.valor_cupom_vd_sobremesas) || 0,
            valor_cupom_mkt_sobremesas: parseFloat(item.valor_cupom_mkt_sobremesas) || 0,
            lucro_desejado_zapbox: parseFloat(item.lucro_desejado_zapbox) || 0,
            reserva_operacional_zapbox: parseFloat(item.reserva_operacional_zapbox) || 0,
            valor_cupom_vd_zapbox: parseFloat(item.valor_cupom_vd_zapbox) || 0,
            valor_cupom_mkt_zapbox: parseFloat(item.valor_cupom_mkt_zapbox) || 0,
          }));

          // Converter campos individuais para o formato antigo de categorias
          const categoriasIniciais = CATEGORIAS_FIXAS.map(cat => {
            const categoriaKey = getCategoriaKey(cat.categoria);
            const lucroField = `lucro_desejado_${categoriaKey}`;
            const reservaField = `reserva_operacional_${categoriaKey}`;
            const cupomVdField = `valor_cupom_vd_${categoriaKey}`;
            const cupomMktField = `valor_cupom_mkt_${categoriaKey}`;
            return {
              categoria: cat.categoria,
              investimentoMkt: parseFloat(item[lucroField]) || 0,
              reservaOperacional: parseFloat(item[reservaField]) || 0,
              valorCupomVd: parseFloat(item[cupomVdField]) || 0,
              valorCupomMkt: parseFloat(item[cupomMktField]) || 0,
            };
          });
          setValoresPorCategoria(categoriasIniciais);
        } else {
          // Se não houver configuração no banco, use os padrões
          const categoriasIniciais = CATEGORIAS_FIXAS.map(cat => ({
            categoria: cat.categoria,
            investimentoMkt: 0,
            reservaOperacional: 0,
            valorCupomVd: 0,
            valorCupomMkt: 0,
          }));
          setValoresPorCategoria(categoriasIniciais);
        }
      } catch (err) {
        console.error('Erro ao carregar configuração:', err);
        // Em caso de erro, ainda assim carregue os padrões
        const categoriasIniciais = CATEGORIAS_FIXAS.map(cat => ({
          categoria: cat.categoria,
          investimentoMkt: 0,
          reservaOperacional: 0,
          valorCupomVd: 0,
          valorCupomMkt: 0,
        }));
        setValoresPorCategoria(categoriasIniciais);
      }
    };

    loadConfig();
  }, [user]);

  // Mapeamento correto entre categorias e nomes das colunas
  const getCategoriaKey = (categoria: string): string => {
    const mapping: { [key: string]: string } = {
      'ACOMPANHAMENTOS': 'acompanhamentos',
      'BEBIDAS CERVEJAS E CHOPP': 'bebidas_cervejas_e_chopp',
      'BEBIDAS REFRIGERANTES': 'bebidas_refrigerantes',
      'BEBIDAS SUCOS': 'bebidas_sucos',
      'COMBO LANCHES CARNE ANGUS': 'combo_lanches_carne_angus',
      'COMBO LANCHES FRANGO': 'combo_lanches_frango',
      'FRANGO AMERICANO': 'frango_americano',
      'JUMBOS (COMBINADOS GRANDES)': 'jumbos',
      'LANCHES': 'lanches',
      'MOLHOS': 'molhos',
      'PROMOÇÕES': 'promocoes',
      'SALADAS': 'saladas',
      'SOBREMESAS': 'sobremesas',
      'ZAPBOX (COMBINADOS INDIVIDUAIS)': 'zapbox',
    };
    return mapping[categoria] || categoria.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
  };

  const updateCategoria = (categoria: string, field: 'investimentoMkt' | 'reservaOperacional' | 'valorCupomVd' | 'valorCupomMkt', value: number) => {
    setValoresPorCategoria(prev => 
      prev.map(cat => 
        cat.categoria === categoria 
          ? { ...cat, [field]: value }
          : cat
      )
    );

    // Atualizar também o configGeral com o campo individual correspondente
    const categoriaKey = getCategoriaKey(categoria);
    let fieldKey: string;
    
    if (field === 'investimentoMkt') {
      fieldKey = `investimento_mkt_${categoriaKey}`;
    } else if (field === 'reservaOperacional') {
      fieldKey = `reserva_operacional_${categoriaKey}`;
    } else if (field === 'valorCupomVd') {
      fieldKey = `valor_cupom_vd_${categoriaKey}`;
    } else if (field === 'valorCupomMkt') {
      fieldKey = `valor_cupom_mkt_${categoriaKey}`;
    } else {
      return; // Campo não reconhecido
    }
    
    setConfigGeral(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      console.log('=== INICIANDO SALVAMENTO ===');
      console.log('User ID:', user.id);
      console.log('Config Geral:', configGeral);
      console.log('Valores por Categoria:', valoresPorCategoria);

      // Salvar na tabela config_markup_geral
      const { data: configData, error: configError } = await supabase
        .from('config_markup_geral')
        .upsert({
          user_id: user.id,
          faturamento_estimado_mensal: configGeral.faturamento_estimado,
          impostos_faturamento: configGeral.taxa_imposto,
          taxa_cartao: configGeral.taxa_cartao,
          investimento_mkt: configGeral.investimento_mkt,
          reserva_operacional: configGeral.reserva_operacional,
          despesas_fixas: configGeral.despesas_fixas,
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (configError) {
        console.error('Erro ao salvar config geral:', configError);
        throw configError;
      }

      console.log('Config geral salva com sucesso:', configData);

      // Salvar categorias na tabela config_markup_categoria
      const categoriaPromises = valoresPorCategoria.map(cat => {
        const categoriaKey = getCategoriaKey(cat.categoria);
        return supabase
          .from('config_markup_categoria')
          .upsert({
            categoria: categoriaKey,
            investimento_mkt: cat.investimentoMkt,
            reserva_operacional: cat.reservaOperacional,
            user_id: user.id,
        }, {
          onConflict: 'categoria'
        });
      });

      const categoriaResults = await Promise.all(categoriaPromises);
      const categoriaErrors = categoriaResults.filter(result => result.error);
      
      if (categoriaErrors.length > 0) {
        console.error('Erro ao salvar categorias:', categoriaErrors[0].error);
        throw categoriaErrors[0].error;
      }

      console.log('Categorias salvas com sucesso');
      const data = configData;

      alert('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração: ' + (error instanceof Error ? error.message : 'Desconhecido'));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuração de Markup</h1>
            <p className="text-muted-foreground">
              Configure as margens e taxas para cálculo automático de preços
            </p>
          </div>
          <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
            Salvar Configuração
                    </Button>
        </div>

        {/* 1. Bloco: Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="faturamento">Faturamento Estimado Mensal (R$)</Label>
                  <Input
                    id="faturamento"
                    type="number"
                  value={configGeral.faturamento_estimado}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    faturamento_estimado: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Ex: 50000"
                  />
                </div>
                <div className="space-y-2">
                <Label htmlFor="taxa-cartao">Taxa de Cartão (%)</Label>
                  <Input
                  id="taxa-cartao"
                    type="number"
                    step="0.1"
                  value={configGeral.taxa_cartao}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    taxa_cartao: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Ex: 4.5"
                />
              </div>
                <div className="space-y-2">
                <Label htmlFor="taxa-imposto">Taxa de Impostos (%)</Label>
                  <Input
                  id="taxa-imposto"
                    type="number"
                    step="0.1"
                  value={configGeral.taxa_imposto}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    taxa_imposto: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Ex: 4.0"
                  />
                </div>
                <div className="space-y-2">
                <Label htmlFor="investimento-mkt">Investimento MKT (%)</Label>
                  <Input
                  id="investimento-mkt"
                    type="number"
                    step="0.1"
                  value={configGeral.investimento_mkt}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    investimento_mkt: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Ex: 15.0"
                />
              </div>
            <div className="space-y-2">
                <Label htmlFor="reserva-operacional">Reserva Operacional (%)</Label>
                <Input
                  id="reserva-operacional"
                  type="number"
                  step="0.1"
                  value={configGeral.reserva_operacional}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    reserva_operacional: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Ex: 5.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="despesas-fixas">Despesas Fixas (%)</Label>
                <Input
                  id="despesas-fixas"
                  type="number"
                  step="0.1"
                  value={configGeral.despesas_fixas}
                  readOnly
                  className="bg-muted"
                  placeholder="Calculado automaticamente"
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente: (Despesas Fixas + Mão de Obra) ÷ Faturamento Estimado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Bloco: Canais de Venda */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Canais de Venda
              </CardTitle>
              <Button 
                onClick={() => {
                  const nome = prompt('Nome do canal:');
                  if (nome) {
                    adicionarCanalVenda({
                      nome,
                      taxa_marketplace: 0,
                      taxa_antecipacao: 0,
                      ativo: true
                    } as any);
                  }
                }}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Canal
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure as taxas de marketplace e antecipação para cada canal de venda
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead>Taxa Marketplace (%)</TableHead>
                  <TableHead>Taxa Antecipação (%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {canaisVenda.map((canal) => (
                  <TableRow key={canal.id}>
                    <TableCell className="font-medium">{canal.nome}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={canal.taxa_marketplace}
                        onChange={(e) => atualizarCanalVenda(canal.id!, {
                          ...canal,
                          taxa_marketplace: parseFloat(e.target.value) || 0
                        })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={canal.taxa_antecipacao}
                        onChange={(e) => atualizarCanalVenda(canal.id!, {
                          ...canal,
                          taxa_antecipacao: parseFloat(e.target.value) || 0
                        })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={canal.ativo ? "default" : "secondary"}>
                        {canal.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarCanalVenda(canal.id!, {
                            ...canal,
                            ativo: !canal.ativo
                          })}
                        >
                          {canal.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja remover o canal "${canal.nome}"?`)) {
                              removerCanalVenda(canal.id!);
                            }
                          }}
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Configurações por Categoria
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Taxa de Marcação calculada pela fórmula: 100% / (100% - soma(Taxa de Impostos (%) + Investimento MKT (%) + Taxa de Cartão (%) + Despesas Fixas (%) + Reserva Operacional (%) + Categoria % Investimento MKT + Categoria % Reserva Operacional)). 
              Os valores de cupons serão acrescidos ao preço final (não incluídos na taxa percentual).
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>% Investimento MKT</TableHead>
                  <TableHead>% Reserva Operacional</TableHead>
                  <TableHead>Valor Cupom VD (R$)</TableHead>
                  <TableHead>Valor Cupom MKT (R$)</TableHead>
                  <TableHead>Taxa de Marcação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORIAS_FIXAS.map((categoria) => {
                  const valor = valoresPorCategoria.find(v => v.categoria === categoria.categoria);
                  const investimentoAtual = valor?.investimentoMkt || 0;
                  const reservaAtual = valor?.reservaOperacional || 0;
                  
                  // Calcular taxa de marcação usando a nova fórmula
                  // 100% / (100% - soma(Taxa de Impostos (%) + Investimento MKT (%) + Taxa de Cartão (%) + Despesas Fixas (%) + Reserva Operacional (%) + Categoria % Investimento MKT + Categoria % Reserva Operacional))
                  
                  const taxaImposto = configGeral.taxa_imposto || 0;
                  const investimentoMktGeral = configGeral.investimento_mkt || 0;
                  const taxaCartao = configGeral.taxa_cartao || 0;
                  const despesasFixas = configGeral.despesas_fixas || 0;
                  const reservaOperacionalGeral = configGeral.reserva_operacional || 0;
                  
                  const percentualTotal = taxaImposto + investimentoMktGeral + taxaCartao + despesasFixas + reservaOperacionalGeral + investimentoAtual + reservaAtual;
                  
                  // Se o percentual total for >= 100%, a taxa de marcação é infinita
                  if (percentualTotal >= 100) {
                    var taxaMarcacao = Infinity;
                  } else {
                    // Nova fórmula: 100% / (100% - percentualTotal)
                    const denominador = 100 - percentualTotal;
                    const taxaBruta = 100 / denominador;
                    taxaMarcacao = (taxaBruta - 1) * 100;
                  }
                  
                  return (
                    <TableRow key={categoria.categoria}>
                      <TableCell className="font-medium">{categoria.label}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={investimentoAtual}
                          onChange={(e) => updateCategoria(
                            categoria.categoria, 
                            'investimentoMkt', 
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={reservaAtual}
                          onChange={(e) => updateCategoria(
                            categoria.categoria, 
                            'reservaOperacional', 
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={valor?.valorCupomVd || 0}
                          onChange={(e) => updateCategoria(
                            categoria.categoria, 
                            'valorCupomVd', 
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={valor?.valorCupomMkt || 0}
                          onChange={(e) => updateCategoria(
                            categoria.categoria, 
                            'valorCupomMkt', 
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {taxaMarcacao === Infinity ? '∞' : `${taxaMarcacao.toFixed(1)}%`}
                          </span>
                          {(taxaMarcacao === Infinity || taxaMarcacao >= 100) && (
                            <span className="text-xs text-red-500">⚠️</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}