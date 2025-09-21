-- =====================================================
-- ADICIONAR COLUNAS DE CUPONS NA TABELA MODELOS_MARKUP
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Adicionar colunas de taxa_cupons para cada categoria
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_acompanhamentos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_bebidas_cervejas_e_chopp NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_bebidas_refrigerantes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_bebidas_sucos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_combo_lanches_carne_angus NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_combo_lanches_frango NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_frango_americano NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_jumbos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_lanches NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_molhos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_promocoes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_saladas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_sobremesas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS taxa_cupons_zapbox NUMERIC DEFAULT 0;

-- Atualizar registros existentes para ter taxa_cupons = 0
UPDATE public.modelos_markup 
SET 
  taxa_cupons_acompanhamentos = 0,
  taxa_cupons_bebidas_cervejas_e_chopp = 0,
  taxa_cupons_bebidas_refrigerantes = 0,
  taxa_cupons_bebidas_sucos = 0,
  taxa_cupons_combo_lanches_carne_angus = 0,
  taxa_cupons_combo_lanches_frango = 0,
  taxa_cupons_frango_americano = 0,
  taxa_cupons_jumbos = 0,
  taxa_cupons_lanches = 0,
  taxa_cupons_molhos = 0,
  taxa_cupons_promocoes = 0,
  taxa_cupons_saladas = 0,
  taxa_cupons_sobremesas = 0,
  taxa_cupons_zapbox = 0
WHERE 
  taxa_cupons_acompanhamentos IS NULL 
  OR taxa_cupons_bebidas_cervejas_e_chopp IS NULL
  OR taxa_cupons_bebidas_refrigerantes IS NULL
  OR taxa_cupons_bebidas_sucos IS NULL
  OR taxa_cupons_combo_lanches_carne_angus IS NULL
  OR taxa_cupons_combo_lanches_frango IS NULL
  OR taxa_cupons_frango_americano IS NULL
  OR taxa_cupons_jumbos IS NULL
  OR taxa_cupons_lanches IS NULL
  OR taxa_cupons_molhos IS NULL
  OR taxa_cupons_promocoes IS NULL
  OR taxa_cupons_saladas IS NULL
  OR taxa_cupons_sobremesas IS NULL
  OR taxa_cupons_zapbox IS NULL;

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modelos_markup' 
  AND table_schema = 'public'
  AND column_name LIKE '%cupons%'
ORDER BY column_name;
