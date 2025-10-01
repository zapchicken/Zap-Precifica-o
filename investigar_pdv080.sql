-- =====================================================
-- SCRIPT PARA INVESTIGAR PROBLEMA COM PDV080 (COCA COLA)
-- =====================================================
-- 
-- Este script vai investigar todas as dependências e relacionamentos
-- que podem estar impedindo a exclusão do produto PDV080
--
-- =====================================================

-- 1. VERIFICAR SE O PRODUTO PDV080 EXISTE E SUAS INFORMAÇÕES
SELECT '=== INFORMAÇÕES DO PRODUTO PDV080 ===' as secao;

SELECT 
  id,
  codigo_pdv,
  nome,
  categoria,
  status,
  ficha_tecnica_id,
  created_at,
  updated_at
FROM public.produtos 
WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
ORDER BY created_at DESC;

-- 2. VERIFICAR SE HÁ DUPLICATAS DO PRODUTO
SELECT '=== VERIFICAR DUPLICATAS ===' as secao;

SELECT 
  codigo_pdv,
  nome,
  COUNT(*) as quantidade_duplicatas,
  STRING_AGG(id::text, ', ') as ids_duplicados
FROM public.produtos 
WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
GROUP BY codigo_pdv, nome
HAVING COUNT(*) > 1;

-- 3. VERIFICAR FICHA TÉCNICA ASSOCIADA
SELECT '=== FICHA TÉCNICA ASSOCIADA ===' as secao;

SELECT 
  ft.id,
  ft.codigo,
  ft.nome,
  ft.ativo,
  ft.created_at
FROM public.fichas_tecnicas ft
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%';

-- 4. VERIFICAR DEPENDÊNCIAS EM FICHAS_PRODUTOSPRONTOS
SELECT '=== DEPENDÊNCIAS EM FICHAS_PRODUTOSPRONTOS ===' as secao;

SELECT 
  fpp.id,
  fpp.ficha_id,
  fpp.produto_ficha_id,
  ft.nome as ficha_que_usa,
  ft.codigo as codigo_ficha_que_usa,
  p.nome as produto_usado,
  p.codigo_pdv as codigo_produto_usado
FROM public.fichas_produtosprontos fpp
INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%';

-- 5. VERIFICAR DEPENDÊNCIAS EM VENDAS (se existir tabela de vendas)
SELECT '=== DEPENDÊNCIAS EM VENDAS ===' as secao;

-- Verificar se existe tabela de vendas
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vendas'
) as tabela_vendas_existe;

-- Se existir, verificar dependências
SELECT 
  v.id,
  v.produto_id,
  v.quantidade,
  v.data_venda,
  p.nome as produto_vendido,
  p.codigo_pdv as codigo_produto
FROM public.vendas v
INNER JOIN public.produtos p ON p.id = v.produto_id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%'
LIMIT 10;

-- 6. VERIFICAR RESTRIÇÕES DE CHAVE ESTRANGEIRA
SELECT '=== RESTRIÇÕES DE CHAVE ESTRANGEIRA ===' as secao;

SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name = 'produtos' 
       OR ccu.table_name = 'produtos'
       OR tc.table_name LIKE '%fichas%'
       OR ccu.table_name LIKE '%fichas%');

-- 7. VERIFICAR SE HÁ REGISTROS ÓRFÃOS
SELECT '=== VERIFICAR REGISTROS ÓRFÃOS ===' as secao;

-- Verificar fichas_insumos órfãs
SELECT 
  'fichas_insumos' as tabela,
  COUNT(*) as registros_orfaos
FROM public.fichas_insumos fi
LEFT JOIN public.fichas_tecnicas ft ON ft.id = fi.ficha_id
WHERE ft.id IS NULL;

-- Verificar fichas_bases órfãs
SELECT 
  'fichas_bases' as tabela,
  COUNT(*) as registros_orfaos
FROM public.fichas_bases fb
LEFT JOIN public.fichas_tecnicas ft ON ft.id = fb.ficha_id
WHERE ft.id IS NULL;

-- Verificar fichas_produtosprontos órfãs
SELECT 
  'fichas_produtosprontos' as tabela,
  COUNT(*) as registros_orfaos
FROM public.fichas_produtosprontos fpp
LEFT JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
WHERE ft.id IS NULL;

-- 8. VERIFICAR STATUS E ATIVO/INATIVO
SELECT '=== STATUS E ATIVO/INATIVO ===' as secao;

SELECT 
  'produtos' as tabela,
  status,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
GROUP BY status;

SELECT 
  'fichas_tecnicas' as tabela,
  ativo,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas ft
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%'
GROUP BY ativo;

-- 9. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Total de produtos PDV080/Coca Cola' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'

UNION ALL

SELECT 
  'Total de fichas técnicas associadas' as item,
  COUNT(DISTINCT ft.id) as quantidade
FROM public.fichas_tecnicas ft
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%'

UNION ALL

SELECT 
  'Total de dependências em fichas_produtosprontos' as item,
  COUNT(*) as quantidade
FROM public.fichas_produtosprontos fpp
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%';
