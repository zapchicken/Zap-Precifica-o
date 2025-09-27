-- Verificar dados do insumo INS074
SELECT 
    i.id,
    i.nome,
    i.codigo_insumo,
    i.unidade_medida,
    i.preco_por_unidade,
    i.fator_correcao,
    (i.preco_por_unidade * i.fator_correcao) as custo_unitario_calculado
FROM insumos i 
WHERE i.codigo_insumo = 'INS074'
ORDER BY i.created_at DESC;

-- Verificar bases que usam INS074
SELECT 
    b.id as base_id,
    b.nome as base_nome,
    b.codigo as base_codigo,
    bi.quantidade,
    bi.unidade,
    bi.custo,
    i.nome as insumo_nome,
    i.unidade_medida as insumo_unidade_medida
FROM bases b
JOIN bases_insumos bi ON b.id = bi.base_id
JOIN insumos i ON bi.insumo_id = i.id
WHERE i.codigo_insumo = 'INS074'
ORDER BY b.codigo;

-- Verificar fichas que usam bases com INS074
SELECT 
    f.id as ficha_id,
    f.nome as ficha_nome,
    f.codigo_pdv,
    fb.quantidade as quantidade_base,
    b.nome as base_nome,
    b.codigo as base_codigo
FROM fichas_tecnicas f
JOIN fichas_bases fb ON f.id = fb.ficha_id
JOIN bases b ON fb.base_id = b.id
JOIN bases_insumos bi ON b.id = bi.base_id
JOIN insumos i ON bi.insumo_id = i.id
WHERE i.codigo_insumo = 'INS074'
ORDER BY f.codigo_pdv;
