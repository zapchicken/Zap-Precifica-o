-- Script para atualizar o campo custo_por_unidade de todas as fichas técnicas existentes
-- Cálculo: custo_por_unidade = custo_total_producao / rendimento

-- Atualizar todas as fichas técnicas
UPDATE fichas_tecnicas
SET custo_por_unidade = CASE 
    WHEN rendimento IS NOT NULL AND rendimento > 0 THEN custo_total_producao / rendimento
    ELSE custo_total_producao
END;

-- Verificar os resultados para o PDV 49
SELECT 
    codigo,
    nome,
    rendimento,
    custo_total_producao,
    custo_por_unidade,
    CASE 
        WHEN rendimento IS NOT NULL AND rendimento > 0 THEN custo_total_producao / rendimento
        ELSE custo_total_producao
    END AS custo_calculado
FROM fichas_tecnicas
WHERE codigo = '49'
ORDER BY codigo;

-- Verificar todas as fichas técnicas
SELECT 
    codigo,
    nome,
    rendimento,
    custo_total_producao,
    custo_por_unidade
FROM fichas_tecnicas
ORDER BY codigo;

