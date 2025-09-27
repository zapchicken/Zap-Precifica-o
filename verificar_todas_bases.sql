-- Script para verificar todas as bases e identificar problemas de cálculo
-- Este script identifica bases com inconsistências entre custo salvo e custo calculado

-- 1. Verificar todas as bases com problemas de soma
SELECT 
  'Bases com Problemas' as tipo,
  b.id,
  b.codigo,
  b.nome,
  b.custo_total_batelada as custo_salvo,
  ROUND(SUM(bi.custo), 2) as custo_calculado,
  ROUND(ABS(b.custo_total_batelada - SUM(bi.custo)), 2) as diferenca,
  COUNT(bi.id) as total_insumos
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.ativo = true
GROUP BY b.id, b.codigo, b.nome, b.custo_total_batelada
HAVING ABS(b.custo_total_batelada - SUM(bi.custo)) > 0.01
ORDER BY diferenca DESC;

-- 2. Verificar bases com insumos com custos incorretos
SELECT 
  'Insumos com Custo Incorreto' as tipo,
  b.codigo as base_codigo,
  b.nome as base_nome,
  i.nome as insumo_nome,
  i.codigo_insumo,
  bi.quantidade,
  bi.custo as custo_salvo,
  ROUND(bi.quantidade * i.preco_por_unidade * i.fator_correcao, 2) as custo_correto,
  ROUND(ABS(bi.custo - (bi.quantidade * i.preco_por_unidade * i.fator_correcao)), 2) as diferenca
FROM public.bases_insumos bi
LEFT JOIN public.insumos i ON bi.insumo_id = i.id
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.ativo = true
  AND ABS(bi.custo - (bi.quantidade * i.preco_por_unidade * i.fator_correcao)) > 0.01
ORDER BY diferenca DESC;

-- 3. Estatísticas gerais das bases
SELECT 
  'Estatísticas Gerais' as tipo,
  COUNT(DISTINCT b.id) as total_bases_ativas,
  COUNT(bi.id) as total_insumos_em_bases,
  ROUND(AVG(b.custo_total_batelada), 2) as custo_medio_bases,
  ROUND(SUM(b.custo_total_batelada), 2) as custo_total_todas_bases
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.ativo = true;

-- 4. Verificar bases sem insumos
SELECT 
  'Bases sem Insumos' as tipo,
  b.codigo,
  b.nome,
  b.custo_total_batelada
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.ativo = true
  AND bi.id IS NULL;

-- 5. Verificar bases com custo zero mas com insumos
SELECT 
  'Bases com Custo Zero mas com Insumos' as tipo,
  b.codigo,
  b.nome,
  b.custo_total_batelada,
  COUNT(bi.id) as total_insumos,
  ROUND(SUM(bi.custo), 2) as soma_insumos
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.ativo = true
  AND b.custo_total_batelada = 0
  AND bi.id IS NOT NULL
GROUP BY b.id, b.codigo, b.nome, b.custo_total_batelada
HAVING COUNT(bi.id) > 0;
