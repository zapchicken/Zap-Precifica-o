-- =====================================================
-- SCRIPT PARA VERIFICAR IMPORTAÇÃO SILENCIOSA
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai verificar se a importação
-- está funcionando silenciosamente (sem erros visíveis)
--
-- =====================================================

-- 1. VERIFICAR SE HÁ DADOS NA TABELA VENDAS
SELECT '=== VERIFICAÇÃO DE DADOS NA TABELA VENDAS ===' as secao;

SELECT 
  'Total de vendas' as item,
  COUNT(*) as quantidade
FROM public.vendas

UNION ALL

SELECT 
  'Vendas de 30/09/2025' as item,
  COUNT(*) as quantidade
FROM public.vendas
WHERE data_venda = '2025-09-30'

UNION ALL

SELECT 
  'Vendas de julho a setembro 2025' as item,
  COUNT(*) as quantidade
FROM public.vendas
WHERE data_venda >= '2025-07-01' 
  AND data_venda <= '2025-09-30';

-- 2. VERIFICAR DADOS RECENTES
SELECT '=== DADOS RECENTES ===' as secao;

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
  created_at
FROM public.vendas
ORDER BY created_at DESC
LIMIT 10;

-- 3. VERIFICAR SE HÁ DADOS DO PERÍODO JUL-SET 2025
SELECT '=== DADOS DO PERÍODO JUL-SET 2025 ===' as secao;

SELECT 
  data_venda,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_produtos,
  SUM(valor_total) as faturamento
FROM public.vendas
WHERE data_venda >= '2025-07-01' 
  AND data_venda <= '2025-09-30'
GROUP BY data_venda
ORDER BY data_venda DESC;

-- 4. VERIFICAR SE HÁ DADOS DE 30/09/2025
SELECT '=== DADOS DE 30/09/2025 ===' as secao;

SELECT 
  produto_nome,
  produto_codigo,
  quantidade,
  valor_unitario,
  valor_total,
  canal,
  created_at
FROM public.vendas
WHERE data_venda = '2025-09-30'
ORDER BY created_at DESC;

-- 5. VERIFICAR SE HÁ DADOS COM CANAL BALCÃO
SELECT '=== DADOS COM CANAL BALCÃO ===' as secao;

SELECT 
  canal,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_produtos,
  SUM(valor_total) as faturamento
FROM public.vendas
WHERE data_venda = '2025-09-30'
GROUP BY canal;

-- 6. VERIFICAR SE HÁ DADOS COM PEDIDOS GERADOS AUTOMATICAMENTE
SELECT '=== PEDIDOS GERADOS AUTOMATICAMENTE ===' as secao;

SELECT 
  pedido_numero,
  COUNT(*) as itens_pedido,
  SUM(quantidade) as total_produtos,
  SUM(valor_total) as valor_pedido
FROM public.vendas
WHERE data_venda = '2025-09-30'
GROUP BY pedido_numero
ORDER BY pedido_numero;

-- 7. VERIFICAR SE HÁ DADOS COM PRODUTOS DO TEMPLATE
SELECT '=== PRODUTOS DO TEMPLATE ===' as secao;

SELECT 
  produto_nome,
  produto_codigo,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as faturamento
FROM public.vendas
WHERE data_venda = '2025-09-30'
  AND (produto_nome ILIKE '%SuperBalde%' 
    OR produto_nome ILIKE '%Balde%'
    OR produto_nome ILIKE '%Combo%'
    OR produto_nome ILIKE '%COXINHAS%'
    OR produto_nome ILIKE '%Bacon%'
    OR produto_nome ILIKE '%Batatas%'
    OR produto_nome ILIKE '%ZAPBOX%')
GROUP BY produto_nome, produto_codigo
ORDER BY total_quantidade DESC;

-- 8. VERIFICAR SE HÁ DADOS COM CÓDIGOS PDV DO TEMPLATE
SELECT '=== CÓDIGOS PDV DO TEMPLATE ===' as secao;

SELECT 
  produto_codigo,
  produto_nome,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as faturamento
FROM public.vendas
WHERE data_venda = '2025-09-30'
  AND produto_codigo IN ('122', '121', '146', '119', '120', '243', '370', '147', '31', '242', '54', '43', '42')
GROUP BY produto_codigo, produto_nome
ORDER BY total_quantidade DESC;

-- 9. VERIFICAR SE HÁ DADOS COM VALORES DO TEMPLATE
SELECT '=== VALORES DO TEMPLATE ===' as secao;

SELECT 
  valor_unitario,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as faturamento
FROM public.vendas
WHERE data_venda = '2025-09-30'
  AND valor_unitario IN (93.02, 75.10, 124.38, 61.08, 81.95, 91.04, 72.70, 114.66, 45.02, 81.87, 9.80, 34.55, 31.90)
GROUP BY valor_unitario
ORDER BY valor_unitario;

-- 10. VERIFICAR SE HÁ DADOS COM QUANTIDADES DO TEMPLATE
SELECT '=== QUANTIDADES DO TEMPLATE ===' as secao;

SELECT 
  quantidade,
  COUNT(*) as total_vendas,
  SUM(valor_total) as faturamento
FROM public.vendas
WHERE data_venda = '2025-09-30'
  AND quantidade IN (201, 208, 99, 155, 87, 56, 61, 37, 66, 35, 268, 74, 72)
GROUP BY quantidade
ORDER BY quantidade DESC;

-- 11. VERIFICAR SE HÁ DADOS COM VALORES TOTAIS DO TEMPLATE
SELECT '=== VALORES TOTAIS DO TEMPLATE ===' as secao;

SELECT 
  valor_total,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade
FROM public.vendas
WHERE data_venda = '2025-09-30'
  AND valor_total IN (18696.19, 15621.50, 12313.80, 9466.66, 7129.30, 5098.40, 4434.90, 4242.30, 2971.10, 2865.40, 2625.40, 2556.60, 2296.80)
GROUP BY valor_total
ORDER BY valor_total DESC;

-- 12. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Importação funcionando silenciosamente' as status,
  'Dados podem estar sendo salvos' as observacao,
  'Verificar se há dados na tabela' as acao;

-- 13. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Verificar se há dados na tabela vendas' as passo;
SELECT '2. Verificar se os dados estão corretos' as passo;
SELECT '3. Verificar se os relatórios funcionam' as passo;
SELECT '4. Verificar se há mensagens de sucesso' as passo;
SELECT '5. Verificar se há problemas de interface' as passo;
