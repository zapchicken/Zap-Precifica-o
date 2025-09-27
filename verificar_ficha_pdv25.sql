-- Script para verificar ficha PDV 25 e seus custos
-- Investigar por que o custo total não reflete a correção

-- 1. Verificar dados da ficha PDV 25
SELECT 
  'Ficha PDV 25' as tipo,
  id, nome, codigo, categoria, tempo_preparo, rendimento,
  custo_total, ativo, user_id, created_at, updated_at
FROM public.fichas_tecnicas 
WHERE codigo = '25';

-- 2. Verificar insumos da ficha PDV 25
SELECT 
  'Insumos Ficha PDV 25' as tipo,
  fi.id, fi.ficha_id, fi.insumo_id, fi.quantidade, fi.unidade, 
  fi.custo_unitario, fi.custo_total, fi.user_id,
  i.nome as insumo_nome, i.codigo_insumo, i.preco_por_unidade
FROM public.fichas_insumos fi
LEFT JOIN public.insumos i ON fi.insumo_id = i.id
LEFT JOIN public.fichas_tecnicas ft ON fi.ficha_id = ft.id
WHERE ft.codigo = '25'
ORDER BY i.nome;

-- 3. Verificar bases da ficha PDV 25
SELECT 
  'Bases Ficha PDV 25' as tipo,
  fb.id, fb.ficha_id, fb.base_id, fb.quantidade, fb.unidade,
  fb.custo_unitario as custo_unitario_salvo, fb.custo_total as custo_total_salvo,
  b.nome as base_nome, b.codigo as base_codigo,
  b.custo_total_batelada, b.quantidade_total,
  ROUND(b.custo_total_batelada / b.quantidade_total, 2) as custo_unitario_correto,
  ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2) as custo_total_correto
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
WHERE ft.codigo = '25'
ORDER BY b.nome;

-- 4. Verificar produtos prontos da ficha PDV 25
SELECT 
  'Produtos Prontos Ficha PDV 25' as tipo,
  fp.id, fp.ficha_id, fp.produto_id, fp.quantidade, fp.unidade,
  fp.custo_unitario, fp.custo_total,
  p.nome as produto_nome, p.codigo as produto_codigo
FROM public.fichas_produtos fp
LEFT JOIN public.produtos p ON fp.produto_id = p.id
LEFT JOIN public.fichas_tecnicas ft ON fp.ficha_id = ft.id
WHERE ft.codigo = '25'
ORDER BY p.nome;

-- 5. Verificar embalagens da ficha PDV 25
SELECT 
  'Embalagens Ficha PDV 25' as tipo,
  fe.id, fe.ficha_id, fe.embalagem_id, fe.quantidade, fe.unidade,
  fe.custo_unitario, fe.custo_total,
  e.nome as embalagem_nome, e.codigo as embalagem_codigo
FROM public.fichas_embalagens fe
LEFT JOIN public.embalagens e ON fe.embalagem_id = e.id
LEFT JOIN public.fichas_tecnicas ft ON fe.ficha_id = ft.id
WHERE ft.codigo = '25'
ORDER BY e.nome;

-- 6. Calcular custo total manualmente para comparação
SELECT 
  'Cálculo Manual Ficha PDV 25' as tipo,
  'Insumos' as categoria,
  SUM(fi.custo_total) as total_insumos
FROM public.fichas_insumos fi
LEFT JOIN public.fichas_tecnicas ft ON fi.ficha_id = ft.id
WHERE ft.codigo = '25'

UNION ALL

SELECT 
  'Cálculo Manual Ficha PDV 25' as tipo,
  'Bases' as categoria,
  SUM(ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2)) as total_bases
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
WHERE ft.codigo = '25'

UNION ALL

SELECT 
  'Cálculo Manual Ficha PDV 25' as tipo,
  'Produtos' as categoria,
  SUM(fp.custo_total) as total_produtos
FROM public.fichas_produtos fp
LEFT JOIN public.fichas_tecnicas ft ON fp.ficha_id = ft.id
WHERE ft.codigo = '25'

UNION ALL

SELECT 
  'Cálculo Manual Ficha PDV 25' as tipo,
  'Embalagens' as categoria,
  SUM(fe.custo_total) as total_embalagens
FROM public.fichas_embalagens fe
LEFT JOIN public.fichas_tecnicas ft ON fe.ficha_id = ft.id
WHERE ft.codigo = '25';

-- 7. Verificar se há diferenças significativas
SELECT 
  'Verificação Diferenças' as tipo,
  ft.custo_total as custo_salvo,
  (
    COALESCE((SELECT SUM(fi.custo_total) FROM public.fichas_insumos fi WHERE fi.ficha_id = ft.id), 0) +
    COALESCE((SELECT SUM(ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2)) 
              FROM public.fichas_bases fb 
              LEFT JOIN public.bases b ON fb.base_id = b.id 
              WHERE fb.ficha_id = ft.id), 0) +
    COALESCE((SELECT SUM(fp.custo_total) FROM public.fichas_produtos fp WHERE fp.ficha_id = ft.id), 0) +
    COALESCE((SELECT SUM(fe.custo_total) FROM public.fichas_embalagens fe WHERE fe.ficha_id = ft.id), 0)
  ) as custo_calculado,
  ABS(ft.custo_total - (
    COALESCE((SELECT SUM(fi.custo_total) FROM public.fichas_insumos fi WHERE fi.ficha_id = ft.id), 0) +
    COALESCE((SELECT SUM(ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2)) 
              FROM public.fichas_bases fb 
              LEFT JOIN public.bases b ON fb.base_id = b.id 
              WHERE fb.ficha_id = ft.id), 0) +
    COALESCE((SELECT SUM(fp.custo_total) FROM public.fichas_produtos fp WHERE fp.ficha_id = ft.id), 0) +
    COALESCE((SELECT SUM(fe.custo_total) FROM public.fichas_embalagens fe WHERE fe.ficha_id = ft.id), 0)
  )) as diferenca
FROM public.fichas_tecnicas ft
WHERE ft.codigo = '25';
