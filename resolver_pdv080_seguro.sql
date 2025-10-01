-- =====================================================
-- SCRIPT PARA RESOLVER PROBLEMA DO PDV080 DE FORMA SEGURA
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai tentar resolver o problema do PDV080
-- ⚠️  de forma segura, verificando todas as dependências primeiro
-- ⚠️  Execute apenas se tiver certeza absoluta!
--
-- =====================================================

-- 1. PRIMEIRO, VAMOS IDENTIFICAR TODOS OS REGISTROS PROBLEMÁTICOS
SELECT '=== IDENTIFICANDO REGISTROS PROBLEMÁTICOS ===' as secao;

-- Buscar todos os produtos PDV080/Coca Cola
WITH produtos_problematicos AS (
  SELECT id, codigo_pdv, nome, ficha_tecnica_id, status
  FROM public.produtos 
  WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
)
SELECT 
  'Produtos encontrados' as tipo,
  id,
  codigo_pdv,
  nome,
  status,
  ficha_tecnica_id
FROM produtos_problematicos;

-- 2. VERIFICAR SE HÁ DEPENDÊNCIAS QUE IMPEDEM A EXCLUSÃO
SELECT '=== VERIFICANDO DEPENDÊNCIAS ===' as secao;

-- Verificar se o produto é usado como "produto pronto" em outras fichas
WITH produtos_problematicos AS (
  SELECT id, codigo_pdv, nome
  FROM public.produtos 
  WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
)
SELECT 
  'Dependências em fichas_produtosprontos' as tipo,
  fpp.id,
  ft.nome as ficha_que_usa,
  ft.codigo as codigo_ficha,
  p.nome as produto_usado,
  p.codigo_pdv as codigo_produto
FROM public.fichas_produtosprontos fpp
INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
INNER JOIN produtos_problematicos p ON p.id = fpp.produto_ficha_id;

-- 3. VERIFICAR SE HÁ VENDAS ASSOCIADAS (se a tabela existir)
SELECT '=== VERIFICANDO VENDAS ===' as secao;

-- Verificar se existe tabela de vendas
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vendas'
) as tabela_vendas_existe;

-- Se existir, verificar vendas
SELECT 
  'Vendas encontradas' as tipo,
  v.id,
  v.produto_id,
  v.quantidade,
  v.data_venda,
  p.nome as produto_vendido
FROM public.vendas v
INNER JOIN public.produtos p ON p.id = v.produto_id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%'
LIMIT 5;

-- 4. ESTRATÉGIA DE RESOLUÇÃO SEGURA
SELECT '=== ESTRATÉGIA DE RESOLUÇÃO ===' as secao;

-- Opção 1: Desativar em vez de deletar (mais seguro)
SELECT 'OPÇÃO 1: DESATIVAR PRODUTOS (RECOMENDADO)' as estrategia;

-- Opção 2: Deletar dependências primeiro, depois o produto
SELECT 'OPÇÃO 2: DELETAR DEPENDÊNCIAS PRIMEIRO' as estrategia;

-- Opção 3: Forçar exclusão desabilitando verificações de FK
SELECT 'OPÇÃO 3: FORÇAR EXCLUSÃO (PERIGOSO)' as estrategia;

-- 5. SCRIPT PARA DESATIVAR (OPÇÃO MAIS SEGURA)
SELECT '=== SCRIPT PARA DESATIVAR (EXECUTAR SE DESEJADO) ===' as secao;

-- Desativar produtos PDV080/Coca Cola
/*
UPDATE public.produtos 
SET status = 'inativo', updated_at = NOW()
WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%';
*/

-- Desativar fichas técnicas associadas
/*
UPDATE public.fichas_tecnicas 
SET ativo = false, updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT ficha_tecnica_id 
  FROM public.produtos 
  WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
  AND ficha_tecnica_id IS NOT NULL
);
*/

-- 6. SCRIPT PARA DELETAR DEPENDÊNCIAS PRIMEIRO (SE NECESSÁRIO)
SELECT '=== SCRIPT PARA DELETAR DEPENDÊNCIAS (EXECUTAR COM CUIDADO) ===' as secao;

-- Deletar dependências em fichas_produtosprontos
/*
DELETE FROM public.fichas_produtosprontos 
WHERE produto_ficha_id IN (
  SELECT id FROM public.produtos 
  WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
);
*/

-- Deletar relacionamentos em fichas_insumos (se houver)
/*
DELETE FROM public.fichas_insumos 
WHERE ficha_id IN (
  SELECT DISTINCT ficha_tecnica_id 
  FROM public.produtos 
  WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
  AND ficha_tecnica_id IS NOT NULL
);
*/

-- Deletar relacionamentos em fichas_bases (se houver)
/*
DELETE FROM public.fichas_bases 
WHERE ficha_id IN (
  SELECT DISTINCT ficha_tecnica_id 
  FROM public.produtos 
  WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
  AND ficha_tecnica_id IS NOT NULL
);
*/

-- 7. SCRIPT PARA DELETAR PRODUTOS E FICHAS (ÚLTIMA OPÇÃO)
SELECT '=== SCRIPT PARA DELETAR (EXECUTAR APENAS SE NECESSÁRIO) ===' as secao;

-- Deletar fichas técnicas associadas
/*
DELETE FROM public.fichas_tecnicas 
WHERE id IN (
  SELECT DISTINCT ficha_tecnica_id 
  FROM public.produtos 
  WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%'
  AND ficha_tecnica_id IS NOT NULL
);
*/

-- Deletar produtos
/*
DELETE FROM public.produtos 
WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%';
*/

-- 8. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as secao;

SELECT 
  'Produtos restantes' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = 'PDV080' OR nome ILIKE '%coca%cola%';

SELECT 
  'Fichas técnicas restantes' as item,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas ft
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = 'PDV080' OR p.nome ILIKE '%coca%cola%';
