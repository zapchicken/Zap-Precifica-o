-- =====================================================
-- SCRIPT PARA LIMPAR DUPLICATAS ANTES DE ADICIONAR CONSTRAINT
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai limpar duplicatas ativas
-- para permitir a criação da constraint UNIQUE
-- NÃO APAGA dados, apenas desativa duplicatas
--
-- =====================================================

-- 1. VERIFICAR DUPLICATAS ATIVAS
SELECT '=== DUPLICATAS ATIVAS ===' as secao;

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

-- 2. IDENTIFICAR PRODUTOS PARA MANTER (MAIS RECENTE)
SELECT '=== PRODUTOS PARA MANTER ===' as secao;

WITH produtos_duplicados AS (
  SELECT 
    id,
    codigo_pdv,
    user_id,
    nome,
    created_at,
    updated_at,
    ficha_tecnica_id,
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
SELECT 
  id,
  codigo_pdv,
  user_id,
  nome,
  created_at,
  ficha_tecnica_id,
  CASE 
    WHEN ficha_tecnica_id IS NOT NULL THEN 'TEM FICHA TÉCNICA'
    ELSE 'SEM FICHA TÉCNICA'
  END as tipo,
  'SERÁ MANTIDO' as acao
FROM produtos_duplicados 
WHERE rn = 1
ORDER BY codigo_pdv, user_id;

-- 3. IDENTIFICAR PRODUTOS PARA DESATIVAR
SELECT '=== PRODUTOS PARA DESATIVAR ===' as secao;

WITH produtos_duplicados AS (
  SELECT 
    id,
    codigo_pdv,
    user_id,
    nome,
    created_at,
    updated_at,
    ficha_tecnica_id,
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
SELECT 
  id,
  codigo_pdv,
  user_id,
  nome,
  created_at,
  ficha_tecnica_id,
  CASE 
    WHEN ficha_tecnica_id IS NOT NULL THEN 'TEM FICHA TÉCNICA'
    ELSE 'SEM FICHA TÉCNICA'
  END as tipo,
  'SERÁ DESATIVADO' as acao
FROM produtos_duplicados 
WHERE rn > 1
ORDER BY codigo_pdv, user_id;

-- 4. EXECUTAR LIMPEZA DAS DUPLICATAS
SELECT '=== EXECUTANDO LIMPEZA ===' as secao;

-- Desativar produtos duplicados (manter apenas o mais recente ou com ficha técnica)
WITH produtos_duplicados AS (
  SELECT 
    id,
    codigo_pdv,
    user_id,
    nome,
    ficha_tecnica_id,
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
  FROM produtos_duplicados 
  WHERE rn > 1
);

-- Mostrar quantos produtos foram desativados
SELECT 
  'Produtos desativados' as resultado,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE status = 'inativo'
  AND observacoes LIKE '%DESATIVADO%';

-- 5. VERIFICAÇÃO APÓS LIMPEZA
SELECT '=== VERIFICAÇÃO APÓS LIMPEZA ===' as secao;

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
) duplicatas;

-- 7. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Duplicatas foram limpas' as passo;
SELECT '2. Agora pode executar o script de constraint UNIQUE' as passo;
SELECT '3. Execute: adicionar_constraint_unique_codigo_pdv.sql' as passo;
SELECT '4. A constraint será criada com sucesso' as passo;
