-- Forçar recálculo da base BAS010
-- Primeiro, vamos verificar os dados atuais
SELECT 
    'Base BAS010' as tipo,
    b.nome,
    b.codigo,
    b.custo_total_batelada,
    b.quantidade_total,
    (b.custo_total_batelada / NULLIF(b.quantidade_total, 0)) as custo_por_unidade
FROM bases b
WHERE b.codigo = 'BAS010';

-- Verificar insumos da base BAS010
SELECT 
    'Insumos BAS010' as tipo,
    bi.quantidade,
    bi.unidade,
    bi.custo,
    i.nome as insumo_nome,
    i.codigo_insumo,
    i.unidade_medida,
    i.preco_por_unidade,
    i.fator_correcao,
    (i.preco_por_unidade * i.fator_correcao) as custo_unitario_calculado,
    (bi.quantidade * i.preco_por_unidade * i.fator_correcao) as custo_total_calculado
FROM bases_insumos bi
JOIN insumos i ON bi.insumo_id = i.id
JOIN bases b ON bi.base_id = b.id
WHERE b.codigo = 'BAS010'
ORDER BY i.nome;

-- Forçar recálculo dos custos dos insumos na base BAS010
UPDATE bases_insumos 
SET custo = (
    SELECT bi.quantidade * i.preco_por_unidade * i.fator_correcao
    FROM insumos i
    WHERE i.id = bases_insumos.insumo_id
)
WHERE base_id IN (
    SELECT id FROM bases WHERE codigo = 'BAS010'
);

-- Recalcular custo total da base BAS010
UPDATE bases 
SET custo_total_batelada = (
    SELECT COALESCE(SUM(bi.custo), 0)
    FROM bases_insumos bi
    WHERE bi.base_id = bases.id
)
WHERE codigo = 'BAS010';

-- Verificar resultado após correção
SELECT 
    'Base BAS010 após correção' as tipo,
    b.nome,
    b.codigo,
    b.custo_total_batelada,
    b.quantidade_total,
    (b.custo_total_batelada / NULLIF(b.quantidade_total, 0)) as custo_por_unidade
FROM bases b
WHERE b.codigo = 'BAS010';

-- Verificar insumos após correção
SELECT 
    'Insumos BAS010 após correção' as tipo,
    bi.quantidade,
    bi.unidade,
    bi.custo,
    i.nome as insumo_nome,
    i.codigo_insumo,
    i.unidade_medida,
    (bi.quantidade * i.preco_por_unidade * i.fator_correcao) as custo_total_calculado,
    CASE 
        WHEN ABS(bi.custo - (bi.quantidade * i.preco_por_unidade * i.fator_correcao)) < 0.01 
        THEN 'OK' 
        ELSE 'ERRO' 
    END as status
FROM bases_insumos bi
JOIN insumos i ON bi.insumo_id = i.id
JOIN bases b ON bi.base_id = b.id
WHERE b.codigo = 'BAS010'
ORDER BY i.nome;
