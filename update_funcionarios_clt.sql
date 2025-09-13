-- =====================================================
-- ATUALIZAÇÃO DA TABELA FUNCIONARIOS_CLT
-- Para adicionar os novos campos de vale-refeição
-- =====================================================

-- Adicionar as novas colunas
ALTER TABLE public.funcionarios_clt 
ADD COLUMN IF NOT EXISTS vale_refeicao_por_dia NUMERIC DEFAULT 0;

ALTER TABLE public.funcionarios_clt 
ADD COLUMN IF NOT EXISTS vale_refeicao_mensal NUMERIC DEFAULT 0;

-- Atualizar registros existentes que têm vale_refeicao para os novos campos
UPDATE public.funcionarios_clt 
SET 
  vale_refeicao_por_dia = CASE 
    WHEN dias_semana > 0 THEN vale_refeicao / (dias_semana * 4.33)
    ELSE 0 
  END,
  vale_refeicao_mensal = vale_refeicao
WHERE vale_refeicao > 0;

-- Remover a coluna antiga (opcional - descomente se quiser remover)
-- ALTER TABLE public.funcionarios_clt DROP COLUMN IF EXISTS vale_refeicao;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'funcionarios_clt' 
AND column_name LIKE '%vale_refeicao%'
ORDER BY column_name;
