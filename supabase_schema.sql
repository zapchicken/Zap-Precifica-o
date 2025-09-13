-- =====================================================
-- SCHEMA COMPLETO DO SUPABASE PARA ZAPPRICE
-- Baseado no arquivo: Supabase Snippet Database Schema Explorer.csv
-- =====================================================

-- =====================================================
-- 1. TABELA DE FORNECEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social CHARACTER VARYING NOT NULL,
  pessoa_contato CHARACTER VARYING NULL,
  telefone CHARACTER VARYING NULL,
  status CHARACTER VARYING NULL DEFAULT 'ativo',
  condicoes_pagamento TEXT NULL,
  observacoes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  user_id UUID NULL
);

-- =====================================================
-- 2. TABELA DE INSUMOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_insumo TEXT NULL,
  fornecedor_id UUID NULL REFERENCES public.fornecedores(id),
  categoria TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  tipo_embalagem TEXT NULL,
  preco_por_unidade NUMERIC NOT NULL,
  fator_correcao NUMERIC NULL DEFAULT 1.00,
  quantidade_minima_compra INTEGER NULL DEFAULT 0,
  ultima_compra DATE NULL,
  quantidade_comprar INTEGER NULL DEFAULT 0,
  deposito TEXT NULL,
  observacoes TEXT NULL,
  ativo BOOLEAN NULL DEFAULT true,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. TABELA DE BASES (PRODUTOS INTERMEDIÁRIOS)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  tipo_produto TEXT NOT NULL,
  quantidade_total NUMERIC NULL DEFAULT 0,
  unidade_produto TEXT NULL DEFAULT 'kg',
  custo_total_batelada NUMERIC NULL DEFAULT 0,
  custo_por_kg NUMERIC NULL,
  custo_por_unidade NUMERIC NULL,
  rendimento TEXT NULL,
  tempo_preparo INTEGER NULL,
  data_ficha DATE NULL DEFAULT CURRENT_DATE,
  foto TEXT NULL,
  modo_preparo TEXT NULL,
  observacoes TEXT NULL,
  ativo BOOLEAN NULL DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
);

-- =====================================================
-- 4. TABELA DE FICHAS TÉCNICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fichas_tecnicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome CHARACTER VARYING NOT NULL,
  codigo CHARACTER VARYING NULL,
  descricao TEXT NULL,
  categoria CHARACTER VARYING NULL,
  tipo_produto CHARACTER VARYING NULL,
  rendimento NUMERIC NULL,
  unidade_rendimento CHARACTER VARYING NULL,
  tempo_preparo INTEGER NULL,
  modo_preparo TEXT NULL,
  custo_total_producao NUMERIC NULL,
  custo_por_unidade NUMERIC NULL,
  preco_sugerido NUMERIC NULL,
  margem_contribuicao NUMERIC NULL,
  observacoes TEXT NULL,
  foto TEXT NULL,
  data_ficha DATE NULL DEFAULT CURRENT_DATE,
  ativo BOOLEAN NULL DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 5. TABELA DE RELACIONAMENTO: BASES + INSUMOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bases_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id UUID NOT NULL REFERENCES public.bases(id),
  insumo_id UUID NOT NULL REFERENCES public.insumos(id),
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  custo NUMERIC NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
);

-- =====================================================
-- 6. TABELA DE RELACIONAMENTO: FICHAS + INSUMOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fichas_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NOT NULL REFERENCES public.fichas_tecnicas(id),
  insumo_id UUID NOT NULL REFERENCES public.insumos(id),
  quantidade NUMERIC NOT NULL,
  unidade CHARACTER VARYING NOT NULL,
  custo_unitario NUMERIC NULL,
  custo_total NUMERIC NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 7. TABELA DE RELACIONAMENTO: FICHAS + BASES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fichas_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NOT NULL REFERENCES public.fichas_tecnicas(id),
  base_id UUID NOT NULL REFERENCES public.bases(id),
  quantidade NUMERIC NOT NULL,
  unidade CHARACTER VARYING NOT NULL,
  custo_unitario NUMERIC NULL,
  custo_total NUMERIC NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 8. TABELA DE PRODUTOS DE VENDA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_pdv TEXT NULL,
  descricao TEXT NULL,
  categoria TEXT NULL,
  preco_custo NUMERIC NULL DEFAULT 0,
  preco_venda NUMERIC NOT NULL,
  margem_lucro NUMERIC NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  observacoes TEXT NULL,
  origem TEXT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'ficha_tecnica', 'importacao')),
  ficha_tecnica_id UUID NULL REFERENCES public.fichas_tecnicas(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABELA DE DESPESAS FIXAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.despesas_fixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  frequencia TEXT NOT NULL CHECK (frequencia IN ('mensal', 'anual', 'semanal', 'quinzenal')),
  data_vencimento DATE NULL,
  dia_vencimento INTEGER NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  observacoes TEXT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TABELA DE EMBALAGENS PARA DELIVERY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insumos_embalagem_delivery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NULL REFERENCES public.fichas_tecnicas(id),
  nome TEXT NOT NULL,
  codigo TEXT NULL,
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL
);

