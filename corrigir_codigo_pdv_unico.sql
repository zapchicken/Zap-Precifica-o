-- =====================================================
-- SCRIPT PARA CORRIGIR PROBLEMA DE CÓDIGO PDV DUPLICADO
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai:
-- 1. Identificar duplicatas de código PDV
-- 2. Limpar duplicatas mantendo apenas o mais recente
-- 3. Adicionar constraint UNIQUE para evitar futuras duplicatas
--
-- =====================================================

-- 1. IDENTIFICAR DUPLICATAS DE CÓDIGO PDV
SELECT '=== IDENTIFICANDO DUPLICATAS ===' as secao;

SELECT 
  codigo_pdv,
  COUNT(*) as quantidade_duplicatas,
  STRING_AGG(id::text, ', ') as ids_duplicados,
  STRING_AGG(nome, ' | ') as nomes_duplicados
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''
GROUP BY codigo_pdv
HAVING COUNT(*) > 1
ORDER BY quantidade_duplicatas DESC;

-- 2. VERIFICAR DUPLICATAS ESPECÍFICAS DO PDV080
SELECT '=== DUPLICATAS PDV080 ===' as secao;

SELECT 
  id,
  codigo_pdv,
  nome,
  categoria,
  status,
  created_at,
  updated_at
FROM public.produtos 
WHERE codigo_pdv = 'PDV080'
ORDER BY created_at DESC;

-- 3. ESTRATÉGIA DE LIMPEZA (MANTER APENAS O MAIS RECENTE)
SELECT '=== ESTRATÉGIA DE LIMPEZA ===' as secao;

-- Para cada código PDV duplicado, manter apenas o registro mais recente
-- e desativar os outros

-- 4. SCRIPT PARA DESATIVAR DUPLICATAS (MANTÉM DADOS, APENAS DESATIVA)
SELECT '=== SCRIPT PARA DESATIVAR DUPLICATAS ===' as secao;

-- ⚠️  IMPORTANTE: Este script NÃO APAGA nada, apenas DESATIVA produtos duplicados
-- Mantém apenas o produto mais recente ativo, desativa os outros

-- Desativar produtos duplicados (manter apenas o mais recente)
/*
WITH produtos_duplicados AS (
  SELECT 
    id,
    codigo_pdv,
    nome,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY codigo_pdv 
      ORDER BY created_at DESC, updated_at DESC
    ) as rn
  FROM public.produtos 
  WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
    AND status = 'ativo'
),
produtos_para_desativar AS (
  SELECT id, codigo_pdv, nome
  FROM produtos_duplicados 
  WHERE rn > 1
)
UPDATE public.produtos 
SET 
  status = 'inativo',
  observacoes = COALESCE(observacoes, '') || ' [DESATIVADO - Código PDV duplicado - Mantido produto mais recente]',
  updated_at = NOW()
WHERE id IN (SELECT id FROM produtos_para_desativar);

-- Mostrar quais produtos foram desativados
SELECT 
  'Produtos desativados' as acao,
  codigo_pdv,
  nome,
  'Mantido produto mais recente' as motivo
FROM produtos_para_desativar;
*/

-- 5. ADICIONAR CONSTRAINT UNIQUE (APÓS DESATIVAÇÃO)
SELECT '=== ADICIONAR CONSTRAINT UNIQUE ===' as secao;

-- ⚠️  IMPORTANTE: Este script apenas ADICIONA uma constraint UNIQUE
-- NÃO APAGA nenhum dado, apenas previne futuras duplicatas

-- Adicionar constraint UNIQUE para codigo_pdv (apenas se não existir)
/*
DO $$
BEGIN
  -- Verificar se a constraint já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'produtos_codigo_pdv_user_unique' 
    AND table_name = 'produtos'
  ) THEN
    -- Adicionar constraint UNIQUE
    ALTER TABLE public.produtos 
    ADD CONSTRAINT produtos_codigo_pdv_user_unique 
    UNIQUE (codigo_pdv, user_id);
    
    RAISE NOTICE '✅ Constraint UNIQUE adicionada com sucesso!';
  ELSE
    RAISE NOTICE '⚠️ Constraint UNIQUE já existe.';
  END IF;
END $$;
*/

-- 6. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as secao;

-- Verificar se ainda há duplicatas ATIVAS
SELECT 
  'Duplicatas ativas restantes' as status,
  COUNT(*) as quantidade
FROM (
  SELECT codigo_pdv
  FROM public.produtos 
  WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
    AND status = 'ativo'
  GROUP BY codigo_pdv
  HAVING COUNT(*) > 1
) duplicatas;

-- Verificar constraint UNIQUE
SELECT 
  'Constraint UNIQUE' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'produtos_codigo_pdv_user_unique' 
      AND table_name = 'produtos'
    ) THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END as constraint_status;

-- 7. RESUMO DE PRODUTOS POR STATUS
SELECT 
  'Resumo por status' as secao,
  status,
  COUNT(*) as quantidade
FROM public.produtos 
GROUP BY status
ORDER BY status;

-- 8. VERIFICAR PRODUTOS DESATIVADOS POR DUPLICATA
SELECT 
  'Produtos desativados por duplicata' as secao,
  codigo_pdv,
  nome,
  observacoes,
  updated_at
FROM public.produtos 
WHERE observacoes LIKE '%DUPLICATA%' 
  OR observacoes LIKE '%DESATIVADO%'
ORDER BY updated_at DESC;
