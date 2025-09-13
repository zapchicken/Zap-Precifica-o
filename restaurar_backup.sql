-- =====================================================
-- SCRIPT PARA RESTAURAR DADOS DO BACKUP
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script irá restaurar todos os dados do backup!
-- ⚠️  Execute apenas se precisar recuperar os dados!
-- ⚠️  Verifique se as tabelas de backup existem antes!
--
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE BACKUPS EXISTEM
-- =====================================================

-- Verificar se as tabelas de backup existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_produtos') 
    THEN '✅ backup_produtos existe' 
    ELSE '❌ backup_produtos NÃO existe' 
  END as status_backup_produtos
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_fichas_tecnicas') 
    THEN '✅ backup_fichas_tecnicas existe' 
    ELSE '❌ backup_fichas_tecnicas NÃO existe' 
  END as status_backup_fichas
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_bases') 
    THEN '✅ backup_bases existe' 
    ELSE '❌ backup_bases NÃO existe' 
  END as status_backup_bases
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_insumos') 
    THEN '✅ backup_insumos existe' 
    ELSE '❌ backup_insumos NÃO existe' 
  END as status_backup_insumos;

-- =====================================================
-- 2. RESTAURAR DADOS PRINCIPAIS
-- =====================================================

-- Restaurar insumos primeiro (não tem dependências)
INSERT INTO public.insumos 
SELECT 
  id, nome, unidade, preco_custo, categoria, ativo, 
  observacoes, user_id, created_at, updated_at
FROM backup_insumos
WHERE id NOT IN (SELECT id FROM public.insumos);

SELECT 'Insumos restaurados: ' || COUNT(*) as status
FROM public.insumos;

-- Restaurar bases
INSERT INTO public.bases 
SELECT 
  id, nome, descricao, categoria, ativo, 
  observacoes, user_id, created_at, updated_at
FROM backup_bases
WHERE id NOT IN (SELECT id FROM public.bases);

SELECT 'Bases restauradas: ' || COUNT(*) as status
FROM public.bases;

-- Restaurar fichas técnicas
INSERT INTO public.fichas_tecnicas 
SELECT 
  id, nome, codigo, descricao, rendimento, 
  unidade_rendimento, custo_total, ativo, 
  observacoes, user_id, created_at, updated_at
FROM backup_fichas_tecnicas
WHERE id NOT IN (SELECT id FROM public.fichas_tecnicas);

SELECT 'Fichas técnicas restauradas: ' || COUNT(*) as status
FROM public.fichas_tecnicas;

-- Restaurar produtos
INSERT INTO public.produtos 
SELECT 
  id, nome, codigo_pdv, descricao, categoria, 
  preco_custo, preco_venda, margem_lucro, 
  status, origem, ficha_tecnica_id, observacoes, 
  user_id, created_at, updated_at
FROM backup_produtos
WHERE id NOT IN (SELECT id FROM public.produtos);

SELECT 'Produtos restaurados: ' || COUNT(*) as status
FROM public.produtos;

-- =====================================================
-- 3. RESTAURAR RELACIONAMENTOS
-- =====================================================

-- Restaurar bases_insumos
INSERT INTO public.bases_insumos 
SELECT 
  id, base_id, insumo_id, quantidade, 
  unidade, observacoes, user_id, created_at, updated_at
FROM backup_bases_insumos
WHERE id NOT IN (SELECT id FROM public.bases_insumos);

SELECT 'Relacionamentos bases_insumos restaurados: ' || COUNT(*) as status
FROM public.bases_insumos;

-- Restaurar fichas_insumos
INSERT INTO public.fichas_insumos 
SELECT 
  id, ficha_id, insumo_id, quantidade, 
  unidade, observacoes, user_id, created_at, updated_at
FROM backup_fichas_insumos
WHERE id NOT IN (SELECT id FROM public.fichas_insumos);

SELECT 'Relacionamentos fichas_insumos restaurados: ' || COUNT(*) as status
FROM public.fichas_insumos;

