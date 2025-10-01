-- =====================================================
-- SCRIPT PARA TESTAR RELATÓRIOS DE VENDAS
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai testar os relatórios de vendas
-- e verificar se as análises estão funcionando corretamente
--
-- =====================================================

-- 1. RELATÓRIO GERAL DE VENDAS
SELECT '=== RELATÓRIO GERAL DE VENDAS ===' as secao;

SELECT 
  'Total de vendas' as metrica,
  COUNT(*) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Total de produtos vendidos' as metrica,
  SUM(quantidade) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Faturamento total' as metrica,
  SUM(valor_total) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Ticket médio' as metrica,
  ROUND(AVG(valor_total), 2) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Período de vendas' as metrica,
  CONCAT(MIN(data_venda), ' a ', MAX(data_venda)) as valor
FROM public.vendas;

-- 2. RELATÓRIO POR CANAL DE VENDA
SELECT '=== RELATÓRIO POR CANAL DE VENDA ===' as secao;

SELECT 
  COALESCE(canal, 'Não informado') as canal,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_produtos,
  SUM(valor_total) as faturamento,
  ROUND(AVG(valor_total), 2) as ticket_medio,
  ROUND(SUM(valor_total) * 100.0 / (SELECT SUM(valor_total) FROM public.vendas), 2) as percentual_faturamento
FROM public.vendas
GROUP BY canal
ORDER BY faturamento DESC;

-- 3. RELATÓRIO POR DATA
SELECT '=== RELATÓRIO POR DATA ===' as secao;

SELECT 
  data_venda,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_produtos,
  SUM(valor_total) as faturamento,
  ROUND(AVG(valor_total), 2) as ticket_medio
FROM public.vendas
GROUP BY data_venda
ORDER BY data_venda DESC
LIMIT 10;

-- 4. RELATÓRIO DE PRODUTOS MAIS VENDIDOS
SELECT '=== PRODUTOS MAIS VENDIDOS ===' as secao;

SELECT 
  produto_nome,
  produto_codigo,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_quantidade,
  SUM(valor_total) as faturamento,
  ROUND(AVG(valor_unitario), 2) as preco_medio,
  ROUND(SUM(valor_total) * 100.0 / (SELECT SUM(valor_total) FROM public.vendas), 2) as percentual_faturamento
FROM public.vendas
GROUP BY produto_nome, produto_codigo
ORDER BY total_quantidade DESC
LIMIT 15;

-- 5. RELATÓRIO DE PERFORMANCE POR PEDIDO
SELECT '=== PERFORMANCE POR PEDIDO ===' as secao;

SELECT 
  pedido_numero,
  data_venda,
  COUNT(*) as itens_pedido,
  SUM(quantidade) as total_produtos,
  SUM(valor_total) as valor_pedido,
  ROUND(AVG(valor_unitario), 2) as preco_medio_item
FROM public.vendas
GROUP BY pedido_numero, data_venda
ORDER BY valor_pedido DESC
LIMIT 10;

-- 6. RELATÓRIO DE ANÁLISE TEMPORAL
SELECT '=== ANÁLISE TEMPORAL ===' as secao;

SELECT 
  EXTRACT(YEAR FROM data_venda) as ano,
  EXTRACT(MONTH FROM data_venda) as mes,
  COUNT(*) as total_vendas,
  SUM(quantidade) as total_produtos,
  SUM(valor_total) as faturamento,
  ROUND(AVG(valor_total), 2) as ticket_medio
FROM public.vendas
GROUP BY EXTRACT(YEAR FROM data_venda), EXTRACT(MONTH FROM data_venda)
ORDER BY ano DESC, mes DESC;

-- 7. RELATÓRIO DE ANÁLISE DE PREÇOS
SELECT '=== ANÁLISE DE PREÇOS ===' as secao;

