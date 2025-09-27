-- Script para verificar erro de cálculo na base BAS004 e ficha PDV 60
-- Investigar discrepância entre custo por kg/lt (23,86) e valor na ficha (0,67)

-- 1. Verificar dados da base BAS004
SELECT 
  'Base BAS004' as tipo,
  id, nome, codigo, tipo_produto, quantidade_total, unidade_produto,
  custo_total_batelada, ativo, user_id
FROM public.bases 
WHERE codigo = 'BAS004';

-- 2. Calcular custo unitário correto da base BAS004
SELECT 
  'Cálculo Custo Unitário BAS004' as tipo,
  custo_total_batelada,
  quantidade_total,
  ROUND(custo_total_batelada / quantidade_total, 2) as custo_unitario_calculado,
  'R$ 23,86 esperado' as valor_esperado
FROM public.bases 
WHERE codigo = 'BAS004';

-- 3. Verificar ficha técnica PDV 60
SELECT 
  'Ficha PDV 60' as tipo,
  id, nome, codigo, categoria, ativo, user_id
FROM public.fichas_tecnicas 
WHERE codigo = '60';

-- 4. Verificar bases usadas na ficha PDV 60
SELECT 
  'Bases na Ficha PDV 60' as tipo,
  fb.id, fb.ficha_id, fb.base_id, fb.quantidade, fb.unidade,
  fb.custo_unitario, fb.custo_total, fb.user_id,
  b.nome as base_nome, b.codigo as base_codigo,
  b.custo_total_batelada, b.quantidade_total
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
WHERE ft.codigo = '60';

-- 5. Verificar se BAS004 está sendo usada na ficha PDV 60
SELECT 
  'BAS004 na Ficha PDV 60' as tipo,
  fb.quantidade as quantidade_usada,
  fb.custo_unitario as custo_unitario_salvo,
  fb.custo_total as custo_total_salvo,
  b.custo_total_batelada,
  b.quantidade_total,
  ROUND(b.custo_total_batelada / b.quantidade_total, 2) as custo_unitario_correto,
  ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2) as custo_total_correto
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
WHERE ft.codigo = '60' AND b.codigo = 'BAS004';

-- 6. Verificar todos os insumos da ficha PDV 60
SELECT 
  'Todos Insumos Ficha PDV 60' as tipo,
  'Insumo' as categoria,
  fi.quantidade, fi.unidade, fi.custo_unitario, fi.custo_total,
  i.nome as insumo_nome
FROM public.fichas_insumos fi
LEFT JOIN public.insumos i ON fi.insumo_id = i.id
LEFT JOIN public.fichas_tecnicas ft ON fi.ficha_id = ft.id
WHERE ft.codigo = '60'

UNION ALL

SELECT 
  'Todos Insumos Ficha PDV 60' as tipo,
  'Base' as categoria,
  fb.quantidade, fb.unidade, fb.custo_unitario, fb.custo_total,
  b.nome as insumo_nome
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
WHERE ft.codigo = '60'

ORDER BY categoria, insumo_nome;

-- 7. Verificar se há problemas de precisão decimal
SELECT 
  'Verificação Precisão' as tipo,
  fb.quantidade,
  fb.custo_unitario,
  b.custo_total_batelada,
  b.quantidade_total,
  ROUND(b.custo_total_batelada / b.quantidade_total, 2) as calculo_exato,
  fb.custo_total as valor_salvo,
  ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2) as calculo_correto,
  ABS(fb.custo_total - ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2)) as diferenca
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
WHERE ft.codigo = '60' AND b.codigo = 'BAS004';
