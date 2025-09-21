-- =====================================================
-- ADICIONAR COLUNA DE CUPONS NA TABELA CONFIG_MARKUP_CATEGORIA
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Adicionar coluna taxa_cupons na tabela config_markup_categoria
ALTER TABLE public.config_markup_categoria 
ADD COLUMN IF NOT EXISTS taxa_cupons NUMERIC DEFAULT 0;

-- Atualizar registros existentes para ter taxa_cupons = 0
UPDATE public.config_markup_categoria 
SET taxa_cupons = 0 
WHERE taxa_cupons IS NULL;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'config_markup_categoria' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
