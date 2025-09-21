-- =====================================================
-- SQL PARA ADICIONAR CAMPOS FALTANTES NA FÓRMULA DE MARKUP
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Adicionar campos faltantes na tabela config_markup_geral
-- Estes campos são necessários para a nova fórmula de taxa de marcação:
-- 100% / (100% - soma(Taxa de Impostos (%) + Investimento MKT (%) + Taxa de Cartão (%) + Despesas Fixas (%) + Reserva Operacional (%) + Categoria % Lucro Desejado + Categoria % Reserva Operacional))

-- 1. Adicionar campo 'investimento_mkt' (Investimento MKT %)
ALTER TABLE public.config_markup_geral 
ADD COLUMN IF NOT EXISTS investimento_mkt NUMERIC NOT NULL DEFAULT 15;

-- 2. Adicionar campo 'despesas_fixas' (Despesas Fixas %)
ALTER TABLE public.config_markup_geral 
ADD COLUMN IF NOT EXISTS despesas_fixas NUMERIC NOT NULL DEFAULT 10;

-- 3. Adicionar campo 'reserva_operacional' (Reserva Operacional %)
ALTER TABLE public.config_markup_geral 
ADD COLUMN IF NOT EXISTS reserva_operacional NUMERIC NOT NULL DEFAULT 5;

-- 4. Renomear campo 'lucro_desejado' para 'investimento_mkt' na tabela config_markup_categoria
-- (Para manter consistência com a mudança de "Lucro Desejado" para "Investimento MKT")
ALTER TABLE public.config_markup_categoria 
RENAME COLUMN lucro_desejado TO investimento_mkt;

-- 5. Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.config_markup_geral.investimento_mkt IS 'Percentual de investimento em marketing (%)';
COMMENT ON COLUMN public.config_markup_geral.despesas_fixas IS 'Percentual de despesas fixas sobre faturamento (%)';
COMMENT ON COLUMN public.config_markup_geral.reserva_operacional IS 'Percentual de reserva operacional (%)';
COMMENT ON COLUMN public.config_markup_categoria.investimento_mkt IS 'Percentual de investimento em marketing por categoria (%)';

-- 6. Verificar se as colunas foram criadas corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'config_markup_geral' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar se a coluna foi renomeada corretamente na tabela de categorias
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'config_markup_categoria' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- RESUMO DOS CAMPOS ADICIONADOS:
-- =====================================================
-- config_markup_geral:
--   ✅ impostos_faturamento (já existia)
--   ✅ investimento_mkt (NOVO - padrão: 15%)
--   ✅ taxa_cartao (já existia)
--   ✅ despesas_fixas (NOVO - padrão: 10%)
--   ✅ reserva_operacional (NOVO - padrão: 5%)
--
-- config_markup_categoria:
--   ✅ investimento_mkt (RENOMEADO de lucro_desejado)
--   ✅ reserva_operacional (já existia)
-- =====================================================
