-- Script para verificar dados da base BAS008
-- Verificar se há problemas de soma no custo total da batelada

-- 1. Verificar dados da base BAS008
SELECT 
  'Base Principal' as tipo,
  id, nome, codigo, tipo_produto, quantidade_total, unidade_produto,
  custo_total_batelada, ativo, user_id, created_at, updated_at
FROM public.bases 
WHERE codigo = 'BAS008';

-- 2. Verificar insumos associados à base BAS008
SELECT 
  'Insumos da Base' as tipo,
  bi.id, bi.base_id, bi.insumo_id, bi.quantidade, bi.unidade, 
  bi.custo, bi.user_id, bi.created_at,
  i.nome as insumo_nome, i.codigo_insumo, i.preco_por_unidade, i.fator_correcao
FROM public.bases_insumos bi
LEFT JOIN public.insumos i ON bi.insumo_id = i.id
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.codigo = 'BAS008'
ORDER BY i.nome;

-- 3. Calcular custo total manualmente para comparação
SELECT 
  'Cálculo Manual' as tipo,
  SUM(bi.quantidade * bi.custo) as custo_total_calculado,
  COUNT(*) as total_insumos,
  b.custo_total_batelada as custo_salvo_na_base,
  (SUM(bi.quantidade * bi.custo) - b.custo_total_batelada) as diferenca
FROM public.bases_insumos bi
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.codigo = 'BAS008'
GROUP BY b.custo_total_batelada;

-- 4. Verificar se há fichas técnicas usando esta base
SELECT 
  'Fichas que usam BAS008' as tipo,
  fb.id, fb.ficha_id, fb.base_id, fb.quantidade, fb.unidade,
  fb.custo_unitario, fb.custo_total, fb.user_id,
  ft.nome as ficha_nome, ft.codigo as ficha_codigo
FROM public.fichas_bases fb
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
LEFT JOIN public.bases b ON fb.base_id = b.id
WHERE b.codigo = 'BAS008';

-- 5. Verificar detalhes de cada insumo individual
SELECT 
  'Detalhes Insumos' as tipo,
  i.nome as insumo_nome,
  i.codigo_insumo,
  bi.quantidade,
  bi.unidade,
  bi.custo as custo_salvo,
  i.preco_por_unidade,
  i.fator_correcao,
  (bi.quantidade * i.preco_por_unidade * i.fator_correcao) as custo_calculado,
  (bi.custo - (bi.quantidade * i.preco_por_unidade * i.fator_correcao)) as diferenca
FROM public.bases_insumos bi
LEFT JOIN public.insumos i ON bi.insumo_id = i.id
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.codigo = 'BAS008'
ORDER BY i.nome;

-- 6. Verificar se há problemas de precisão decimal
SELECT 
  'Verificação Precisão' as tipo,
  bi.id,
  bi.quantidade,
  bi.custo,
  i.preco_por_unidade,
  i.fator_correcao,
  (bi.quantidade * i.preco_por_unidade * i.fator_correcao) as calculo_exato,
  ROUND((bi.quantidade * i.preco_por_unidade * i.fator_correcao), 2) as calculo_arredondado,
  bi.custo as valor_salvo,
  ABS(bi.custo - (bi.quantidade * i.preco_por_unidade * i.fator_correcao)) as diferenca_absoluta
FROM public.bases_insumos bi
LEFT JOIN public.insumos i ON bi.insumo_id = i.id
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.codigo = 'BAS008'
  AND ABS(bi.custo - (bi.quantidade * i.preco_por_unidade * i.fator_correcao)) > 0.01
ORDER BY diferenca_absoluta DESC;
