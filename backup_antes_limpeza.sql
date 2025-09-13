-- =====================================================
-- SCRIPT DE BACKUP ANTES DA LIMPEZA
-- =====================================================
-- 
-- ⚠️  IMPORTANTE: Execute este script ANTES de limpar as tabelas!
-- ⚠️  Este script cria tabelas de backup com todos os dados atuais!
--
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELAS DE BACKUP
-- =====================================================

-- Backup de produtos
CREATE TABLE IF NOT EXISTS backup_produtos AS 
SELECT *, NOW() as backup_date 
FROM public.produtos;

SELECT 'Backup de produtos criado: ' || COUNT(*) || ' registros' as status
FROM backup_produtos;

-- Backup de fichas técnicas
CREATE TABLE IF NOT EXISTS backup_fichas_tecnicas AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_tecnicas;

SELECT 'Backup de fichas técnicas criado: ' || COUNT(*) || ' registros' as status
FROM backup_fichas_tecnicas;

-- Backup de bases
CREATE TABLE IF NOT EXISTS backup_bases AS 
SELECT *, NOW() as backup_date 
FROM public.bases;

SELECT 'Backup de bases criado: ' || COUNT(*) || ' registros' as status
FROM backup_bases;

-- Backup de insumos
CREATE TABLE IF NOT EXISTS backup_insumos AS 
SELECT *, NOW() as backup_date 
FROM public.insumos;

SELECT 'Backup de insumos criado: ' || COUNT(*) || ' registros' as status
FROM backup_insumos;

-- =====================================================
-- 2. BACKUP DE TABELAS DE RELACIONAMENTO
-- =====================================================

-- Backup de fichas_insumos
CREATE TABLE IF NOT EXISTS backup_fichas_insumos AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_insumos;

SELECT 'Backup de fichas_insumos criado: ' || COUNT(*) || ' registros' as status
FROM backup_fichas_insumos;

-- Backup de fichas_bases
CREATE TABLE IF NOT EXISTS backup_fichas_bases AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_bases;

SELECT 'Backup de fichas_bases criado: ' || COUNT(*) || ' registros' as status
FROM backup_fichas_bases;

-- Backup de fichas_produtosprontos
CREATE TABLE IF NOT EXISTS backup_fichas_produtosprontos AS 
SELECT *, NOW() as backup_date 
FROM public.fichas_produtosprontos;

SELECT 'Backup de fichas_produtosprontos criado: ' || COUNT(*) || ' registros' as status
FROM backup_fichas_produtosprontos;

-- Backup de bases_insumos
CREATE TABLE IF NOT EXISTS backup_bases_insumos AS 
SELECT *, NOW() as backup_date 
FROM public.bases_insumos;

SELECT 'Backup de bases_insumos criado: ' || COUNT(*) || ' registros' as status
FROM backup_bases_insumos;

-- Backup de insumos_embalagem_delivery
CREATE TABLE IF NOT EXISTS backup_insumos_embalagem_delivery AS 
SELECT *, NOW() as backup_date 
FROM public.insumos_embalagem_delivery;

SELECT 'Backup de insumos_embalagem_delivery criado: ' || COUNT(*) || ' registros' as status
FROM backup_insumos_embalagem_delivery;

-- =====================================================
-- 3. VERIFICAR BACKUPS CRIADOS
-- =====================================================

-- Listar todas as tabelas de backup criadas
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM information_schema.tables t2 
   WHERE t2.table_name = t1.tablename 
   AND t2.table_schema = t1.schemaname) as existe
FROM information_schema.tables t1
WHERE tablename LIKE 'backup_%'
AND schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 4. RESUMO DOS BACKUPS
-- =====================================================

SELECT 
  'backup_produtos' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_produtos
UNION ALL
SELECT 
  'backup_fichas_tecnicas' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_fichas_tecnicas
UNION ALL
SELECT 
  'backup_bases' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_bases
UNION ALL
SELECT 
  'backup_insumos' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_insumos
UNION ALL
SELECT 
  'backup_fichas_insumos' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_fichas_insumos
UNION ALL
SELECT 
  'backup_fichas_bases' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_fichas_bases
UNION ALL
SELECT 
  'backup_fichas_produtosprontos' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_fichas_produtosprontos
UNION ALL
SELECT 
  'backup_bases_insumos' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_bases_insumos
UNION ALL
SELECT 
  'backup_insumos_embalagem_delivery' as tabela_backup,
  COUNT(*) as registros_backup
FROM backup_insumos_embalagem_delivery
ORDER BY tabela_backup;

-- =====================================================
-- 5. SCRIPT PARA RESTAURAR BACKUP (SE NECESSÁRIO)
-- =====================================================

-- Para restaurar os dados do backup, execute:
/*
-- Restaurar produtos
INSERT INTO public.produtos 
SELECT * FROM backup_produtos 
WHERE id NOT IN (SELECT id FROM public.produtos);

-- Restaurar fichas técnicas
INSERT INTO public.fichas_tecnicas 
SELECT * FROM backup_fichas_tecnicas 
WHERE id NOT IN (SELECT id FROM public.fichas_tecnicas);

-- Restaurar bases
INSERT INTO public.bases 
SELECT * FROM backup_bases 
WHERE id NOT IN (SELECT id FROM public.bases);

-- Restaurar insumos
INSERT INTO public.insumos 
SELECT * FROM backup_insumos 
WHERE id NOT IN (SELECT id FROM public.insumos);

-- Restaurar relacionamentos
INSERT INTO public.fichas_insumos 
SELECT * FROM backup_fichas_insumos;

INSERT INTO public.fichas_bases 
SELECT * FROM backup_fichas_bases;

INSERT INTO public.fichas_produtosprontos 
SELECT * FROM backup_fichas_produtosprontos;

INSERT INTO public.bases_insumos 
SELECT * FROM backup_bases_insumos;

INSERT INTO public.insumos_embalagem_delivery 
SELECT * FROM backup_insumos_embalagem_delivery;
*/

-- =====================================================
-- BACKUP CONCLUÍDO
-- =====================================================

SELECT '🎉 BACKUP CONCLUÍDO COM SUCESSO!' as resultado;
SELECT 'Todas as tabelas foram copiadas para tabelas de backup.' as status;
SELECT 'Agora você pode executar a limpeza com segurança.' as proximo_passo;
