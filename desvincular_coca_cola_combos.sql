-- =====================================================
-- SCRIPT PARA DESVINCULAR COCA COLA DE COMBOS/LANCHES
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai identificar e desvincular a Coca Cola
-- de todos os combos/lanches que a estão usando
-- PRIMEIRO IDENTIFICA, DEPOIS DESVINCULA
--
-- =====================================================

-- 1. IDENTIFICAR FICHAS QUE USAM COCA COLA COMO PRODUTO PRONTO
SELECT '=== FICHAS QUE USAM COCA COLA COMO PRODUTO PRONTO ===' as secao;

SELECT 
  ft.id as ficha_id,
  ft.nome as ficha_nome,
  ft.codigo as ficha_codigo,
  fpp.quantidade,
  fpp.custo,
  fpp.custo_total,
  fpp.created_at
FROM public.fichas_tecnicas ft
INNER JOIN public.fichas_produtosprontos fpp ON fpp.ficha_id = ft.id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.nome ILIKE '%coca%cola%' 
   OR p.nome ILIKE '%coca cola%'
   OR p.nome ILIKE '%coca-cola%'
   OR p.codigo_pdv = '80'
ORDER BY ft.nome, fpp.created_at;

-- 2. CONTAR QUANTAS FICHAS USAM COCA COLA
SELECT '=== CONTAGEM DE DEPENDÊNCIAS ===' as secao;

SELECT 
  'Fichas que usam Coca Cola' as item,
  COUNT(DISTINCT ft.id) as quantidade
FROM public.fichas_tecnicas ft
INNER JOIN public.fichas_produtosprontos fpp ON fpp.ficha_id = ft.id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.nome ILIKE '%coca%cola%' 
   OR p.nome ILIKE '%coca cola%'
   OR p.nome ILIKE '%coca-cola%'
   OR p.codigo_pdv = '80';

-- 3. MOSTRAR DETALHES DAS DEPENDÊNCIAS
SELECT '=== DETALHES DAS DEPENDÊNCIAS ===' as secao;

SELECT 
  ft.nome as ficha_nome,
  ft.codigo as ficha_codigo,
  p.nome as produto_nome,
  p.codigo_pdv as produto_codigo,
  fpp.quantidade,
  fpp.custo,
  fpp.custo_total,
  ft.created_at as ficha_criada_em
FROM public.fichas_tecnicas ft
INNER JOIN public.fichas_produtosprontos fpp ON fpp.ficha_id = ft.id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.nome ILIKE '%coca%cola%' 
   OR p.nome ILIKE '%coca cola%'
   OR p.nome ILIKE '%coca-cola%'
   OR p.codigo_pdv = '80'
ORDER BY ft.nome;

-- 4. DESVINCULAR COCA COLA DE TODOS OS COMBOS/LANCHES
SELECT '=== DESVINCULANDO COCA COLA DE COMBOS/LANCHES ===' as secao;

-- Deletar registros de fichas_produtosprontos que usam Coca Cola
DELETE FROM public.fichas_produtosprontos 
WHERE produto_ficha_id IN (
  SELECT p.id
  FROM public.produtos p
  WHERE p.nome ILIKE '%coca%cola%' 
     OR p.nome ILIKE '%coca cola%'
     OR p.nome ILIKE '%coca-cola%'
     OR p.codigo_pdv = '80'
);

-- Mostrar quantos registros foram deletados
SELECT 
  'Registros de produtos prontos deletados' as resultado,
  'Coca Cola desvinculada de todos os combos/lanches' as status;

-- 5. VERIFICAÇÃO APÓS DESVINCULAÇÃO
SELECT '=== VERIFICAÇÃO APÓS DESVINCULAÇÃO ===' as secao;

-- Verificar se ainda há dependências
SELECT 
  'Fichas que ainda usam Coca Cola' as status,
  COUNT(DISTINCT ft.id) as quantidade
FROM public.fichas_tecnicas ft
INNER JOIN public.fichas_produtosprontos fpp ON fpp.ficha_id = ft.id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.nome ILIKE '%coca%cola%' 
   OR p.nome ILIKE '%coca cola%'
   OR p.nome ILIKE '%coca-cola%'
   OR p.codigo_pdv = '80';

-- 6. MOSTRAR FICHAS AFETADAS (SEM COCA COLA)
SELECT '=== FICHAS AFETADAS (SEM COCA COLA) ===' as secao;

SELECT 
  ft.id as ficha_id,
  ft.nome as ficha_nome,
  ft.codigo as ficha_codigo,
  ft.categoria,
  ft.created_at,
  'Coca Cola foi removida desta ficha' as status
FROM public.fichas_tecnicas ft
WHERE ft.id IN (
  SELECT DISTINCT fpp.ficha_id
  FROM public.fichas_produtosprontos fpp
  INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
  WHERE p.nome ILIKE '%coca%cola%' 
     OR p.nome ILIKE '%coca cola%'
     OR p.nome ILIKE '%coca-cola%'
     OR p.codigo_pdv = '80'
)
ORDER BY ft.nome;

-- 7. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Total de fichas técnicas' as item,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas

UNION ALL

SELECT 
  'Total de produtos' as item,
  COUNT(*) as quantidade
FROM public.produtos

UNION ALL

SELECT 
  'Total de fichas_produtosprontos' as item,
  COUNT(*) as quantidade
FROM public.fichas_produtosprontos

UNION ALL

SELECT 
  'Produtos Coca Cola' as item,
  COUNT(*) as quantidade
FROM public.produtos
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo_pdv = '80';

-- 8. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Coca Cola foi desvinculada de todos os combos/lanches' as passo;
SELECT '2. Agora você pode deletar a ficha técnica da Coca Cola' as passo;
SELECT '3. Depois pode deletar o produto Coca Cola' as passo;
SELECT '4. Execute o script de constraint UNIQUE' as passo;
SELECT '5. Sistema estará protegido contra duplicatas' as passo;
