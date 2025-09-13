-- =====================================================
-- SCRIPT PARA DESATIVAR REGISTROS (SOFT DELETE)
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script irá DESATIVAR todos os registros!
-- ⚠️  Os dados serão preservados, apenas marcados como inativos!
-- ⚠️  Mais seguro que a exclusão física!
--
-- =====================================================

-- =====================================================
-- 1. DESATIVAR PRODUTOS
-- =====================================================

-- Desativar todos os produtos
UPDATE public.produtos 
SET status = 'inativo', updated_at = NOW()
WHERE status = 'ativo';

SELECT 'Produtos desativados: ' || COUNT(*) as resultado
FROM public.produtos 
WHERE status = 'inativo';

-- =====================================================
-- 2. DESATIVAR FICHAS TÉCNICAS
-- =====================================================

-- Desativar todas as fichas técnicas
UPDATE public.fichas_tecnicas 
SET ativo = false, updated_at = NOW()
WHERE ativo = true;

SELECT 'Fichas técnicas desativadas: ' || COUNT(*) as resultado
FROM public.fichas_tecnicas 
WHERE ativo = false;

-- =====================================================
-- 3. DESATIVAR BASES
-- =====================================================

-- Desativar todas as bases
UPDATE public.bases 
SET ativo = false, updated_at = NOW()
WHERE ativo = true;

SELECT 'Bases desativadas: ' || COUNT(*) as resultado
FROM public.bases 
WHERE ativo = false;

-- =====================================================
-- 4. DESATIVAR INSUMOS
-- =====================================================

-- Desativar todos os insumos
UPDATE public.insumos 
SET ativo = false, updated_at = NOW()
WHERE ativo = true;

SELECT 'Insumos desativados: ' || COUNT(*) as resultado
FROM public.insumos 
WHERE ativo = false;

-- =====================================================
-- 5. VERIFICAR DESATIVAÇÃO
-- =====================================================

-- Verificar quantos registros foram desativados
SELECT 
  'produtos' as tabela, 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
  COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos
FROM public.produtos
UNION ALL
SELECT 
  'fichas_tecnicas' as tabela, 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
  COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM public.fichas_tecnicas
UNION ALL
SELECT 
  'bases' as tabela, 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
  COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM public.bases
UNION ALL
SELECT 
  'insumos' as tabela, 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
  COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM public.insumos
ORDER BY tabela;

-- =====================================================
-- 6. SCRIPT PARA REATIVAR (SE NECESSÁRIO)
-- =====================================================

-- Para reativar todos os registros, execute:
/*
UPDATE public.produtos SET status = 'ativo', updated_at = NOW() WHERE status = 'inativo';
UPDATE public.fichas_tecnicas SET ativo = true, updated_at = NOW() WHERE ativo = false;
UPDATE public.bases SET ativo = true, updated_at = NOW() WHERE ativo = false;
UPDATE public.insumos SET ativo = true, updated_at = NOW() WHERE ativo = false;
*/

-- =====================================================
-- SCRIPT CONCLUÍDO
-- =====================================================

SELECT '🎉 DESATIVAÇÃO CONCLUÍDA COM SUCESSO!' as resultado;
SELECT 'Todos os registros foram desativados (soft delete).' as status;
SELECT 'Os dados foram preservados e podem ser reativados se necessário.' as vantagem;
