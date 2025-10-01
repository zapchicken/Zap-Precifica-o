-- =====================================================
-- SCRIPT PARA ADICIONAR CONSTRAINT UNIQUE NO CÓDIGO PDV
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai adicionar uma constraint UNIQUE
-- para evitar duplicatas de código PDV no futuro
--
-- =====================================================

-- 1. VERIFICAR SE A CONSTRAINT JÁ EXISTE
SELECT '=== VERIFICANDO CONSTRAINT EXISTENTE ===' as secao;

SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'produtos' 
  AND constraint_type = 'UNIQUE'
  AND constraint_name LIKE '%codigo_pdv%';

-- 2. VERIFICAR DUPLICATAS ATUAIS
SELECT '=== VERIFICANDO DUPLICATAS ATUAIS ===' as secao;

SELECT 
  codigo_pdv,
  COUNT(*) as quantidade_duplicatas
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''
  AND status = 'ativo'
GROUP BY codigo_pdv
HAVING COUNT(*) > 1
ORDER BY quantidade_duplicatas DESC;

-- 3. ADICIONAR CONSTRAINT UNIQUE (SE NÃO EXISTIR)
SELECT '=== ADICIONANDO CONSTRAINT UNIQUE ===' as secao;

-- Adicionar constraint UNIQUE para codigo_pdv + user_id
DO $$
BEGIN
  -- Verificar se a constraint já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'produtos_codigo_pdv_user_unique' 
    AND table_name = 'produtos'
    AND constraint_type = 'UNIQUE'
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

-- 4. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as secao;

-- Verificar se a constraint foi criada
SELECT 
  'Constraint criada' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'produtos_codigo_pdv_user_unique' 
      AND table_name = 'produtos'
      AND constraint_type = 'UNIQUE'
    ) THEN '✅ SIM'
    ELSE '❌ NÃO'
  END as constraint_status;

-- Verificar se ainda há duplicatas
SELECT 
  'Duplicatas restantes' as status,
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

-- 5. TESTE DA CONSTRAINT
SELECT '=== TESTE DA CONSTRAINT ===' as secao;

-- Tentar inserir um produto com código PDV duplicado (deve falhar)
/*
INSERT INTO public.produtos (
  nome, 
  codigo_pdv, 
  preco_venda, 
  user_id
) VALUES (
  'TESTE DUPLICATA', 
  'TESTE123', 
  10.00, 
  (SELECT id FROM auth.users LIMIT 1)
);
*/

-- 6. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

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
  AND status = 'ativo'

UNION ALL

SELECT 
  'Total de códigos PDV únicos' as item,
  COUNT(DISTINCT codigo_pdv) as quantidade
FROM public.produtos 
WHERE codigo_pdv IS NOT NULL 
  AND codigo_pdv != ''
  AND status = 'ativo';
