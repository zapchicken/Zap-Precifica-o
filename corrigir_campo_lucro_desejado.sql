-- =====================================================
-- SQL PARA CORRIGIR CAMPO LUCRO_DESEJADO NA TABELA DE CATEGORIAS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Reverter a renomeação: investimento_mkt -> lucro_desejado
-- na tabela config_markup_categoria
ALTER TABLE public.config_markup_categoria 
RENAME COLUMN investimento_mkt TO lucro_desejado;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.config_markup_categoria.lucro_desejado IS 'Percentual de lucro desejado por categoria (%)';

-- Verificar se a coluna foi renomeada corretamente
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
-- RESUMO DA CORREÇÃO:
-- =====================================================
-- config_markup_categoria:
--   ✅ lucro_desejado (REVERTIDO de investimento_mkt)
--   ✅ reserva_operacional (mantido)
-- =====================================================