-- =====================================================
-- 11. TABELA DE PROLABORE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.prolabore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_socio TEXT NOT NULL,
  valor_mensal NUMERIC NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABELA DE FUNCIONÁRIOS CLT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.funcionarios_clt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  salario_bruto NUMERIC NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  vale_transporte NUMERIC DEFAULT 0,
  vale_refeicao_por_dia NUMERIC DEFAULT 0,
  vale_refeicao_mensal NUMERIC DEFAULT 0,
  plano_saude NUMERIC DEFAULT 0,
  seguro_vida NUMERIC DEFAULT 0,
  treinamento NUMERIC DEFAULT 0,
  uniformes NUMERIC DEFAULT 0,
  outros_beneficios NUMERIC DEFAULT 0,
  horas_extras NUMERIC DEFAULT 0,
  horas_noturnas_por_dia NUMERIC DEFAULT 0,
  dias_semana INTEGER DEFAULT 6,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. TABELA DE FREELANCERS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao TEXT NOT NULL,
  valor_diaria NUMERIC NOT NULL,
  quantidade_pessoas INTEGER NOT NULL DEFAULT 1,
  dias_mes INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bases_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos_embalagem_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prolabore ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios_clt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. POLÍTICAS RLS PARA PRODUTOS
-- =====================================================
CREATE POLICY "Users can view own produtos" ON public.produtos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own produtos" ON public.produtos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own produtos" ON public.produtos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own produtos" ON public.produtos
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 12. POLÍTICAS RLS PARA DESPESAS FIXAS
-- =====================================================
CREATE POLICY "Users can view own despesas_fixas" ON public.despesas_fixas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own despesas_fixas" ON public.despesas_fixas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own despesas_fixas" ON public.despesas_fixas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own despesas_fixas" ON public.despesas_fixas
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 13. POLÍTICAS RLS PARA FORNECEDORES
-- =====================================================
CREATE POLICY "Users can view own fornecedores" ON public.fornecedores
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own fornecedores" ON public.fornecedores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fornecedores" ON public.fornecedores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fornecedores" ON public.fornecedores
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 13. POLÍTICAS RLS PARA INSUMOS
-- =====================================================
CREATE POLICY "Users can view own insumos" ON public.insumos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insumos" ON public.insumos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insumos" ON public.insumos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insumos" ON public.insumos
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 14. POLÍTICAS RLS PARA BASES
-- =====================================================
CREATE POLICY "Users can view own bases" ON public.bases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bases" ON public.bases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bases" ON public.bases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bases" ON public.bases
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 15. POLÍTICAS RLS PARA FICHAS TÉCNICAS
-- =====================================================
CREATE POLICY "Users can view own fichas_tecnicas" ON public.fichas_tecnicas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fichas_tecnicas" ON public.fichas_tecnicas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fichas_tecnicas" ON public.fichas_tecnicas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fichas_tecnicas" ON public.fichas_tecnicas
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 16. POLÍTICAS RLS PARA TABELAS DE RELACIONAMENTO
-- =====================================================
CREATE POLICY "Users can view own bases_insumos" ON public.bases_insumos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bases_insumos" ON public.bases_insumos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bases_insumos" ON public.bases_insumos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bases_insumos" ON public.bases_insumos
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own fichas_insumos" ON public.fichas_insumos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fichas_insumos" ON public.fichas_insumos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fichas_insumos" ON public.fichas_insumos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fichas_insumos" ON public.fichas_insumos
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own fichas_bases" ON public.fichas_bases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fichas_bases" ON public.fichas_bases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fichas_bases" ON public.fichas_bases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fichas_bases" ON public.fichas_bases
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 17. POLÍTICAS RLS PARA EMBALAGENS
-- =====================================================
CREATE POLICY "Users can view own embalagens" ON public.insumos_embalagem_delivery
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own embalagens" ON public.insumos_embalagem_delivery
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own embalagens" ON public.insumos_embalagem_delivery
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own embalagens" ON public.insumos_embalagem_delivery
  FOR DELETE USING (true);

