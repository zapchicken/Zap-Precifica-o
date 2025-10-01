-- =====================================================
-- SCRIPT PARA VERIFICAR E LIMPAR DUPLICATAS FINAL
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai verificar e limpar TODAS as duplicatas
-- para permitir a criação da constraint UNIQUE
--
-- =====================================================

-- 1. VERIFICAR DUPLICATAS ESPECÍFICAS DO CÓDIGO 80
SELECT '=== DUPLICATAS DO CÓDIGO 80 ===' as secao;

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

-- 2. VERIFICAR TODAS AS DUPLICATAS ATIVAS
SELECT '=== TODAS AS DUPLICATAS ATIVAS ===' as secao;

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

-- 3. FORÇAR DESATIVAÇÃO DE TODAS AS DUPLICATAS
SELECT '=== FORÇANDO DESATIVAÇÃO DE DUPLICATAS ===' as secao;

-- Desativar TODOS os produtos duplicados, mantendo apenas 1 por código_pdv + user_id
WITH produtos_para_manter AS (
  SELECT 
    id,
    codigo_pdv,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY codigo_pdv, user_id 
      ORDER BY 
        CASE WHEN ficha_tecnica_id IS NOT NULL THEN 0 ELSE 1 END, -- Priorizar com ficha técnica
        created_at DESC, 
        updated_at DESC
    ) as rn
  FROM public.produtos 
  WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
    AND status = 'ativo'
)
UPDATE public.produtos 
SET 
  status = 'inativo',
  observacoes = COALESCE(observacoes, '') || ' [DESATIVADO - Duplicata removida para constraint UNIQUE]',
  updated_at = NOW()
WHERE id IN (
  SELECT id 
  FROM produtos_para_manter 
  WHERE rn > 1
);

-- 4. VERIFICAÇÃO APÓS DESATIVAÇÃO
SELECT '=== VERIFICAÇÃO APÓS DESATIVAÇÃO ===' as secao;

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

-- Mostrar produtos ativos restantes
SELECT 
  'Produtos ativos restantes' as status,
  codigo_pdv,
  user_id,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''
  AND status = 'ativo'
GROUP BY codigo_pdv, user_id
ORDER BY codigo_pdv;

-- 5. VERIFICAR ESPECIFICAMENTE O CÓDIGO 80
SELECT '=== VERIFICAÇÃO ESPECÍFICA DO CÓDIGO 80 ===' as secao;

SELECT 
  'Produtos código 80 ativos' as status,
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
  created_at
FROM public.produtos 
WHERE codigo_pdv = '80'
ORDER BY status, created_at DESC;

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
) duplicatas

UNION ALL

SELECT 
  'Produtos código 80 ativos' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'ativo';

-- 7. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Execute este script para limpar duplicatas' as passo;
SELECT '2. Verifique se restou apenas 1 produto ativo por código' as passo;
SELECT '3. Execute novamente o script de constraint UNIQUE' as passo;
SELECT '4. A constraint será criada com sucesso' as passo;
