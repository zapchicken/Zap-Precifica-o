-- Script para corrigir dados da base BAS008
-- Este script corrige automaticamente os custos dos insumos e recalcula o custo total

-- 1. Primeiro, vamos verificar o estado atual
SELECT 'Estado Atual' as status, 
       b.codigo, b.nome, b.custo_total_batelada,
       SUM(bi.custo) as soma_insumos_atual
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.codigo = 'BAS008'
GROUP BY b.id, b.codigo, b.nome, b.custo_total_batelada;

-- 2. Corrigir custos dos insumos baseados nos preços atuais
UPDATE public.bases_insumos 
SET custo = ROUND(
  bi.quantidade * i.preco_por_unidade * i.fator_correcao, 
  2
)
FROM public.bases_insumos bi
LEFT JOIN public.insumos i ON bi.insumo_id = i.id
LEFT JOIN public.bases b ON bi.base_id = b.id
WHERE b.codigo = 'BAS008'
  AND public.bases_insumos.id = bi.id;

-- 3. Recalcular custo total da base
UPDATE public.bases 
SET custo_total_batelada = (
  SELECT ROUND(SUM(bi.custo), 2)
  FROM public.bases_insumos bi
  WHERE bi.base_id = public.bases.id
)
WHERE codigo = 'BAS008';

-- 4. Verificar o estado após correção
SELECT 'Estado Após Correção' as status,
       b.codigo, b.nome, b.custo_total_batelada,
       SUM(bi.custo) as soma_insumos_corrigida,
       COUNT(bi.id) as total_insumos
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.codigo = 'BAS008'
GROUP BY b.id, b.codigo, b.nome, b.custo_total_batelada;

-- 5. Verificar se há fichas técnicas que precisam ser recalculadas
SELECT 'Fichas Afetadas' as status,
       ft.codigo as ficha_codigo,
       ft.nome as ficha_nome,
       fb.quantidade as quantidade_usada,
       fb.custo_unitario as custo_anterior,
       (fb.quantidade * b.custo_total_batelada / b.quantidade_total) as novo_custo_unitario
FROM public.fichas_bases fb
LEFT JOIN public.fichas_tecnicas ft ON fb.ficha_id = ft.id
LEFT JOIN public.bases b ON fb.base_id = b.id
WHERE b.codigo = 'BAS008';

-- 6. Atualizar custos nas fichas técnicas que usam esta base
UPDATE public.fichas_bases 
SET custo_unitario = ROUND(
  fb.quantidade * b.custo_total_batelada / b.quantidade_total, 
  2
),
    custo_total = ROUND(
  fb.quantidade * b.custo_total_batelada / b.quantidade_total * fb.quantidade, 
  2
)
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
WHERE b.codigo = 'BAS008'
  AND public.fichas_bases.id = fb.id;

-- 7. Verificar resultado final
SELECT 'Resultado Final' as status,
       b.codigo, b.nome, b.custo_total_batelada,
       b.quantidade_total,
       ROUND(b.custo_total_batelada / b.quantidade_total, 2) as custo_por_unidade,
       COUNT(bi.id) as total_insumos,
       SUM(bi.custo) as soma_verificacao
FROM public.bases b
LEFT JOIN public.bases_insumos bi ON b.id = bi.base_id
WHERE b.codigo = 'BAS008'
GROUP BY b.id, b.codigo, b.nome, b.custo_total_batelada, b.quantidade_total;
