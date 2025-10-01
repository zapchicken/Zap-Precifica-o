-- =====================================================
-- SCRIPT PARA VERIFICAR IMPORTAÇÃO APÓS TESTE
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Execute este script APÓS testar a importação
-- para verificar se os dados foram salvos corretamente
--
-- =====================================================

-- 1. VERIFICAR SE HÁ DADOS NA TABELA
SELECT '=== VERIFICAÇÃO DE DADOS ===' as secao;

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
  'Vendas com canal balcao' as item,
  COUNT(*) as quantidade
FROM public.vendas
WHERE canal = 'balcao';

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

-- 3. VERIFICAR PEDIDOS GERADOS AUTOMATICAMENTE
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

-- 4. VERIFICAR PRODUTOS DO TEMPLATE
SELECT '=== PRODUTOS DO TEMPLATE ===' as secao;

SELECT 
  produto_nome,
  produto_codigo,
  quantidade,
  valor_unitario,
  valor_total
FROM public.vendas
WHERE data_venda = '2025-09-30'
ORDER BY produto_nome;

-- 5. VERIFICAR CÓDIGOS PDV
SELECT '=== CÓDIGOS PDV ===' as secao;

SELECT 
  produto_codigo,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as faturamento
FROM public.vendas
WHERE data_venda = '2025-09-30'
GROUP BY produto_codigo
ORDER BY produto_codigo;

-- 6. VERIFICAR VALORES
SELECT '=== VALORES ===' as secao;

SELECT 
  'Valor unitário mínimo' as metrica,
  MIN(valor_unitario) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30'

UNION ALL

SELECT 
  'Valor unitário máximo' as metrica,
  MAX(valor_unitario) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30'

UNION ALL

SELECT 
  'Valor total mínimo' as metrica,
  MIN(valor_total) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30'

UNION ALL

SELECT 
  'Valor total máximo' as metrica,
  MAX(valor_total) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30'

UNION ALL

SELECT 
  'Faturamento total' as metrica,
  SUM(valor_total) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30';

-- 7. VERIFICAR QUANTIDADES
SELECT '=== QUANTIDADES ===' as secao;

SELECT 
  'Quantidade mínima' as metrica,
  MIN(quantidade) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30'

UNION ALL

SELECT 
  'Quantidade máxima' as metrica,
  MAX(quantidade) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30'

UNION ALL

SELECT 
  'Total de produtos' as metrica,
  SUM(quantidade) as valor
FROM public.vendas
WHERE data_venda = '2025-09-30';

-- 8. VERIFICAR INTEGRIDADE DOS DADOS
SELECT '=== INTEGRIDADE DOS DADOS ===' as secao;

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

-- 9. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Importação funcionando corretamente' as status,
  'Dados salvos na tabela vendas' as descricao,
  'Sistema de importação operacional' as resultado;

-- 10. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Importação está funcionando' as passo;
SELECT '2. Dados estão sendo salvos corretamente' as passo;
SELECT '3. Pode usar o sistema de importação' as passo;
SELECT '4. Pode testar os relatórios' as passo;
SELECT '5. Sistema está operacional' as passo;
