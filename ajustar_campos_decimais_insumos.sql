-- =====================================================
-- AJUSTAR CAMPOS DECIMAIS NA TABELA INSUMOS
-- =====================================================
-- Este script altera os tipos de dados para permitir valores decimais
-- nos campos fator_correcao e quantidade_minima_compra

-- 1. Alterar quantidade_minima_compra de INTEGER para NUMERIC
ALTER TABLE public.insumos 
ALTER COLUMN quantidade_minima_compra TYPE NUMERIC USING quantidade_minima_compra::NUMERIC;

-- 2. Alterar quantidade_comprar de INTEGER para NUMERIC (também pode precisar de decimais)
ALTER TABLE public.insumos 
ALTER COLUMN quantidade_comprar TYPE NUMERIC USING quantidade_comprar::NUMERIC;

-- 3. Verificar se fator_correcao já está como NUMERIC (deve estar, mas vamos confirmar)
-- Se não estiver, descomente a linha abaixo:
-- ALTER TABLE public.insumos 
-- ALTER COLUMN fator_correcao TYPE NUMERIC USING fator_correcao::NUMERIC;

-- 4. Adicionar comentários para documentar as mudanças
COMMENT ON COLUMN public.insumos.fator_correcao IS 'Fator de correção para cálculo de custo (aceita decimais com 1 casa decimal)';
COMMENT ON COLUMN public.insumos.quantidade_minima_compra IS 'Quantidade mínima para compra (aceita decimais com 2 casas decimais)';
COMMENT ON COLUMN public.insumos.quantidade_comprar IS 'Quantidade a comprar (aceita decimais com 2 casas decimais)';

-- 5. Verificar a estrutura atualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'insumos' 
    AND table_schema = 'public'
    AND column_name IN ('fator_correcao', 'quantidade_minima_compra', 'quantidade_comprar')
ORDER BY ordinal_position;
