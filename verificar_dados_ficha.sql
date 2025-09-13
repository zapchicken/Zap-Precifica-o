-- Script para verificar dados de uma ficha específica
-- Substitua o ID da ficha abaixo pelo ID real

-- Verificar dados da ficha principal
SELECT 
  'Ficha Principal' as tipo,
  id, nome, codigo, categoria, ativo, user_id
FROM public.fichas_tecnicas 
WHERE id = '9e345ae8-c955-4930-8baa-69764670c39c';

-- Verificar insumos associados
SELECT 
  'Insumos' as tipo,
  fi.id, fi.ficha_id, fi.insumo_id, fi.quantidade, fi.unidade, 
  fi.custo_unitario, fi.custo_total, fi.user_id,
  i.nome as insumo_nome, i.codigo_insumo
FROM public.fichas_insumos fi
LEFT JOIN public.insumos i ON fi.insumo_id = i.id
WHERE fi.ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c';

-- Verificar bases associadas
SELECT 
  'Bases' as tipo,
  fb.id, fb.ficha_id, fb.base_id, fb.quantidade, fb.unidade,
  fb.custo_unitario, fb.custo_total, fb.user_id,
  b.nome as base_nome, b.codigo as base_codigo
FROM public.fichas_bases fb
LEFT JOIN public.bases b ON fb.base_id = b.id
WHERE fb.ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c';

-- Verificar produtos prontos associados
SELECT 
  'Produtos Prontos' as tipo,
  fpp.id, fpp.ficha_id, fpp.produto_ficha_id, fpp.quantidade, fpp.unidade,
  fpp.custo_unitario, fpp.custo_total, fpp.user_id,
  ft.nome as produto_nome, ft.codigo as produto_codigo
FROM public.fichas_produtosprontos fpp
LEFT JOIN public.fichas_tecnicas ft ON fpp.produto_ficha_id = ft.id
WHERE fpp.ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c';

-- Verificar embalagens associadas
SELECT 
  'Embalagens' as tipo,
  ied.id, ied.ficha_id, ied.insumo_id, ied.quantidade, ied.unidade,
  ied.custo_unitario, ied.custo_total, ied.user_id,
  i.nome as insumo_nome, i.codigo_insumo
FROM public.insumos_embalagem_delivery ied
LEFT JOIN public.insumos i ON ied.insumo_id = i.id
WHERE ied.ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c';

-- Contar total de registros por tabela para esta ficha
SELECT 
  'Contagem Total' as tipo,
  (SELECT COUNT(*) FROM public.fichas_insumos WHERE ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c') as insumos_count,
  (SELECT COUNT(*) FROM public.fichas_bases WHERE ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c') as bases_count,
  (SELECT COUNT(*) FROM public.fichas_produtosprontos WHERE ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c') as produtos_count,
  (SELECT COUNT(*) FROM public.insumos_embalagem_delivery WHERE ficha_id = '9e345ae8-c955-4930-8baa-69764670c39c') as embalagens_count;
