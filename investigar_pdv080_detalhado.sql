-- =====================================================
-- SCRIPT PARA INVESTIGAR PDV080 ESPECIFICAMENTE
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script APENAS INVESTIGA o PDV080
-- NÃO FAZ NENHUMA ALTERAÇÃO no banco de dados
--
-- =====================================================

-- 1. BUSCAR TODOS OS PRODUTOS COM CÓDIGO 80
SELECT '=== TODOS OS PRODUTOS CÓDIGO 80 ===' as secao;

SELECT 
  id,
  codigo_pdv,
  nome,
  categoria,
  status,
  preco_custo,
  preco_venda,
  preco_venda_ifood,
  margem_lucro,
  origem,
  ficha_tecnica_id,
  user_id,
  created_at,
  updated_at,
  observacoes
FROM public.produtos 
WHERE codigo_pdv = '80'
ORDER BY created_at DESC;

-- 2. BUSCAR PRODUTOS COM NOME SIMILAR (COCA COLA)
SELECT '=== PRODUTOS COCA COLA ===' as secao;

SELECT 
  id,
  codigo_pdv,
  nome,
  categoria,
  status,
  preco_custo,
  preco_venda,
  created_at,
  updated_at
FROM public.produtos 
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca%'
   OR nome ILIKE '%cola%'
ORDER BY created_at DESC;

-- 3. VERIFICAR SE HÁ DUPLICATAS DO CÓDIGO 80
SELECT '=== DUPLICATAS DO CÓDIGO 80 ===' as secao;

SELECT 
  codigo_pdv,
  COUNT(*) as quantidade,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(nome, ' | ') as nomes,
  STRING_AGG(status, ' | ') as status_list
FROM public.produtos 
WHERE codigo_pdv = '80'
GROUP BY codigo_pdv;

-- 4. VERIFICAR FICHA TÉCNICA ASSOCIADA AO CÓDIGO 80
SELECT '=== FICHA TÉCNICA DO CÓDIGO 80 ===' as secao;

SELECT 
  ft.id,
  ft.nome,
  ft.codigo,
  ft.categoria,
  ft.ativo,
  ft.created_at,
  ft.updated_at
FROM public.fichas_tecnicas ft
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = '80';

-- 5. VERIFICAR SE CÓDIGO 80 É USADO COMO PRODUTO PRONTO
SELECT '=== CÓDIGO 80 COMO PRODUTO PRONTO ===' as secao;

SELECT 
  fpp.id,
  fpp.ficha_id,
  fpp.produto_ficha_id,
  fpp.quantidade,
  fpp.unidade,
  fpp.custo_unitario,
  fpp.custo_total,
  ft.nome as ficha_que_usa,
  ft.codigo as codigo_ficha,
  p.nome as produto_usado,
  p.codigo_pdv as codigo_produto
FROM public.fichas_produtosprontos fpp
INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.codigo_pdv = '80';

-- 6. VERIFICAR DEPENDÊNCIAS EM VENDAS (SE EXISTIR)
SELECT '=== VENDAS DO CÓDIGO 80 ===' as secao;

-- Verificar se existe tabela de vendas
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vendas'
) as tabela_vendas_existe;

-- Verificar colunas da tabela vendas (se existir)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vendas'
ORDER BY ordinal_position;

-- Se existir, verificar vendas do código 80 (com coluna correta)
/*
SELECT 
  v.id,
  v.produto_id,  -- ou v.produto_ficha_id, dependendo da estrutura
  v.quantidade,
  v.data_venda,
  p.nome as produto_vendido,
  p.codigo_pdv as codigo_produto
FROM public.vendas v
INNER JOIN public.produtos p ON p.id = v.produto_id  -- ou v.produto_ficha_id
WHERE p.codigo_pdv = '80'
LIMIT 10;
*/

-- 7. VERIFICAR RESTRIÇÕES DE CHAVE ESTRANGEIRA
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

-- 8. VERIFICAR SE HÁ REGISTROS ÓRFÃOS
SELECT '=== REGISTROS ÓRFÃOS ===' as secao;

-- Verificar fichas_insumos órfãs relacionadas ao código 80
SELECT 
  'fichas_insumos órfãs' as tabela,
  COUNT(*) as registros_orfaos
FROM public.fichas_insumos fi
LEFT JOIN public.fichas_tecnicas ft ON ft.id = fi.ficha_id
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = '80'
  AND ft.id IS NULL;

-- 9. RESUMO ESPECÍFICO DO CÓDIGO 80
SELECT '=== RESUMO DO CÓDIGO 80 ===' as secao;

SELECT 
  'Total de produtos código 80' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80'

UNION ALL

SELECT 
  'Total de produtos código 80 ativos' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'ativo'

UNION ALL

SELECT 
  'Total de produtos código 80 inativos' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'inativo'

UNION ALL

SELECT 
  'Total de fichas técnicas associadas' as item,
  COUNT(DISTINCT ft.id) as quantidade
FROM public.fichas_tecnicas ft
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = '80'

UNION ALL

SELECT 
  'Total de dependências em fichas_produtosprontos' as item,
  COUNT(*) as quantidade
FROM public.fichas_produtosprontos fpp
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.codigo_pdv = '80';

-- 10. VERIFICAR SE PODE SER DELETADO
SELECT '=== PODE SER DELETADO? ===' as secao;

-- Verificar se há dependências que impedem a exclusão
WITH dependencias_codigo80 AS (
  SELECT 
    p.id,
    p.codigo_pdv,
    p.nome,
    p.status,
    CASE 
      WHEN ft.id IS NOT NULL THEN 'Tem ficha técnica associada'
      ELSE 'Sem ficha técnica'
    END as tem_ficha,
    CASE 
      WHEN fpp.id IS NOT NULL THEN 'Usado como produto pronto'
      ELSE 'Não usado como produto pronto'
    END as usado_como_produto_pronto
  FROM public.produtos p
  LEFT JOIN public.fichas_tecnicas ft ON ft.id = p.ficha_tecnica_id
  LEFT JOIN public.fichas_produtosprontos fpp ON fpp.produto_ficha_id = p.id
  WHERE p.codigo_pdv = '80'
)
SELECT 
  'Análise de dependências' as tipo,
  id,
  codigo_pdv,
  nome,
  status,
  tem_ficha,
  usado_como_produto_pronto
FROM dependencias_codigo80;
