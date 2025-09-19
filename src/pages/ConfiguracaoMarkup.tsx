import { useState, useEffect } from "react"
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

type ConfigGeral = {
  faturamentoEstimado: number;
  taxaCartao: number;
  taxaImposto: number;
  lucroDesejado: number;
  reservaOperacional: number;
};

export default function ConfiguracaoMarkup() {
  const { user } = useAuth();
  const [configGeral, setConfigGeral] = useState<ConfigGeral>({
    faturamentoEstimado: 0,
    taxaCartao: 4,
    taxaImposto: 4,
    lucroDesejado: 15,
    reservaOperacional: 5,
  });

  const [valoresPorCategoria, setValoresPorCategoria] = useState<CategoriaValor[]>([]);

  // Carregar configuração do Supabase
  useEffect(() => {
    const loadConfig = async () => {
      if (!user) {
        console.log('Usuário não autenticado, pulando carregamento de configuração');
        return;
      }

      console.log('Carregando configuração para usuário:', user.id);

      // TEMPORÁRIO: Desabilitar consulta ao Supabase devido ao erro 406
      // TODO: Resolver problema de RLS no Supabase
      console.log('Usando configuração padrão (consulta ao Supabase temporariamente desabilitada)');
      
      // Inicializar com categorias padrão
      const categoriasIniciais = CATEGORIAS_FIXAS.map(cat => ({
        categoria: cat.categoria,
        lucroDesejado: 15,
        reservaOperacional: 5,
      }));
      setValoresPorCategoria(categoriasIniciais);
      return;

      /* CÓDIGO TEMPORARIAMENTE DESABILITADO - PROBLEMA DE RLS NO SUPABASE
      // ✅ PASSO 1: Comece com as categorias fixas e valores padrão
      const categoriasPadrao = CATEGORIAS_FIXAS.map(categoria => ({
        categoria: categoria.categoria,
        lucroDesejado: 15,     // ← valor padrão
        reservaOperacional: 5, // ← valor padrão
      }));

      // ✅ PASSO 2: Se houver dados salvos no Supabase, sobrescreva os valores padrão
      if (data && data.config_categorias && data.config_categorias.length > 0) {
        // Cria um mapa das categorias salvas
        const salvosMap = new Map(
          data.config_categorias.map(item => [item.categoria, item])
        );
        
        // Atualiza cada categoria padrão com o valor salvo, se existir
        const categoriasComValores = categoriasPadrao.map(categoria => {
          const salvo = salvosMap.get(categoria.categoria) as any;
          if (salvo) {
            return {
              ...categoria,
              lucroDesejado: salvo.lucroDesejado,
              reservaOperacional: salvo.reservaOperacional,
            };
          }
          return categoria; // mantém o padrão
        });
        
        setValoresPorCategoria(categoriasComValores);
      } else {
        // Se não tiver nada no banco, usa os padrões
        setValoresPorCategoria(categoriasPadrao);
      }

      // ✅ PASSO 3: Carrega config_geral normalmente
      if (data) {
        setConfigGeral({
          faturamentoEstimado: data.config_geral?.faturamento_estimado || 0,
          taxaCartao: data.config_geral?.taxa_cartao || 4,
          taxaImposto: data.config_geral?.taxa_imposto || 4,
          lucroDesejado: data.config_geral?.lucro_desejado || 15,
          reservaOperacional: data.config_geral?.reserva_operacional || 5,
        });
      }
      */
    };

    loadConfig();
  }, [user]);

  const updateCategoria = (categoria: string, field: 'lucroDesejado' | 'reservaOperacional', value: number) => {
    setValoresPorCategoria(prev => 
      prev.map(cat => 
        cat.categoria === categoria 
          ? { ...cat, [field]: value }
          : cat
      )
    );
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      // Verificar se já existe um registro
      const { data: existingData } = await supabase
        .from('modelos_markup')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const configData = {
        user_id: user.id,
        nome: 'Configuração Padrão',
        config_geral: {
          faturamento_estimado: configGeral.faturamentoEstimado,
          taxa_cartao: configGeral.taxaCartao,
          taxa_imposto: configGeral.taxaImposto,
          lucro_desejado: configGeral.lucroDesejado,
          reserva_operacional: configGeral.reservaOperacional,
        },
        canais_venda: [],
        config_categorias: valoresPorCategoria,
      };

      let data, error;

      if (existingData) {
        // Atualizar registro existente
        const { data: updateData, error: updateError } = await supabase
          .from('modelos_markup')
          .update(configData)
          .eq('user_id', user.id)
          .select();
        data = updateData;
        error = updateError;
      } else {
        // Inserir novo registro
        const { data: insertData, error: insertError } = await supabase
          .from('modelos_markup')
          .insert(configData)
          .select();
        data = insertData;
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar configuração:', error);
        alert('Erro ao salvar configuração');
        return;
      }

      console.log('✅ Configuração salva:', {
        config_geral: configData.config_geral,
        config_categorias: configData.config_categorias
      });
      console.log('🔍 Array completo:', JSON.stringify(configData.config_categorias, null, 2));
      alert('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
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
                  value={configGeral.faturamentoEstimado}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    faturamentoEstimado: parseFloat(e.target.value) || 0
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
                  value={configGeral.taxaCartao}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    taxaCartao: parseFloat(e.target.value) || 0
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
                  value={configGeral.taxaImposto}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    taxaImposto: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Ex: 4.0"
                  />
                </div>
                <div className="space-y-2">
                <Label htmlFor="lucro-desejado">Lucro Desejado (%)</Label>
                  <Input
                  id="lucro-desejado"
                    type="number"
                    step="0.1"
                  value={configGeral.lucroDesejado}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    lucroDesejado: parseFloat(e.target.value) || 0
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
                  value={configGeral.reservaOperacional}
                  onChange={(e) => setConfigGeral(prev => ({
                    ...prev,
                    reservaOperacional: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Ex: 5.0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Bloco: Configurações por Categoria */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Configurações por Categoria
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>% Lucro Desejado</TableHead>
                  <TableHead>% Reserva Operacional</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORIAS_FIXAS.map((categoria) => {
                  const valor = valoresPorCategoria.find(v => v.categoria === categoria.categoria);
                  const lucroAtual = valor?.lucroDesejado || 0;
                  const reservaAtual = valor?.reservaOperacional || 0;
                  
                  return (
                    <TableRow key={categoria.categoria}>
                      <TableCell className="font-medium">{categoria.label}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={lucroAtual}
                          onChange={(e) => updateCategoria(
                            categoria.categoria, 
                            'lucroDesejado', 
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