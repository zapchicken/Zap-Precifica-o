-- =====================================================
-- SCRIPT PARA LIMPAR TABELAS DE FICHAS TÉCNICAS E PRODUTOS
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script irá EXCLUIR TODOS os dados das tabelas relacionadas!
-- ⚠️  Faça backup antes de executar!
-- ⚠️  Execute apenas se tiver certeza absoluta!
--
-- =====================================================

-- Desabilitar temporariamente as verificações de chave estrangeira
-- (apenas para PostgreSQL - Supabase usa PostgreSQL)
SET session_replication_role = replica;

-- =====================================================
-- 1. LIMPAR TABELAS DE RELACIONAMENTOS (SEM DADOS PRINCIPAIS)
-- =====================================================

-- Limpar fichas_insumos (relacionamento fichas ↔ insumos)
DELETE FROM public.fichas_insumos;
SELECT 'fichas_insumos limpa' as status;

-- Limpar fichas_bases (relacionamento fichas ↔ bases)
DELETE FROM public.fichas_bases;
SELECT 'fichas_bases limpa' as status;

-- Limpar fichas_produtosprontos (relacionamento fichas ↔ produtos prontos)
DELETE FROM public.fichas_produtosprontos;
SELECT 'fichas_produtosprontos limpa' as status;

-- Limpar insumos_embalagem_delivery (embalagens das fichas)
DELETE FROM public.insumos_embalagem_delivery;
SELECT 'insumos_embalagem_delivery limpa' as status;

-- Limpar bases_insumos (relacionamento bases ↔ insumos)
DELETE FROM public.bases_insumos;
SELECT 'bases_insumos limpa' as status;

-- =====================================================
-- 2. LIMPAR TABELAS PRINCIPAIS
-- =====================================================

-- Limpar fichas_tecnicas (tabela principal de fichas)
DELETE FROM public.fichas_tecnicas;
SELECT 'fichas_tecnicas limpa' as status;

-- Limpar produtos (tabela principal de produtos)
DELETE FROM public.produtos;
SELECT 'produtos limpa' as status;

-- Limpar bases (produtos intermediários)
DELETE FROM public.bases;
SELECT 'bases limpa' as status;

-- Limpar insumos (ingredientes/materiais)
DELETE FROM public.insumos;
SELECT 'insumos limpa' as status;

-- =====================================================
-- 3. REABILITAR VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

-- Reabilitar as verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- =====================================================
-- 4. VERIFICAR LIMPEZA
-- =====================================================

-- Verificar se as tabelas estão vazias
SELECT 
  'fichas_insumos' as tabela, 
  COUNT(*) as registros 
FROM public.fichas_insumos
UNION ALL
SELECT 
  'fichas_bases' as tabela, 
  COUNT(*) as registros 
FROM public.fichas_bases
UNION ALL
SELECT 
  'fichas_produtosprontos' as tabela, 
  COUNT(*) as registros 
FROM public.fichas_produtosprontos
UNION ALL
SELECT 
  'insumos_embalagem_delivery' as tabela, 
  COUNT(*) as registros 
FROM public.insumos_embalagem_delivery
UNION ALL
SELECT 
  'bases_insumos' as tabela, 
  COUNT(*) as registros 
FROM public.bases_insumos
UNION ALL
SELECT 
  'fichas_tecnicas' as tabela, 
  COUNT(*) as registros 
FROM public.fichas_tecnicas
UNION ALL
SELECT 
  'produtos' as tabela, 
  COUNT(*) as registros 
FROM public.produtos
UNION ALL
SELECT 
  'bases' as tabela, 
  COUNT(*) as registros 
FROM public.bases
UNION ALL
SELECT 
  'insumos' as tabela, 
  COUNT(*) as registros 
FROM public.insumos
ORDER BY tabela;

-- =====================================================
-- 5. RESETAR SEQUÊNCIAS (se houver)
-- =====================================================

-- Resetar sequências para começar do 1 novamente
-- (Isso é opcional, mas útil se você tiver campos auto-incrementais)

-- Exemplo para resetar sequências (descomente se necessário):
-- ALTER SEQUENCE public.fichas_tecnicas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.produtos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.bases_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.insumos_id_seq RESTART WITH 1;

-- =====================================================
-- SCRIPT CONCLUÍDO
-- =====================================================

SELECT '🎉 LIMPEZA CONCLUÍDA COM SUCESSO!' as resultado;
SELECT 'Todas as tabelas de fichas técnicas e produtos foram limpas.' as status;
SELECT 'Você pode agora começar a inserir novos dados do zero.' as proximo_passo;
