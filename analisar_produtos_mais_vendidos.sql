-- Analisar produtos mais vendidos
-- Verificar todos os produtos únicos nas vendas
SELECT 
    'Produtos únicos nas vendas' as info,
    produto_nome,
    COUNT(*) as total_vendas,
    SUM(quantidade) as quantidade_total,
    SUM(valor_total) as valor_total
FROM vendas 
GROUP BY produto_nome
ORDER BY valor_total DESC
LIMIT 10;

-- Verificar se existem produtos com nomes incorretos
SELECT 
    'Produtos suspeitos' as info,
    produto_nome,
    COUNT(*) as total_vendas,
    SUM(quantidade) as quantidade_total,
    SUM(valor_total) as valor_total
FROM vendas 
WHERE produto_nome ILIKE '%chá%' 
   OR produto_nome ILIKE '%limoneto%'
   OR produto_nome ILIKE '%h2oh%'
   OR produto_nome ILIKE '%combo%'
GROUP BY produto_nome
ORDER BY valor_total DESC;

-- Verificar produtos cadastrados no catálogo
SELECT 
    'Produtos no catálogo' as info,
    nome,
    codigo_pdv,
    categoria,
    ativo
FROM produtos 
ORDER BY nome;

-- Verificar se há vendas com produtos não cadastrados
SELECT 
    'Vendas com produtos não cadastrados' as info,
    v.produto_nome,
    COUNT(*) as total_vendas,
    SUM(v.quantidade) as quantidade_total,
    SUM(v.valor_total) as valor_total,
    CASE 
        WHEN p.nome IS NULL THEN 'NÃO CADASTRADO'
        ELSE 'CADASTRADO'
    END as status
FROM vendas v
LEFT JOIN produtos p ON v.produto_nome = p.nome
GROUP BY v.produto_nome, p.nome
ORDER BY valor_total DESC
LIMIT 10;
