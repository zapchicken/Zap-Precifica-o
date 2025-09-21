-- =====================================================
-- REMOVER COLUNAS DE CUPONS POR CATEGORIA DA TABELA MODELOS_MARKUP
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Remover colunas de taxa_cupons por categoria (não precisamos mais, pois cupons agora são por canal)
ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_acompanhamentos;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_bebidas_cervejas_e_chopp;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_bebidas_refrigerantes;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_bebidas_sucos;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_combo_lanches_carne_angus;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_combo_lanches_frango;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_frango_americano;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_jumbos;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_lanches;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_molhos;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_promocoes;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_saladas;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_sobremesas;

ALTER TABLE public.modelos_markup 
DROP COLUMN IF EXISTS taxa_cupons_zapbox;

-- Verificar se as colunas foram removidas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modelos_markup' 
  AND table_schema = 'public'
  AND column_name LIKE '%cupons%'
ORDER BY column_name;

-- Verificar a estrutura final da tabela modelos_markup
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modelos_markup' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