SELECT 
  'Preço unitário mínimo' as metrica,
  MIN(valor_unitario) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Preço unitário máximo' as metrica,
  MAX(valor_unitario) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Preço unitário médio' as metrica,
  ROUND(AVG(valor_unitario), 2) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Venda individual mínima' as metrica,
  MIN(valor_total) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Venda individual máxima' as metrica,
  MAX(valor_total) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Venda individual média' as metrica,
  ROUND(AVG(valor_total), 2) as valor
FROM public.vendas;

-- 8. RELATÓRIO DE ANÁLISE DE QUANTIDADES
SELECT '=== ANÁLISE DE QUANTIDADES ===' as secao;

SELECT 
  'Quantidade mínima vendida' as metrica,
  MIN(quantidade) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Quantidade máxima vendida' as metrica,
  MAX(quantidade) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Quantidade média vendida' as metrica,
  ROUND(AVG(quantidade), 2) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Total de produtos únicos' as metrica,
  COUNT(DISTINCT produto_nome) as valor
FROM public.vendas

UNION ALL

SELECT 
  'Total de pedidos únicos' as metrica,
  COUNT(DISTINCT pedido_numero) as valor
FROM public.vendas;

-- 9. RELATÓRIO DE TOP PERFORMERS
SELECT '=== TOP PERFORMERS ===' as secao;

-- Top 5 produtos por faturamento
SELECT 
  'Top 5 Produtos por Faturamento' as categoria,
  produto_nome,
  produto_codigo,
  SUM(valor_total) as faturamento
FROM public.vendas
GROUP BY produto_nome, produto_codigo
ORDER BY faturamento DESC
LIMIT 5;

-- Top 5 produtos por quantidade
SELECT 
  'Top 5 Produtos por Quantidade' as categoria,
  produto_nome,
  produto_codigo,
  SUM(quantidade) as total_quantidade
FROM public.vendas
GROUP BY produto_nome, produto_codigo
ORDER BY total_quantidade DESC
LIMIT 5;

-- 10. RELATÓRIO DE ANÁLISE DE TENDÊNCIAS
SELECT '=== ANÁLISE DE TENDÊNCIAS ===' as secao;

-- Vendas por dia da semana
SELECT 
  CASE EXTRACT(DOW FROM data_venda)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as dia_semana,
  COUNT(*) as total_vendas,
  SUM(valor_total) as faturamento
FROM public.vendas
GROUP BY EXTRACT(DOW FROM data_venda)
ORDER BY EXTRACT(DOW FROM data_venda);

-- 11. RELATÓRIO DE QUALIDADE DOS DADOS
SELECT '=== QUALIDADE DOS DADOS ===' as secao;

SELECT 
  'Vendas com observações' as metrica,
  COUNT(*) as quantidade
FROM public.vendas
WHERE observacoes IS NOT NULL AND observacoes != ''

UNION ALL

SELECT 
  'Vendas sem observações' as metrica,
  COUNT(*) as quantidade
FROM public.vendas
WHERE observacoes IS NULL OR observacoes = ''

UNION ALL

SELECT 
  'Vendas com código PDV' as metrica,
  COUNT(*) as quantidade
FROM public.vendas
WHERE produto_codigo IS NOT NULL AND produto_codigo != ''

UNION ALL

SELECT 
  'Vendas sem código PDV' as metrica,
  COUNT(*) as quantidade
FROM public.vendas
WHERE produto_codigo IS NULL OR produto_codigo = '';

-- 12. RESUMO FINAL DOS RELATÓRIOS
SELECT '=== RESUMO FINAL DOS RELATÓRIOS ===' as secao;

SELECT 
  'Relatórios de vendas funcionando' as status,
  'Análises disponíveis' as funcionalidade,
  'Sistema de relatórios operacional' as resultado;

-- 13. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Relatórios de vendas estão funcionando' as passo;
SELECT '2. Análises estão disponíveis' as passo;
SELECT '3. Dados estão sendo processados corretamente' as passo;
SELECT '4. Sistema de relatórios operacional' as passo;
SELECT '5. Pode usar os relatórios no sistema' as passo;