-- Restaurar fichas_bases
INSERT INTO public.fichas_bases 
SELECT 
  id, ficha_id, base_id, quantidade, 
  unidade, observacoes, user_id, created_at, updated_at
FROM backup_fichas_bases
WHERE id NOT IN (SELECT id FROM public.fichas_bases);

SELECT 'Relacionamentos fichas_bases restaurados: ' || COUNT(*) as status
FROM public.fichas_bases;

-- Restaurar fichas_produtosprontos
INSERT INTO public.fichas_produtosprontos 
SELECT 
  id, ficha_id, produto_ficha_id, quantidade, 
  unidade, observacoes, user_id, created_at, updated_at
FROM backup_fichas_produtosprontos
WHERE id NOT IN (SELECT id FROM public.fichas_produtosprontos);

SELECT 'Relacionamentos fichas_produtosprontos restaurados: ' || COUNT(*) as status
FROM public.fichas_produtosprontos;

-- Restaurar insumos_embalagem_delivery
INSERT INTO public.insumos_embalagem_delivery 
SELECT 
  id, ficha_id, insumo_id, quantidade, 
  unidade, observacoes, user_id, created_at, updated_at
FROM backup_insumos_embalagem_delivery
WHERE id NOT IN (SELECT id FROM public.insumos_embalagem_delivery);

SELECT 'Relacionamentos insumos_embalagem_delivery restaurados: ' || COUNT(*) as status
FROM public.insumos_embalagem_delivery;

-- =====================================================
-- 4. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todos os dados foram restaurados
SELECT 
  'produtos' as tabela,
  (SELECT COUNT(*) FROM backup_produtos) as backup_count,
  (SELECT COUNT(*) FROM public.produtos) as restored_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM backup_produtos) = (SELECT COUNT(*) FROM public.produtos) 
    THEN '✅ OK' 
    ELSE '❌ DIFERENÇA' 
  END as status
UNION ALL
SELECT 
  'fichas_tecnicas' as tabela,
  (SELECT COUNT(*) FROM backup_fichas_tecnicas) as backup_count,
  (SELECT COUNT(*) FROM public.fichas_tecnicas) as restored_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM backup_fichas_tecnicas) = (SELECT COUNT(*) FROM public.fichas_tecnicas) 
    THEN '✅ OK' 
    ELSE '❌ DIFERENÇA' 
  END as status
UNION ALL
SELECT 
  'bases' as tabela,
  (SELECT COUNT(*) FROM backup_bases) as backup_count,
  (SELECT COUNT(*) FROM public.bases) as restored_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM backup_bases) = (SELECT COUNT(*) FROM public.bases) 
    THEN '✅ OK' 
    ELSE '❌ DIFERENÇA' 
  END as status
UNION ALL
SELECT 
  'insumos' as tabela,
  (SELECT COUNT(*) FROM backup_insumos) as backup_count,
  (SELECT COUNT(*) FROM public.insumos) as restored_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM backup_insumos) = (SELECT COUNT(*) FROM public.insumos) 
    THEN '✅ OK' 
    ELSE '❌ DIFERENÇA' 
  END as status
ORDER BY tabela;

-- =====================================================
-- 5. RESUMO FINAL
-- =====================================================

SELECT '🎉 RESTAURAÇÃO CONCLUÍDA!' as resultado;
SELECT 'Todos os dados foram restaurados do backup.' as status;
SELECT 'Verifique se todos os status estão como "✅ OK".' as verificacao;

-- Mostrar resumo dos dados restaurados
SELECT 
  '📊 RESUMO DOS DADOS RESTAURADOS:' as info,
  'Produtos: ' || (SELECT COUNT(*) FROM public.produtos) ||
  ' | Fichas: ' || (SELECT COUNT(*) FROM public.fichas_tecnicas) ||
  ' | Bases: ' || (SELECT COUNT(*) FROM public.bases) ||
  ' | Insumos: ' || (SELECT COUNT(*) FROM public.insumos) as resumo;
