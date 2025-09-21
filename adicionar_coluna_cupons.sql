-- =====================================================
-- ADICIONAR COLUNA DE CUPONS NA TABELA CANAIS_VENDA
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Adicionar coluna taxa_cupons na tabela canais_venda
ALTER TABLE public.canais_venda 
ADD COLUMN IF NOT EXISTS taxa_cupons NUMERIC DEFAULT 0;

-- Atualizar registros existentes para ter taxa_cupons = 0
UPDATE public.canais_venda 
SET taxa_cupons = 0 
WHERE taxa_cupons IS NULL;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'canais_venda' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
