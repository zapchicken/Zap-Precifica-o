-- =====================================================
-- SCRIPT PARA RESOLVER DUPLICATAS DO CÓDIGO 80
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai resolver as duplicatas do código 80
-- MANTÉM apenas o produto com ficha técnica (o mais importante)
-- DESATIVA os outros 3 produtos duplicados
--
-- =====================================================

-- 1. IDENTIFICAR O PRODUTO COM FICHA TÉCNICA (MANTER)
SELECT '=== PRODUTO COM FICHA TÉCNICA (MANTER) ===' as secao;

SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  ft.id as ficha_id,
  ft.nome as ficha_nome,
  ft.codigo as ficha_codigo
FROM public.produtos p
INNER JOIN public.fichas_tecnicas ft ON ft.id = p.ficha_tecnica_id
WHERE p.codigo_pdv = '80'
  AND p.status = 'ativo';

-- 2. IDENTIFICAR PRODUTOS DUPLICADOS (DESATIVAR)
SELECT '=== PRODUTOS DUPLICADOS (DESATIVAR) ===' as secao;

SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  p.created_at,
  p.updated_at
FROM public.produtos p
WHERE p.codigo_pdv = '80'
  AND p.status = 'ativo'
  AND p.ficha_tecnica_id IS NULL
ORDER BY p.created_at DESC;

-- 3. SCRIPT PARA DESATIVAR DUPLICATAS (EXECUTAR COM CUIDADO)
SELECT '=== SCRIPT PARA DESATIVAR DUPLICATAS ===' as secao;

-- ⚠️  IMPORTANTE: Este script NÃO APAGA nada, apenas DESATIVA produtos duplicados
-- Mantém apenas o produto com ficha técnica, desativa os outros

-- Desativar produtos duplicados (manter apenas o com ficha técnica)
/*
UPDATE public.produtos 
SET 
  status = 'inativo',
  observacoes = COALESCE(observacoes, '') || ' [DESATIVADO - Duplicata do código 80 - Mantido produto com ficha técnica]',
  updated_at = NOW()
WHERE codigo_pdv = '80'
  AND status = 'ativo'
  AND ficha_tecnica_id IS NULL;
*/

-- 4. VERIFICAÇÃO APÓS DESATIVAÇÃO
SELECT '=== VERIFICAÇÃO APÓS DESATIVAÇÃO ===' as secao;

-- Verificar quantos produtos código 80 restam ativos
/*
SELECT 
  'Produtos código 80 ativos restantes' as status,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'ativo';

-- Verificar se restou apenas 1 produto ativo
SELECT 
  'Produto restante' as tipo,
  id,
  codigo_pdv,
  nome,
  status,
  CASE 
    WHEN ficha_tecnica_id IS NOT NULL THEN 'Tem ficha técnica'
    ELSE 'Sem ficha técnica'
  END as tem_ficha
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'ativo';
*/

-- 5. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

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
  'Total de produtos código 80 com ficha técnica' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND ficha_tecnica_id IS NOT NULL

UNION ALL

SELECT 
  'Total de produtos código 80 sem ficha técnica' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND ficha_tecnica_id IS NULL;

-- 6. ESTRATÉGIA RECOMENDADA
SELECT '=== ESTRATÉGIA RECOMENDADA ===' as secao;

SELECT '1. Desativar os 3 produtos duplicados (sem ficha técnica)' as passo;
SELECT '2. Manter apenas o produto com ficha técnica ativo' as passo;
SELECT '3. Adicionar constraint UNIQUE para prevenir futuras duplicatas' as passo;
SELECT '4. Testar se o produto restante pode ser deletado (se necessário)' as passo;
