-- =====================================================
-- TABELAS PARA CONFIGURAÇÃO DE MARKUP (VERSÃO CORRIGIDA)
-- =====================================================

-- Tabela de configurações gerais de markup
CREATE TABLE IF NOT EXISTS public.config_markup_geral (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faturamento_estimado_mensal NUMERIC NOT NULL DEFAULT 0,
  impostos_faturamento NUMERIC NOT NULL DEFAULT 0,
  taxa_cartao NUMERIC NOT NULL DEFAULT 0,
  outros_custos NUMERIC NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de canais de venda
CREATE TABLE IF NOT EXISTS public.canais_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  taxa_marketplace NUMERIC NOT NULL DEFAULT 0,
  taxa_antecipacao NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações por categoria
CREATE TABLE IF NOT EXISTS public.config_markup_categoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  lucro_desejado NUMERIC NOT NULL DEFAULT 0,
  reserva_operacional NUMERIC NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de modelos de markup salvos
CREATE TABLE IF NOT EXISTS public.modelos_markup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  config_geral JSONB NOT NULL,
  canais_venda JSONB NOT NULL,
  config_categorias JSONB NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HABILITAR RLS PARA TABELAS DE MARKUP
-- =====================================================
ALTER TABLE public.config_markup_geral ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canais_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_markup_categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_markup ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA TABELAS DE MARKUP
-- =====================================================

-- Configurações gerais
CREATE POLICY "Users can view own config_markup_geral" ON public.config_markup_geral
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config_markup_geral" ON public.config_markup_geral
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config_markup_geral" ON public.config_markup_geral
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own config_markup_geral" ON public.config_markup_geral
  FOR DELETE USING (auth.uid() = user_id);

-- Canais de venda
CREATE POLICY "Users can view own canais_venda" ON public.canais_venda
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own canais_venda" ON public.canais_venda
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canais_venda" ON public.canais_venda
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canais_venda" ON public.canais_venda
  FOR DELETE USING (auth.uid() = user_id);

-- Configurações por categoria
CREATE POLICY "Users can view own config_markup_categoria" ON public.config_markup_categoria
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config_markup_categoria" ON public.config_markup_categoria
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config_markup_categoria" ON public.config_markup_categoria
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own config_markup_categoria" ON public.config_markup_categoria
  FOR DELETE USING (auth.uid() = user_id);

-- Modelos de markup
CREATE POLICY "Users can view own modelos_markup" ON public.modelos_markup
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own modelos_markup" ON public.modelos_markup
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own modelos_markup" ON public.modelos_markup
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own modelos_markup" ON public.modelos_markup
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ÍNDICES PARA TABELAS DE MARKUP
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_config_markup_geral_user_id ON public.config_markup_geral(user_id);
CREATE INDEX IF NOT EXISTS idx_canais_venda_user_id ON public.canais_venda(user_id);
CREATE INDEX IF NOT EXISTS idx_config_markup_categoria_user_id ON public.config_markup_categoria(user_id);
CREATE INDEX IF NOT EXISTS idx_modelos_markup_user_id ON public.modelos_markup(user_id);

-- =====================================================
-- COMENTÁRIOS PARA TABELAS DE MARKUP
-- =====================================================
COMMENT ON TABLE public.config_markup_geral IS 'Configurações gerais para cálculo de markup';
COMMENT ON TABLE public.canais_venda IS 'Canais de venda com suas respectivas taxas';
COMMENT ON TABLE public.config_markup_categoria IS 'Configurações de lucro e reserva por categoria';
COMMENT ON TABLE public.modelos_markup IS 'Modelos de configuração de markup salvos';

-- =====================================================
-- FUNÇÃO PARA CRIAR CANAIS PADRÃO (EXECUTAR APÓS LOGIN)
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_channels()
RETURNS void AS $$
BEGIN
  -- Inserir canais padrão apenas se não existirem para o usuário atual
  INSERT INTO public.canais_venda (nome, taxa_marketplace, taxa_antecipacao, user_id)
  SELECT 'Venda Direta', 0, 0, auth.uid()
  WHERE auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.canais_venda 
      WHERE nome = 'Venda Direta' AND user_id = auth.uid()
    );

  INSERT INTO public.canais_venda (nome, taxa_marketplace, taxa_antecipacao, user_id)
  SELECT 'iFood', 12, 0, auth.uid()
  WHERE auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.canais_venda 
      WHERE nome = 'iFood' AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
