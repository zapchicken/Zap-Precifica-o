-- =====================================================
-- SCRIPT PARA IDENTIFICAR DUPLICATAS DE CÓDIGO PDV
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script APENAS IDENTIFICA duplicatas
-- NÃO FAZ NENHUMA ALTERAÇÃO no banco de dados
-- Use para entender o problema antes de resolver
--
-- =====================================================

-- 1. IDENTIFICAR TODAS AS DUPLICATAS
SELECT '=== TODAS AS DUPLICATAS DE CÓDIGO PDV ===' as secao;

SELECT 
  codigo_pdv,
  COUNT(*) as quantidade_duplicatas,
  STRING_AGG(id::text, ', ') as ids_duplicados,
  STRING_AGG(nome, ' | ') as nomes_duplicados,
  STRING_AGG(status, ' | ') as status_duplicados
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''
GROUP BY codigo_pdv
HAVING COUNT(*) > 1
ORDER BY quantidade_duplicatas DESC, codigo_pdv;

-- 2. VERIFICAR ESPECIFICAMENTE O PDV080
SELECT '=== DUPLICATAS DO PDV080 ===' as secao;

SELECT 
  id,
  codigo_pdv,
  nome,
  categoria,
  status,
  preco_custo,
  preco_venda,
  created_at,
  updated_at,
  ficha_tecnica_id
FROM public.produtos 
WHERE codigo_pdv = 'PDV080'
ORDER BY created_at DESC;

-- 3. VERIFICAR DUPLICATAS ATIVAS (PROBLEMA REAL)
SELECT '=== DUPLICATAS ATIVAS (PROBLEMA REAL) ===' as secao;

SELECT 
  codigo_pdv,
  COUNT(*) as quantidade_ativas,
  STRING_AGG(id::text, ', ') as ids_ativas,
  STRING_AGG(nome, ' | ') as nomes_ativas
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''
  AND status = 'ativo'
GROUP BY codigo_pdv
HAVING COUNT(*) > 1
ORDER BY quantidade_ativas DESC, codigo_pdv;

-- 4. VERIFICAR SE HÁ CONSTRAINT UNIQUE
SELECT '=== VERIFICAR CONSTRAINT UNIQUE ===' as secao;

SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'produtos' 
  AND constraint_type = 'UNIQUE'
  AND constraint_name LIKE '%codigo_pdv%';

-- 5. RESUMO GERAL
SELECT '=== RESUMO GERAL ===' as secao;

SELECT 
  'Total de produtos' as item,
  COUNT(*) as quantidade
FROM public.produtos

UNION ALL

SELECT 
  'Total de produtos ativos' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE status = 'ativo'

UNION ALL

SELECT 
  'Total de produtos com código PDV' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''

UNION ALL

SELECT 
  'Total de códigos PDV únicos' as item,
  COUNT(DISTINCT codigo_pdv) as quantidade
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''

UNION ALL

SELECT 
  'Total de duplicatas de código PDV' as item,
  COUNT(*) as quantidade
FROM (
  SELECT codigo_pdv
  FROM public.produtos 
  WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
  GROUP BY codigo_pdv
  HAVING COUNT(*) > 1
) duplicatas;

-- 6. VERIFICAR DEPENDÊNCIAS DO PDV080
SELECT '=== DEPENDÊNCIAS DO PDV080 ===' as secao;

-- Verificar se o PDV080 é usado em fichas técnicas
SELECT 
  'Fichas técnicas que usam PDV080' as tipo,
  ft.id,
  ft.nome,
  ft.codigo,
  ft.ativo
FROM public.fichas_tecnicas ft
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = 'PDV080';

-- Verificar se o PDV080 é usado como produto pronto em outras fichas
SELECT 
  'Fichas que usam PDV080 como produto pronto' as tipo,
  ft.id,
  ft.nome,
  ft.codigo,
  fpp.quantidade,
  fpp.unidade
FROM public.fichas_produtosprontos fpp
INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.codigo_pdv = 'PDV080';

-- 7. ESTRATÉGIA RECOMENDADA
SELECT '=== ESTRATÉGIA RECOMENDADA ===' as secao;

SELECT '1. Desativar produtos duplicados (manter apenas o mais recente)' as passo;
SELECT '2. Adicionar constraint UNIQUE para prevenir futuras duplicatas' as passo;
SELECT '3. Corrigir código para validar antes de criar produtos' as passo;
SELECT '4. Testar se o PDV080 pode ser deletado após limpeza' as passo;
