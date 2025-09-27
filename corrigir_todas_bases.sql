-- Script para corrigir automaticamente todas as bases com problemas de cálculo
-- ATENÇÃO: Execute este script com cuidado, pois ele modifica dados

-- 1. Primeiro, vamos fazer backup dos dados atuais
CREATE TEMP TABLE backup_bases_insumos AS
SELECT * FROM public.bases_insumos;

CREATE TEMP TABLE backup_bases AS
SELECT * FROM public.bases;

-- 2. Corrigir custos dos insumos em todas as bases
UPDATE public.bases_insumos 
SET custo = ROUND(
  bi.quantidade * i.preco_por_unidade * i.fator_correcao, 
  2
)
FROM public.bases_insumos bi
LEFT JOIN public.insumos i ON bi.insumo_id = i.id
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.ativo = true
  AND public.bases_insumos.id = bi.id;

-- 3. Recalcular custo total de todas as bases
UPDATE public.bases 
SET custo_total_batelada = COALESCE((
  SELECT ROUND(SUM(bi.custo), 2)
  FROM public.bases_insumos bi
  WHERE bi.base_id = public.bases.id
), 0)
WHERE ativo = true;

-- 4. Verificar quantas bases foram corrigidas
SELECT 
  'Bases Corrigidas' as status,
  COUNT(*) as total_bases_processadas,
  SUM(CASE WHEN b.custo_total_batelada > 0 THEN 1 ELSE 0 END) as bases_com_custo,
  SUM(CASE WHEN b.custo_total_batelada = 0 THEN 1 ELSE 0 END) as bases_sem_custo
FROM public.bases b
WHERE b.ativo = true;

-- 5. Verificar se ainda há problemas
SELECT 
  'Verificação Pós-Correção' as status,
  COUNT(*) as bases_com_problemas_restantes
FROM (
  SELECT b.id
  FROM public.bases b
  LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
  WHERE b.ativo = true
  GROUP BY b.id, b.custo_total_batelada
  HAVING ABS(b.custo_total_batelada - SUM(bi.custo)) > 0.01
) as bases_problematicas;

-- 6. Atualizar custos nas fichas técnicas que usam bases corrigidas
UPDATE public.fichas_bases 
SET custo_unitario = ROUND(
  fb.quantidade * b.custo_total_batelada / NULLIF(b.quantidade_total, 0), 
  2
),
    custo_total = ROUND(
  fb.quantidade * b.custo_total_batelada / NULLIF(b.quantidade_total, 0) * fb.quantidade, 
  2
)
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
WHERE b.ativo = true
  AND b.quantidade_total > 0
  AND public.fichas_bases.id = fb.id;

-- 7. Relatório final de correções
SELECT 
  'Relatório Final' as status,
  'Bases ativas' as tipo,
  COUNT(*) as total,
  ROUND(AVG(custo_total_batelada), 2) as custo_medio,
  ROUND(SUM(custo_total_batelada), 2) as custo_total
FROM public.bases 
WHERE ativo = true

UNION ALL

SELECT 
  'Relatório Final' as status,
  'Insumos em bases' as tipo,
  COUNT(*) as total,
  ROUND(AVG(custo), 2) as custo_medio,
  ROUND(SUM(custo), 2) as custo_total
FROM public.bases_insumos bi
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.ativo = true;

-- 8. Verificar bases específicas que podem ter problemas
SELECT 
  'Bases Específicas' as status,
  b.codigo,
  b.nome,
  b.custo_total_batelada,
  ROUND(SUM(bi.custo), 2) as soma_insumos,
  ROUND(ABS(b.custo_total_batelada - SUM(bi.custo)), 2) as diferenca
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.ativo = true
  AND b.codigo IN ('BAS008', 'BAS001', 'BAS002', 'BAS003', 'BAS004', 'BAS005')
GROUP BY b.id, b.codigo, b.nome, b.custo_total_batelada
ORDER BY b.codigo;
