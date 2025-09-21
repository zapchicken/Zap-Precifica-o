-- =====================================================
-- ADICIONAR COLUNAS DE CUPONS NA TABELA CANAIS_VENDA
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Adicionar colunas de valor_cupom_vd e valor_cupom_mkt na tabela canais_venda
ALTER TABLE public.canais_venda 
ADD COLUMN IF NOT EXISTS valor_cupom_vd NUMERIC DEFAULT 0;

ALTER TABLE public.canais_venda 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt NUMERIC DEFAULT 0;

-- Atualizar registros existentes para ter valor_cupom_vd e valor_cupom_mkt = 0
UPDATE public.canais_venda 
SET 
  valor_cupom_vd = 0,
  valor_cupom_mkt = 0
WHERE 
  valor_cupom_vd IS NULL 
  OR valor_cupom_mkt IS NULL;

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'canais_venda' 
  AND table_schema = 'public'
  AND (column_name LIKE '%cupom%' OR column_name IN ('valor_cupom_vd', 'valor_cupom_mkt'))
ORDER BY column_name;
