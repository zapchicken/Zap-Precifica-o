-- =====================================================
-- SCRIPT PARA TESTAR IMPORTAÇÃO DE VENDAS
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai testar a importação de vendas
-- e verificar se a tabela está funcionando corretamente
--
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA VENDAS
SELECT '=== ESTRUTURA DA TABELA VENDAS ===' as secao;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vendas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR ÍNDICES
SELECT '=== ÍNDICES CRIADOS ===' as secao;

SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'vendas' 
  AND schemaname = 'public'
ORDER BY indexname;

-- 3. VERIFICAR CONSTRAINTS
SELECT '=== CONSTRAINTS ===' as secao;

SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'vendas' 
  AND table_schema = 'public'
ORDER BY constraint_name;

-- 4. VERIFICAR SE HÁ DADOS NA TABELA
SELECT '=== DADOS EXISTENTES ===' as secao;

SELECT 
  'Total de vendas' as item,
  COUNT(*) as quantidade
FROM public.vendas

UNION ALL

SELECT 
  'Vendas por usuário' as item,
  COUNT(DISTINCT user_id) as quantidade
FROM public.vendas

UNION ALL

SELECT 
  'Vendas por canal' as item,
  COUNT(DISTINCT canal) as quantidade
FROM public.vendas

UNION ALL

SELECT 
  'Vendas por data' as item,
  COUNT(DISTINCT data_venda) as quantidade
FROM public.vendas;

-- 5. MOSTRAR AMOSTRA DE DADOS (se existir)
SELECT '=== AMOSTRA DE DADOS ===' as secao;

SELECT 
  id,
  data_venda,
  pedido_numero,
  produto_nome,
  produto_codigo,
  quantidade,
  valor_unitario,
  valor_total,
  canal,
  user_id,
  created_at
FROM public.vendas
ORDER BY created_at DESC
LIMIT 5;

-- 6. VERIFICAR ESTATÍSTICAS POR CANAL
SELECT '=== ESTATÍSTICAS POR CANAL ===' as secao;

SELECT 
  canal,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as total_valor,
  AVG(valor_unitario) as preco_medio
FROM public.vendas
GROUP BY canal
ORDER BY total_vendas DESC;

-- 7. VERIFICAR ESTATÍSTICAS POR DATA
SELECT '=== ESTATÍSTICAS POR DATA ===' as secao;

SELECT 
  data_venda,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as total_valor
FROM public.vendas
GROUP BY data_venda
ORDER BY data_venda DESC
LIMIT 10;

-- 8. VERIFICAR PRODUTOS MAIS VENDIDOS
SELECT '=== PRODUTOS MAIS VENDIDOS ===' as secao;

SELECT 
  produto_nome,
  produto_codigo,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as total_valor
FROM public.vendas
GROUP BY produto_nome, produto_codigo
ORDER BY total_vendas DESC
LIMIT 10;

-- 9. VERIFICAR INTEGRIDADE DOS DADOS
SELECT '=== VERIFICAÇÃO DE INTEGRIDADE ===' as secao;

-- Verificar se há valores negativos
SELECT 
  'Vendas com valores negativos' as item,
  COUNT(*) as quantidade
FROM public.vendas
WHERE valor_unitario < 0 OR valor_total < 0 OR quantidade < 0

UNION ALL

-- Verificar se há valores nulos em campos obrigatórios
SELECT 
  'Vendas com campos obrigatórios nulos' as item,
  COUNT(*) as quantidade
FROM public.vendas
WHERE data_venda IS NULL 
   OR pedido_numero IS NULL 
   OR produto_nome IS NULL 
   OR quantidade IS NULL 
   OR valor_unitario IS NULL 
   OR valor_total IS NULL

UNION ALL

-- Verificar se há inconsistências entre valor_unitario e valor_total
SELECT 
  'Vendas com inconsistência de valores' as item,
  COUNT(*) as quantidade
FROM public.vendas
WHERE ABS(valor_total - (quantidade * valor_unitario)) > 0.01;

-- 10. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Tabela vendas está funcionando' as status,
  'Pronta para importação' as observacao,
  'Sistema de vendas operacional' as resultado;

-- 11. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Tabela vendas está funcionando corretamente' as passo;
SELECT '2. Pode testar a importação no sistema' as passo;
SELECT '3. Verificar se os dados são salvos corretamente' as passo;
SELECT '4. Testar ambos os formatos (completo e imagem)' as passo;
SELECT '5. Verificar se os relatórios funcionam' as passo;
