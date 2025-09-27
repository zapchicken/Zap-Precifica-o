-- Testar recálculo automático para INS074
-- Primeiro, vamos verificar o insumo INS074
SELECT 
    'INS074 - Dados atuais' as info,
    id,
    nome,
    codigo_insumo,
    unidade_medida,
    preco_por_unidade,
    fator_correcao,
    (preco_por_unidade * fator_correcao) as custo_unitario_calculado
FROM insumos 
WHERE codigo_insumo = 'INS074';

-- Verificar bases que usam INS074
SELECT 
    'Bases que usam INS074' as info,
    b.codigo as base_codigo,
    b.nome as base_nome,
    bi.quantidade,
    bi.unidade,
    bi.custo as custo_atual,
    i.nome as insumo_nome,
    i.unidade_medida,
    (bi.quantidade * i.preco_por_unidade * i.fator_correcao) as custo_correto,
    CASE 
        WHEN ABS(bi.custo - (bi.quantidade * i.preco_por_unidade * i.fator_correcao)) < 0.01 
        THEN 'OK' 
        ELSE 'PRECISA_CORRECAO' 
    END as status
FROM bases b
JOIN bases_insumos bi ON b.id = bi.base_id
JOIN insumos i ON bi.insumo_id = i.id
WHERE i.codigo_insumo = 'INS074'
ORDER BY b.codigo;

-- Verificar fichas que usam bases com INS074
SELECT 
    'Fichas que usam bases com INS074' as info,
    f.codigo_pdv,
    f.nome as ficha_nome,
    b.codigo as base_codigo,
    b.nome as base_nome,
    fb.quantidade as quantidade_base,
    f.custo_total_producao
FROM fichas_tecnicas f
JOIN fichas_bases fb ON f.id = fb.ficha_id
JOIN bases b ON fb.base_id = b.id
JOIN bases_insumos bi ON b.id = bi.base_id
JOIN insumos i ON bi.insumo_id = i.id
WHERE i.codigo_insumo = 'INS074'
ORDER BY f.codigo_pdv;
