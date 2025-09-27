-- Verificar dados da tabela vendas
-- Contar total de vendas
SELECT 
    'Total de vendas' as info,
    COUNT(*) as total_registros
FROM vendas;

-- Verificar produtos únicos e seus códigos
SELECT 
    'Produtos únicos com códigos' as info,
    produto_nome,
    produto_codigo,
    COUNT(*) as total_vendas,
    SUM(quantidade) as quantidade_total,
    SUM(valor_total) as valor_total
FROM vendas 
WHERE produto_codigo IS NOT NULL
GROUP BY produto_nome, produto_codigo
ORDER BY valor_total DESC
LIMIT 10;

-- Verificar produtos sem código
SELECT 
    'Produtos sem código' as info,
    produto_nome,
    COUNT(*) as total_vendas,
    SUM(quantidade) as quantidade_total,
    SUM(valor_total) as valor_total
FROM vendas 
WHERE produto_codigo IS NULL
GROUP BY produto_nome
ORDER BY valor_total DESC
LIMIT 10;

-- Verificar amostra de dados
SELECT 
    'Amostra de dados' as info,
    data_venda,
    produto_nome,
    produto_codigo,
    quantidade,
    valor_total,
    canal
FROM vendas 
ORDER BY data_venda DESC
LIMIT 5;