-- =====================================================
-- 18. POLÍTICAS RLS PARA PROLABORE
-- =====================================================
CREATE POLICY "Users can view own prolabore" ON public.prolabore
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prolabore" ON public.prolabore
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prolabore" ON public.prolabore
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prolabore" ON public.prolabore
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 19. POLÍTICAS RLS PARA FUNCIONÁRIOS CLT
-- =====================================================
CREATE POLICY "Users can view own funcionarios_clt" ON public.funcionarios_clt
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funcionarios_clt" ON public.funcionarios_clt
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funcionarios_clt" ON public.funcionarios_clt
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own funcionarios_clt" ON public.funcionarios_clt
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 20. POLÍTICAS RLS PARA FREELANCERS
-- =====================================================
CREATE POLICY "Users can view own freelancers" ON public.freelancers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freelancers" ON public.freelancers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own freelancers" ON public.freelancers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own freelancers" ON public.freelancers
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 21. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON public.fornecedores(user_id);
CREATE INDEX IF NOT EXISTS idx_insumos_user_id ON public.insumos(user_id);
CREATE INDEX IF NOT EXISTS idx_insumos_fornecedor_id ON public.insumos(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_bases_user_id ON public.bases(user_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_user_id ON public.fichas_tecnicas(user_id);
CREATE INDEX IF NOT EXISTS idx_bases_insumos_user_id ON public.bases_insumos(user_id);
CREATE INDEX IF NOT EXISTS idx_fichas_insumos_user_id ON public.fichas_insumos(user_id);
CREATE INDEX IF NOT EXISTS idx_fichas_bases_user_id ON public.fichas_bases(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON public.produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_fixas_user_id ON public.despesas_fixas(user_id);
CREATE INDEX IF NOT EXISTS idx_prolabore_user_id ON public.prolabore(user_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_clt_user_id ON public.funcionarios_clt(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancers_user_id ON public.freelancers(user_id);

-- =====================================================
-- 22. COMENTÁRIOS NAS TABELAS
-- =====================================================
COMMENT ON TABLE public.fornecedores IS 'Cadastro de fornecedores de insumos';
COMMENT ON TABLE public.insumos IS 'Cadastro de insumos e matérias-primas';
COMMENT ON TABLE public.bases IS 'Produtos intermediários usados em receitas';
COMMENT ON TABLE public.fichas_tecnicas IS 'Fichas técnicas dos produtos finais';
COMMENT ON TABLE public.bases_insumos IS 'Relacionamento entre bases e insumos';
COMMENT ON TABLE public.fichas_insumos IS 'Relacionamento entre fichas e insumos';
COMMENT ON TABLE public.fichas_bases IS 'Relacionamento entre fichas e bases';
COMMENT ON TABLE public.insumos_embalagem_delivery IS 'Embalagens para delivery';
COMMENT ON TABLE public.produtos IS 'Produtos de venda do catálogo';
COMMENT ON TABLE public.despesas_fixas IS 'Despesas fixas e recorrentes do negócio';
COMMENT ON TABLE public.prolabore IS 'Prolabore dos sócios da empresa';
COMMENT ON TABLE public.funcionarios_clt IS 'Funcionários CLT com todos os encargos e benefícios';
COMMENT ON TABLE public.freelancers IS 'Freelancers e prestadores de serviços';

-- =====================================================
-- 23. TABELAS PARA CONFIGURAÇÃO DE MARKUP
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
-- 24. HABILITAR RLS PARA TABELAS DE MARKUP
-- =====================================================
ALTER TABLE public.config_markup_geral ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canais_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_markup_categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_markup ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 25. POLÍTICAS RLS PARA TABELAS DE MARKUP
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
-- 26. ÍNDICES PARA TABELAS DE MARKUP
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_config_markup_geral_user_id ON public.config_markup_geral(user_id);
CREATE INDEX IF NOT EXISTS idx_canais_venda_user_id ON public.canais_venda(user_id);
CREATE INDEX IF NOT EXISTS idx_config_markup_categoria_user_id ON public.config_markup_categoria(user_id);
CREATE INDEX IF NOT EXISTS idx_modelos_markup_user_id ON public.modelos_markup(user_id);

-- =====================================================
-- 27. COMENTÁRIOS PARA TABELAS DE MARKUP
-- =====================================================
COMMENT ON TABLE public.config_markup_geral IS 'Configurações gerais para cálculo de markup';
COMMENT ON TABLE public.canais_venda IS 'Canais de venda com suas respectivas taxas';
COMMENT ON TABLE public.config_markup_categoria IS 'Configurações de lucro e reserva por categoria';
COMMENT ON TABLE public.modelos_markup IS 'Modelos de configuração de markup salvos';

-- =====================================================
-- 28. DADOS INICIAIS PARA CANAIS DE VENDA
-- =====================================================
-- Inserir canais padrão (será executado apenas se não existirem)
INSERT INTO public.canais_venda (nome, taxa_marketplace, taxa_antecipacao, user_id)
SELECT 'Venda Direta', 0, 0, auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM public.canais_venda 
  WHERE nome = 'Venda Direta' AND user_id = auth.uid()
);

INSERT INTO public.canais_venda (nome, taxa_marketplace, taxa_antecipacao, user_id)
SELECT 'iFood', 12, 0, auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM public.canais_venda 
  WHERE nome = 'iFood' AND user_id = auth.uid()
);

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
