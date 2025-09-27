-- Script para forçar recálculo da ficha PDV 25
-- Este script recalcula manualmente o custo total da ficha

-- 1. Verificar dados atuais da ficha PDV 25
SELECT 
  'Estado Atual Ficha PDV 25' as tipo,
  id, nome, codigo, custo_total_producao
FROM public.fichas_tecnicas 
WHERE codigo = '25';

-- 2. Calcular custo total correto
WITH custos_calculados AS (
  -- Insumos
  SELECT 
    'insumos' as categoria,
    SUM(fi.custo_total) as total
  FROM public.fichas_insumos fi
  LEFT JOIN public.fichas_tecnicas ft ON fi.ficha_id = ft.id
  WHERE ft.codigo = '25'
  
  UNION ALL
  
  -- Bases (com cálculo dinâmico)
  SELECT 
    'bases' as categoria,
    SUM(ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2)) as total
  FROM public.fichas_bases fb
  LEFT JOIN public.bases b ON fb.base_id = b.id
  LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
  WHERE ft.codigo = '25'
  
  UNION ALL
  
  -- Produtos prontos
  SELECT 
    'produtos' as categoria,
    SUM(fp.custo_total) as total
  FROM public.fichas_produtos fp
  LEFT JOIN public.fichas_tecnicas ft ON fp.ficha_id = ft.id
  WHERE ft.codigo = '25'
  
  UNION ALL
  
  -- Embalagens
  SELECT 
    'embalagens' as categoria,
    SUM(fe.custo_total) as total
  FROM public.fichas_embalagens fe
  LEFT JOIN public.fichas_tecnicas ft ON fe.ficha_id = ft.id
  WHERE ft.codigo = '25'
)
SELECT 
  'Cálculo Manual' as tipo,
  categoria,
  total,
  SUM(total) OVER() as custo_total_calculado
FROM custos_calculados;

-- 3. Atualizar custo total da ficha PDV 25
UPDATE public.fichas_tecnicas 
SET custo_total_producao = (
  -- Insumos
  COALESCE((
    SELECT SUM(fi.custo_total) 
    FROM public.fichas_insumos fi 
    WHERE fi.ficha_id = public.fichas_tecnicas.id
  ), 0) +
  
  -- Bases (com cálculo dinâmico)
  COALESCE((
    SELECT SUM(ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2))
    FROM public.fichas_bases fb
    LEFT JOIN public.bases b ON fb.base_id = b.id
    WHERE fb.ficha_id = public.fichas_tecnicas.id
  ), 0) +
  
  -- Produtos prontos
  COALESCE((
    SELECT SUM(fp.custo_total) 
    FROM public.fichas_produtos fp 
    WHERE fp.ficha_id = public.fichas_tecnicas.id
  ), 0) +
  
  -- Embalagens
  COALESCE((
    SELECT SUM(fe.custo_total) 
    FROM public.fichas_embalagens fe 
    WHERE fe.ficha_id = public.fichas_tecnicas.id
  ), 0)
),
custo_por_unidade = (
  -- Insumos
  COALESCE((
    SELECT SUM(fi.custo_total) 
    FROM public.fichas_insumos fi 
    WHERE fi.ficha_id = public.fichas_tecnicas.id
  ), 0) +
  
  -- Bases (com cálculo dinâmico)
  COALESCE((
    SELECT SUM(ROUND(fb.quantidade * (b.custo_total_batelada / b.quantidade_total), 2))
    FROM public.fichas_bases fb
    LEFT JOIN public.bases b ON fb.base_id = b.id
    WHERE fb.ficha_id = public.fichas_tecnicas.id
  ), 0) +
  
  -- Produtos prontos
  COALESCE((
    SELECT SUM(fp.custo_total) 
    FROM public.fichas_produtos fp 
    WHERE fp.ficha_id = public.fichas_tecnicas.id
  ), 0) +
  
  -- Embalagens
  COALESCE((
    SELECT SUM(fe.custo_total) 
    FROM public.fichas_embalagens fe 
    WHERE fe.ficha_id = public.fichas_tecnicas.id
  ), 0)
)
WHERE codigo = '25';

-- 4. Verificar resultado
SELECT 
  'Resultado Atualizado' as tipo,
  id, nome, codigo, custo_total_producao, custo_por_unidade
FROM public.fichas_tecnicas 
WHERE codigo = '25';
