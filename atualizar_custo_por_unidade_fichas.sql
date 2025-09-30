-- Script para atualizar o campo custo_por_unidade de todas as fichas técnicas existentes
-- Cálculo: custo_por_unidade = custo_total_producao / rendimento

UPDATE fichas_tecnicas
SET custo_por_unidade = CASE 
    WHEN rendimento IS NOT NULL AND rendimento > 0 THEN custo_total_producao / rendimento
    ELSE custo_total_producao
END
WHERE custo_por_unidade IS NULL 
   OR custo_por_unidade != CASE 
       WHEN rendimento IS NOT NULL AND rendimento > 0 THEN custo_total_producao / rendimento
       ELSE custo_total_producao
   END;

-- Verificar os resultados
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
ORDER BY codigo;

