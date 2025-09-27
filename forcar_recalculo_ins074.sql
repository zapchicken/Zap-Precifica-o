-- Forçar recálculo do insumo INS074
-- Primeiro, vamos verificar o insumo atual
SELECT 
    id,
    nome,
    codigo_insumo,
    unidade_medida,
    preco_por_unidade,
    fator_correcao,
    (preco_por_unidade * fator_correcao) as custo_unitario_calculado
FROM insumos 
WHERE codigo_insumo = 'INS074';

-- Agora vamos forçar o recálculo das bases que usam este insumo
-- Atualizar custos nas bases_insumos
UPDATE bases_insumos 
SET custo = (
    SELECT (i.preco_por_unidade * i.fator_correcao) * bi.quantidade
    FROM insumos i
    WHERE i.id = bases_insumos.insumo_id
)
WHERE insumo_id IN (
    SELECT id FROM insumos WHERE codigo_insumo = 'INS074'
);

-- Recalcular custo total das bases afetadas
UPDATE bases 
SET custo_total_batelada = (
    SELECT COALESCE(SUM(bi.custo), 0)
    FROM bases_insumos bi
    WHERE bi.base_id = bases.id
)
WHERE id IN (
    SELECT DISTINCT bi.base_id
    FROM bases_insumos bi
    JOIN insumos i ON bi.insumo_id = i.id
    WHERE i.codigo_insumo = 'INS074'
);

-- Recalcular custo total das fichas que usam essas bases
UPDATE fichas_tecnicas 
SET custo_total_producao = (
    -- Custo dos insumos diretos
    COALESCE((
        SELECT SUM(fi.custo)
        FROM fichas_insumos fi
        WHERE fi.ficha_id = fichas_tecnicas.id
    ), 0) +
    -- Custo das bases
    COALESCE((
        SELECT SUM(fb.quantidade * (b.custo_total_batelada / NULLIF(b.quantidade_total, 0)))
        FROM fichas_bases fb
        JOIN bases b ON fb.base_id = b.id
        WHERE fb.ficha_id = fichas_tecnicas.id
    ), 0) +
    -- Custo das embalagens
    COALESCE((
        SELECT SUM(ied.custo)
        FROM insumos_embalagem_delivery ied
        WHERE ied.ficha_id = fichas_tecnicas.id
    ), 0)
)
WHERE id IN (
    SELECT DISTINCT fb.ficha_id
    FROM fichas_bases fb
    JOIN bases b ON fb.base_id = b.id
    JOIN bases_insumos bi ON b.id = bi.base_id
    JOIN insumos i ON bi.insumo_id = i.id
    WHERE i.codigo_insumo = 'INS074'
);

-- Verificar o resultado
SELECT 
    'Base BAS010' as tipo,
    b.nome,
    b.codigo,
    b.custo_total_batelada,
    b.quantidade_total,
    (b.custo_total_batelada / NULLIF(b.quantidade_total, 0)) as custo_por_unidade
FROM bases b
WHERE b.codigo = 'BAS010'

UNION ALL

SELECT 
    'Ficha que usa BAS010' as tipo,
    f.nome,
    f.codigo_pdv,
    f.custo_total_producao,
    NULL as quantidade_total,
    NULL as custo_por_unidade
FROM fichas_tecnicas f
JOIN fichas_bases fb ON f.id = fb.ficha_id
JOIN bases b ON fb.base_id = b.id
WHERE b.codigo = 'BAS010';
