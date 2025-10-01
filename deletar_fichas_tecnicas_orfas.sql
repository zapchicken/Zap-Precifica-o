-- =====================================================
-- SCRIPT PARA DELETAR FICHAS TÉCNICAS ÓRFÃAS
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai identificar e deletar fichas técnicas
-- que não têm mais produtos associados
-- PRIMEIRO IDENTIFICA, DEPOIS DELETA
--
-- =====================================================

-- 1. IDENTIFICAR FICHAS TÉCNICAS ÓRFÃAS
SELECT '=== FICHAS TÉCNICAS ÓRFÃAS ===' as secao;

SELECT 
  ft.id,
  ft.nome,
  ft.codigo,
  ft.categoria,
  ft.ativo,
  ft.created_at,
  ft.updated_at,
  'FICHA ÓRFÃ - SEM PRODUTO ASSOCIADO' as status
FROM public.fichas_tecnicas ft
LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.id IS NULL
ORDER BY ft.created_at DESC;

-- 2. VERIFICAR DEPENDÊNCIAS DAS FICHAS ÓRFÃAS
SELECT '=== DEPENDÊNCIAS DAS FICHAS ÓRFÃAS ===' as secao;

-- Verificar fichas_insumos das fichas órfãs
SELECT 
  'fichas_insumos' as tabela,
  COUNT(*) as registros
FROM public.fichas_insumos fi
INNER JOIN public.fichas_tecnicas ft ON ft.id = fi.ficha_id
LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.id IS NULL;

-- Verificar fichas_bases das fichas órfãs
SELECT 
  'fichas_bases' as tabela,
  COUNT(*) as registros
FROM public.fichas_bases fb
INNER JOIN public.fichas_tecnicas ft ON ft.id = fb.ficha_id
LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.id IS NULL;

-- Verificar fichas_produtosprontos das fichas órfãs
SELECT 
  'fichas_produtosprontos' as tabela,
  COUNT(*) as registros
FROM public.fichas_produtosprontos fpp
INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.id IS NULL;

-- Verificar insumos_embalagem_delivery das fichas órfãs
SELECT 
  'insumos_embalagem_delivery' as tabela,
  COUNT(*) as registros
FROM public.insumos_embalagem_delivery ied
INNER JOIN public.fichas_tecnicas ft ON ft.id = ied.ficha_id
LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.id IS NULL;

-- 3. DELETAR DEPENDÊNCIAS DAS FICHAS ÓRFÃAS
SELECT '=== DELETANDO DEPENDÊNCIAS DAS FICHAS ÓRFÃAS ===' as secao;

-- Deletar fichas_insumos das fichas órfãs
DELETE FROM public.fichas_insumos 
WHERE ficha_id IN (
  SELECT ft.id
  FROM public.fichas_tecnicas ft
  LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
  WHERE p.id IS NULL
);

-- Deletar fichas_bases das fichas órfãs
DELETE FROM public.fichas_bases 
WHERE ficha_id IN (
  SELECT ft.id
  FROM public.fichas_tecnicas ft
  LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
  WHERE p.id IS NULL
);

-- Deletar fichas_produtosprontos das fichas órfãs
DELETE FROM public.fichas_produtosprontos 
WHERE ficha_id IN (
  SELECT ft.id
  FROM public.fichas_tecnicas ft
  LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
  WHERE p.id IS NULL
);

-- Deletar insumos_embalagem_delivery das fichas órfãs
DELETE FROM public.insumos_embalagem_delivery 
WHERE ficha_id IN (
  SELECT ft.id
  FROM public.fichas_tecnicas ft
  LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
  WHERE p.id IS NULL
);

-- 4. DELETAR FICHAS TÉCNICAS ÓRFÃAS
SELECT '=== DELETANDO FICHAS TÉCNICAS ÓRFÃAS ===' as secao;

-- Deletar fichas técnicas órfãs
DELETE FROM public.fichas_tecnicas 
WHERE id IN (
  SELECT ft.id
  FROM public.fichas_tecnicas ft
  LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
  WHERE p.id IS NULL
);

-- 5. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as secao;

-- Verificar se ainda há fichas órfãs
SELECT 
  'Fichas órfãs restantes' as status,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas ft
LEFT JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.id IS NULL;

-- Verificar fichas_insumos órfãs
SELECT 
  'fichas_insumos órfãs' as status,
  COUNT(*) as quantidade
FROM public.fichas_insumos fi
LEFT JOIN public.fichas_tecnicas ft ON ft.id = fi.ficha_id
WHERE ft.id IS NULL;

-- Verificar fichas_bases órfãs
SELECT 
  'fichas_bases órfãs' as status,
  COUNT(*) as quantidade
FROM public.fichas_bases fb
LEFT JOIN public.fichas_tecnicas ft ON ft.id = fb.ficha_id
WHERE ft.id IS NULL;

-- Verificar fichas_produtosprontos órfãs
SELECT 
  'fichas_produtosprontos órfãs' as status,
  COUNT(*) as quantidade
FROM public.fichas_produtosprontos fpp
LEFT JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
WHERE ft.id IS NULL;

-- Verificar insumos_embalagem_delivery órfãs
SELECT 
  'insumos_embalagem_delivery órfãs' as status,
  COUNT(*) as quantidade
FROM public.insumos_embalagem_delivery ied
LEFT JOIN public.fichas_tecnicas ft ON ft.id = ied.ficha_id
WHERE ft.id IS NULL;

-- 6. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Total de fichas técnicas' as item,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas

UNION ALL

SELECT 
  'Total de fichas_insumos' as item,
  COUNT(*) as quantidade
FROM public.fichas_insumos

UNION ALL

SELECT 
  'Total de fichas_bases' as item,
  COUNT(*) as quantidade
FROM public.fichas_bases

UNION ALL

SELECT 
  'Total de fichas_produtosprontos' as item,
  COUNT(*) as quantidade
FROM public.fichas_produtosprontos

UNION ALL

SELECT 
  'Total de insumos_embalagem_delivery' as item,
  COUNT(*) as quantidade
FROM public.insumos_embalagem_delivery;

-- 7. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Fichas órfãs foram deletadas' as passo;
SELECT '2. Agora pode executar o script de constraint UNIQUE' as passo;
SELECT '3. Execute: adicionar_constraint_unique_codigo_pdv.sql' as passo;
SELECT '4. A constraint será criada com sucesso' as passo;
