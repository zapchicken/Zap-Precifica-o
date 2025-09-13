-- =====================================================
-- SCRIPT DE LIMPEZA COMPLETA E SEGURA
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script fará limpeza completa das tabelas!
-- ⚠️  Execute em sequência: 1) Backup, 2) Limpeza
-- ⚠️  Faça backup antes de executar!
--
-- =====================================================

-- =====================================================
-- PARTE 1: BACKUP AUTOMÁTICO
-- =====================================================

-- Criar backup de produtos
DROP TABLE IF EXISTS backup_produtos;
CREATE TABLE backup_produtos AS 
SELECT *, NOW() as backup_date 
FROM public.produtos;

-- Criar backup de fichas técnicas
DROP TABLE IF EXISTS backup_fichas_tecnicas;
CREATE TABLE backup_fichas_tecnicas AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_tecnicas;

-- Criar backup de bases
DROP TABLE IF EXISTS backup_bases;
CREATE TABLE backup_bases AS 
SELECT *, NOW() as backup_date 
FROM public.bases;

-- Criar backup de insumos
DROP TABLE IF EXISTS backup_insumos;
CREATE TABLE backup_insumos AS 
SELECT *, NOW() as backup_date 
FROM public.insumos;

-- Criar backup de relacionamentos
DROP TABLE IF EXISTS backup_fichas_insumos;
CREATE TABLE backup_fichas_insumos AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_insumos;

DROP TABLE IF EXISTS backup_fichas_bases;
CREATE TABLE backup_fichas_bases AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_bases;

DROP TABLE IF EXISTS backup_fichas_produtosprontos;
CREATE TABLE backup_fichas_produtosprontos AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_produtosprontos;

DROP TABLE IF EXISTS backup_bases_insumos;
CREATE TABLE backup_bases_insumos AS 
SELECT *, NOW() as backup_date 
FROM public.bases_insumos;

DROP TABLE IF EXISTS backup_insumos_embalagem_delivery;
CREATE TABLE backup_insumos_embalagem_delivery AS 
SELECT *, NOW() as backup_date 
FROM public.insumos_embalagem_delivery;

-- Mostrar status do backup
SELECT '✅ BACKUP CONCLUÍDO' as status;
SELECT 
  'Produtos: ' || (SELECT COUNT(*) FROM backup_produtos) ||
  ' | Fichas: ' || (SELECT COUNT(*) FROM backup_fichas_tecnicas) ||
  ' | Bases: ' || (SELECT COUNT(*) FROM backup_bases) ||
  ' | Insumos: ' || (SELECT COUNT(*) FROM backup_insumos) as resumo_backup;

-- =====================================================
-- PARTE 2: LIMPEZA COMPLETA
-- =====================================================

-- Desabilitar verificações de FK temporariamente
SET session_replication_role = replica;

-- Limpar relacionamentos primeiro
DELETE FROM public.fichas_insumos;
DELETE FROM public.fichas_bases;
DELETE FROM public.fichas_produtosprontos;
DELETE FROM public.insumos_embalagem_delivery;
DELETE FROM public.bases_insumos;

-- Limpar tabelas principais
DELETE FROM public.fichas_tecnicas;
DELETE FROM public.produtos;
DELETE FROM public.bases;
DELETE FROM public.insumos;

-- Reabilitar verificações de FK
SET session_replication_role = DEFAULT;

-- =====================================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas estão vazias
SELECT 
  'fichas_insumos' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.fichas_insumos
UNION ALL
SELECT 
  'fichas_bases' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.fichas_bases
UNION ALL
SELECT 
  'fichas_produtosprontos' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.fichas_produtosprontos
UNION ALL
SELECT 
  'insumos_embalagem_delivery' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.insumos_embalagem_delivery
UNION ALL
SELECT 
  'bases_insumos' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.bases_insumos
UNION ALL
SELECT 
  'fichas_tecnicas' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.fichas_tecnicas
UNION ALL
SELECT 
  'produtos' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.produtos
UNION ALL
SELECT 
  'bases' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.bases
UNION ALL
SELECT 
  'insumos' as tabela, 
  COUNT(*) as registros_restantes 
FROM public.insumos
ORDER BY tabela;

-- =====================================================
-- PARTE 4: RESUMO FINAL
-- =====================================================

SELECT '🎉 LIMPEZA COMPLETA CONCLUÍDA!' as resultado;
SELECT 'Todas as tabelas foram limpas e os dados foram preservados em backup.' as status;
SELECT 'Você pode agora começar a inserir novos dados do zero.' as proximo_passo;

-- Mostrar informações dos backups
SELECT 
  '📦 BACKUPS CRIADOS:' as info,
  'backup_produtos (' || (SELECT COUNT(*) FROM backup_produtos) || ' registros)' as detalhes
UNION ALL
SELECT 
  '' as info,
  'backup_fichas_tecnicas (' || (SELECT COUNT(*) FROM backup_fichas_tecnicas) || ' registros)' as detalhes
UNION ALL
SELECT 
  '' as info,
  'backup_bases (' || (SELECT COUNT(*) FROM backup_bases) || ' registros)' as detalhes
UNION ALL
SELECT 
  '' as info,
  'backup_insumos (' || (SELECT COUNT(*) FROM backup_insumos) || ' registros)' as detalhes;

-- =====================================================
-- INSTRUÇÕES PARA RESTAURAR (SE NECESSÁRIO)
-- =====================================================

SELECT '💡 PARA RESTAURAR OS DADOS:' as instrucoes;
SELECT 'Execute o script "restaurar_backup.sql" se precisar recuperar os dados.' as detalhes;
