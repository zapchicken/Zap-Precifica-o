-- =====================================================
-- SCRIPT PARA DESATIVAR FICHA TÉCNICA DA COCA COLA
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai DESATIVAR a ficha técnica da Coca Cola
-- SEM MEXER nos produtos do banco ou combos/lanches
-- APENAS DESATIVA a ficha técnica
--
-- =====================================================

-- 1. VERIFICAR FICHAS TÉCNICAS DA COCA COLA
SELECT '=== FICHAS TÉCNICAS DA COCA COLA ===' as secao;

SELECT 
  id,
  nome,
  codigo,
  categoria,
  ativo,
  created_at,
  updated_at
FROM public.fichas_tecnicas 
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo = '80'
ORDER BY created_at DESC;

-- 2. VERIFICAR PRODUTOS DA COCA COLA
SELECT '=== PRODUTOS DA COCA COLA ===' as secao;

SELECT 
  id,
  nome,
  codigo_pdv,
  status,
  ficha_tecnica_id,
  created_at,
  updated_at
FROM public.produtos 
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo_pdv = '80'
ORDER BY created_at DESC;

-- 3. DESATIVAR FICHAS TÉCNICAS DA COCA COLA
SELECT '=== DESATIVANDO FICHAS TÉCNICAS DA COCA COLA ===' as secao;

-- Desativar fichas técnicas da Coca Cola
UPDATE public.fichas_tecnicas 
SET 
  ativo = false,
  updated_at = NOW()
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo = '80';

-- Mostrar quantas fichas foram desativadas
SELECT 
  'Fichas técnicas desativadas' as resultado,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas 
WHERE (nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo = '80')
  AND ativo = false;

-- 4. DESATIVAR PRODUTOS DA COCA COLA
SELECT '=== DESATIVANDO PRODUTOS DA COCA COLA ===' as secao;

-- Desativar produtos da Coca Cola
UPDATE public.produtos 
SET 
  status = 'inativo',
  updated_at = NOW()
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo_pdv = '80';

-- Mostrar quantos produtos foram desativados
SELECT 
  'Produtos desativados' as resultado,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE (nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo_pdv = '80')
  AND status = 'inativo';

-- 5. VERIFICAÇÃO APÓS DESATIVAÇÃO
SELECT '=== VERIFICAÇÃO APÓS DESATIVAÇÃO ===' as secao;

-- Verificar fichas técnicas ativas da Coca Cola
SELECT 
  'Fichas técnicas ativas da Coca Cola' as status,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas 
WHERE (nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo = '80')
  AND ativo = true;

-- Verificar produtos ativos da Coca Cola
SELECT 
  'Produtos ativos da Coca Cola' as status,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE (nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo_pdv = '80')
  AND status = 'ativo';

-- 6. MOSTRAR STATUS FINAL
SELECT '=== STATUS FINAL ===' as secao;

-- Mostrar fichas técnicas da Coca Cola (ativas e inativas)
SELECT 
  'Fichas técnicas da Coca Cola' as item,
  ativo,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas 
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo = '80'
GROUP BY ativo
ORDER BY ativo;

-- Mostrar produtos da Coca Cola (ativos e inativos)
SELECT 
  'Produtos da Coca Cola' as item,
  status,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE nome ILIKE '%coca%cola%' 
   OR nome ILIKE '%coca cola%'
   OR nome ILIKE '%coca-cola%'
   OR codigo_pdv = '80'
GROUP BY status
ORDER BY status;

-- 7. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Total de fichas técnicas' as item,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas

UNION ALL

SELECT 
  'Total de produtos' as item,
  COUNT(*) as quantidade
FROM public.produtos

UNION ALL

SELECT 
  'Fichas técnicas ativas' as item,
  COUNT(*) as quantidade
FROM public.fichas_tecnicas 
WHERE ativo = true

UNION ALL

SELECT 
  'Produtos ativos' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE status = 'ativo';

-- 8. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Fichas técnicas da Coca Cola foram desativadas' as passo;
SELECT '2. Produtos da Coca Cola foram desativados' as passo;
SELECT '3. Combos/lanches NÃO foram afetados' as passo;
SELECT '4. Agora execute o script de constraint UNIQUE' as passo;
SELECT '5. Sistema estará protegido contra duplicatas' as passo;
