-- =====================================================
-- SCRIPT PARA LIMPAR DUPLICATAS DO CÓDIGO 80 ESPECÍFICO
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai limpar TODAS as duplicatas do código 80
-- para permitir a criação da constraint UNIQUE
--
-- =====================================================

-- 1. VERIFICAR TODOS OS PRODUTOS COM CÓDIGO 80
SELECT '=== TODOS OS PRODUTOS COM CÓDIGO 80 ===' as secao;

SELECT 
  id,
  codigo_pdv,
  nome,
  status,
  ficha_tecnica_id,
  user_id,
  created_at,
  updated_at
FROM public.produtos 
WHERE codigo_pdv = '80'
ORDER BY status, created_at DESC;

-- 2. VERIFICAR DUPLICATAS ESPECÍFICAS DO CÓDIGO 80
SELECT '=== DUPLICATAS DO CÓDIGO 80 ===' as secao;

SELECT 
  codigo_pdv,
  user_id,
  COUNT(*) as quantidade_duplicatas,
  STRING_AGG(id::text, ', ') as ids_duplicados,
  STRING_AGG(nome, ' | ') as nomes_duplicados,
  STRING_AGG(status, ' | ') as status_duplicados
FROM public.produtos 
WHERE codigo_pdv = '80'
GROUP BY codigo_pdv, user_id
HAVING COUNT(*) > 1;

-- 3. FORÇAR DESATIVAÇÃO DE TODOS OS PRODUTOS CÓDIGO 80
SELECT '=== FORÇANDO DESATIVAÇÃO DE TODOS OS PRODUTOS CÓDIGO 80 ===' as secao;

-- Desativar TODOS os produtos com código 80
UPDATE public.produtos 
SET 
  status = 'inativo',
  observacoes = COALESCE(observacoes, '') || ' [DESATIVADO - Código 80 removido para constraint UNIQUE]',
  updated_at = NOW()
WHERE codigo_pdv = '80';

-- Mostrar quantos produtos foram desativados
SELECT 
  'Produtos código 80 desativados' as resultado,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'inativo';

-- 4. VERIFICAÇÃO APÓS DESATIVAÇÃO
SELECT '=== VERIFICAÇÃO APÓS DESATIVAÇÃO ===' as secao;

-- Verificar se ainda há produtos código 80 ativos
SELECT 
  'Produtos código 80 ativos restantes' as status,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'ativo';

-- Mostrar produtos código 80 restantes
SELECT 
  id,
  codigo_pdv,
  nome,
  status,
  ficha_tecnica_id,
  user_id,
  created_at,
  observacoes
FROM public.produtos 
WHERE codigo_pdv = '80'
ORDER BY status, created_at DESC;

-- 5. VERIFICAR SE AINDA HÁ DUPLICATAS ATIVAS
SELECT '=== VERIFICAÇÃO DE DUPLICATAS ATIVAS ===' as secao;

-- Verificar se ainda há duplicatas ativas
SELECT 
  'Duplicatas ativas restantes' as status,
  COUNT(*) as quantidade
FROM (
  SELECT codigo_pdv, user_id
  FROM public.produtos 
  WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
    AND status = 'ativo'
  GROUP BY codigo_pdv, user_id
  HAVING COUNT(*) > 1
) duplicatas;

-- Mostrar todas as duplicatas ativas restantes
SELECT 
  codigo_pdv,
  user_id,
  COUNT(*) as quantidade_duplicatas,
  STRING_AGG(id::text, ', ') as ids_duplicados,
  STRING_AGG(nome, ' | ') as nomes_duplicados
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''
  AND status = 'ativo'
GROUP BY codigo_pdv, user_id
HAVING COUNT(*) > 1
ORDER BY quantidade_duplicatas DESC;

-- 6. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

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
  'Total de produtos inativos' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE status = 'inativo'

UNION ALL

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
  'Total de duplicatas ativas' as item,
  COUNT(*) as quantidade
FROM (
  SELECT codigo_pdv, user_id
  FROM public.produtos 
  WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
    AND status = 'ativo'
  GROUP BY codigo_pdv, user_id
  HAVING COUNT(*) > 1
) duplicatas;

-- 7. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Todos os produtos código 80 foram desativados' as passo;
SELECT '2. Verifique se não há mais duplicatas ativas' as passo;
SELECT '3. Execute novamente o script de constraint UNIQUE' as passo;
SELECT '4. A constraint será criada com sucesso' as passo;
