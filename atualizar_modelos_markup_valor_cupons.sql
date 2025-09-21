-- =====================================================
-- ADICIONAR COLUNAS DE VALOR CUPONS (VALOR FIXO EM REAIS) NA TABELA MODELOS_MARKUP
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Adicionar colunas de valor_cupons para cada categoria (valor fixo em reais)
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_acompanhamentos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_bebidas_cervejas_e_chopp NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_bebidas_refrigerantes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_bebidas_sucos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_combo_lanches_carne_angus NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_combo_lanches_frango NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_frango_americano NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_jumbos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_lanches NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_molhos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_promocoes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_saladas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_sobremesas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupons_zapbox NUMERIC DEFAULT 0;

-- Atualizar registros existentes para ter valor_cupons = 0
UPDATE public.modelos_markup 
SET 
  valor_cupons_acompanhamentos = 0,
  valor_cupons_bebidas_cervejas_e_chopp = 0,
  valor_cupons_bebidas_refrigerantes = 0,
  valor_cupons_bebidas_sucos = 0,
  valor_cupons_combo_lanches_carne_angus = 0,
  valor_cupons_combo_lanches_frango = 0,
  valor_cupons_frango_americano = 0,
  valor_cupons_jumbos = 0,
  valor_cupons_lanches = 0,
  valor_cupons_molhos = 0,
  valor_cupons_promocoes = 0,
  valor_cupons_saladas = 0,
  valor_cupons_sobremesas = 0,
  valor_cupons_zapbox = 0
WHERE 
  valor_cupons_acompanhamentos IS NULL 
  OR valor_cupons_bebidas_cervejas_e_chopp IS NULL
  OR valor_cupons_bebidas_refrigerantes IS NULL
  OR valor_cupons_bebidas_sucos IS NULL
  OR valor_cupons_combo_lanches_carne_angus IS NULL
  OR valor_cupons_combo_lanches_frango IS NULL
  OR valor_cupons_frango_americano IS NULL
  OR valor_cupons_jumbos IS NULL
  OR valor_cupons_lanches IS NULL
  OR valor_cupons_molhos IS NULL
  OR valor_cupons_promocoes IS NULL
  OR valor_cupons_saladas IS NULL
  OR valor_cupons_sobremesas IS NULL
  OR valor_cupons_zapbox IS NULL;

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modelos_markup' 
  AND table_schema = 'public'
  AND column_name LIKE '%valor_cupons%'
ORDER BY column_name;
