-- =====================================================
-- SCRIPT PARA EXECUTAR LIMPEZA DAS DUPLICATAS DO CÓDIGO 80
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai DESATIVAR os produtos duplicados
-- MANTÉM apenas o produto com ficha técnica
-- NÃO APAGA nenhum dado, apenas desativa
--
-- =====================================================

-- 1. VERIFICAR SITUAÇÃO ATUAL
SELECT '=== SITUAÇÃO ATUAL ===' as secao;

SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  p.ficha_tecnica_id,
  CASE 
    WHEN p.ficha_tecnica_id IS NOT NULL THEN 'TEM FICHA TÉCNICA'
    ELSE 'SEM FICHA TÉCNICA'
  END as tipo_produto,
  ft.nome as ficha_nome
FROM public.produtos p
LEFT JOIN public.fichas_tecnicas ft ON ft.id = p.ficha_tecnica_id
WHERE p.codigo_pdv = '80'
ORDER BY 
  CASE WHEN p.ficha_tecnica_id IS NOT NULL THEN 0 ELSE 1 END,
  p.created_at DESC;

-- 2. IDENTIFICAR PRODUTOS PARA DESATIVAR
SELECT '=== PRODUTOS PARA DESATIVAR ===' as secao;

SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  p.created_at,
  'SERÁ DESATIVADO' as acao
FROM public.produtos p
WHERE p.codigo_pdv = '80'
  AND p.status = 'ativo'
  AND p.ficha_tecnica_id IS NULL
ORDER BY p.created_at DESC;

-- 3. IDENTIFICAR PRODUTO PARA MANTER
SELECT '=== PRODUTO PARA MANTER ===' as secao;

SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  p.ficha_tecnica_id,
  ft.nome as ficha_nome,
  ft.codigo as ficha_codigo,
  'SERÁ MANTIDO' as acao
FROM public.produtos p
INNER JOIN public.fichas_tecnicas ft ON ft.id = p.ficha_tecnica_id
WHERE p.codigo_pdv = '80'
  AND p.status = 'ativo';

-- 4. EXECUTAR DESATIVAÇÃO DOS DUPLICADOS
SELECT '=== EXECUTANDO DESATIVAÇÃO ===' as secao;

-- Desativar produtos duplicados (manter apenas o com ficha técnica)
UPDATE public.produtos 
SET 
  status = 'inativo',
  observacoes = COALESCE(observacoes, '') || ' [DESATIVADO - Duplicata do código 80 - Mantido produto com ficha técnica]',
  updated_at = NOW()
WHERE codigo_pdv = '80'
  AND status = 'ativo'
  AND ficha_tecnica_id IS NULL;

-- Mostrar quantos produtos foram desativados
SELECT 
  'Produtos desativados' as resultado,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80'
  AND status = 'inativo'
  AND observacoes LIKE '%DESATIVADO%';

-- 5. VERIFICAÇÃO APÓS DESATIVAÇÃO
SELECT '=== VERIFICAÇÃO APÓS DESATIVAÇÃO ===' as secao;

-- Verificar produtos restantes ativos
SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  p.ficha_tecnica_id,
  ft.nome as ficha_nome,
  'PRODUTO RESTANTE' as status_final
FROM public.produtos p
LEFT JOIN public.fichas_tecnicas ft ON ft.id = p.ficha_tecnica_id
WHERE p.codigo_pdv = '80'
  AND p.status = 'ativo';

-- Verificar produtos desativados
SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  p.observacoes,
  'PRODUTO DESATIVADO' as status_final
FROM public.produtos p
WHERE p.codigo_pdv = '80'
  AND p.status = 'inativo'
ORDER BY p.updated_at DESC;

-- 6. RESUMO FINAL
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

-- 7. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Verificar se restou apenas 1 produto ativo' as passo;
SELECT '2. Testar se o produto restante pode ser deletado' as passo;
SELECT '3. Se necessário, deletar o produto restante' as passo;
SELECT '4. Adicionar constraint UNIQUE para prevenir futuras duplicatas' as passo;
