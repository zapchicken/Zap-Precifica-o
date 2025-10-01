-- =====================================================
-- SCRIPT PARA TESTAR SE O PRODUTO RESTANTE PODE SER DELETADO
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script APENAS TESTA se o produto pode ser deletado
-- NÃO FAZ NENHUMA ALTERAÇÃO no banco de dados
-- Use para entender as dependências antes de deletar
--
-- =====================================================

-- 1. IDENTIFICAR O PRODUTO RESTANTE (COM FICHA TÉCNICA)
SELECT '=== PRODUTO RESTANTE (COM FICHA TÉCNICA) ===' as secao;

SELECT 
  p.id,
  p.codigo_pdv,
  p.nome,
  p.status,
  p.ficha_tecnica_id,
  ft.nome as ficha_nome,
  ft.codigo as ficha_codigo,
  ft.ativo as ficha_ativa
FROM public.produtos p
INNER JOIN public.fichas_tecnicas ft ON ft.id = p.ficha_tecnica_id
WHERE p.codigo_pdv = '80'
  AND p.status = 'ativo';

-- 2. VERIFICAR DEPENDÊNCIAS DA FICHA TÉCNICA
SELECT '=== DEPENDÊNCIAS DA FICHA TÉCNICA ===' as secao;

-- Verificar se a ficha técnica tem insumos
SELECT 
  'Insumos na ficha técnica' as tipo,
  COUNT(*) as quantidade
FROM public.fichas_insumos fi
INNER JOIN public.fichas_tecnicas ft ON ft.id = fi.ficha_id
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = '80';

-- Verificar se a ficha técnica tem bases
SELECT 
  'Bases na ficha técnica' as tipo,
  COUNT(*) as quantidade
FROM public.fichas_bases fb
INNER JOIN public.fichas_tecnicas ft ON ft.id = fb.ficha_id
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = '80';

-- Verificar se a ficha técnica tem produtos prontos
SELECT 
  'Produtos prontos na ficha técnica' as tipo,
  COUNT(*) as quantidade
FROM public.fichas_produtosprontos fpp
INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = '80';

-- Verificar se a ficha técnica tem embalagens delivery
SELECT 
  'Embalagens delivery na ficha técnica' as tipo,
  COUNT(*) as quantidade
FROM public.insumos_embalagem_delivery ied
INNER JOIN public.fichas_tecnicas ft ON ft.id = ied.ficha_id
INNER JOIN public.produtos p ON p.ficha_tecnica_id = ft.id
WHERE p.codigo_pdv = '80';

-- 3. VERIFICAR SE O PRODUTO É USADO COMO PRODUTO PRONTO
SELECT '=== PRODUTO USADO COMO PRODUTO PRONTO ===' as secao;

SELECT 
  fpp.id,
  fpp.ficha_id,
  fpp.produto_ficha_id,
  fpp.quantidade,
  fpp.unidade,
  ft.nome as ficha_que_usa,
  ft.codigo as codigo_ficha,
  ft.ativo as ficha_ativa
FROM public.fichas_produtosprontos fpp
INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id
INNER JOIN public.produtos p ON p.id = fpp.produto_ficha_id
WHERE p.codigo_pdv = '80';

-- 4. VERIFICAR SE HÁ VENDAS (SE EXISTIR TABELA)
SELECT '=== VENDAS DO PRODUTO ===' as secao;

-- Verificar se existe tabela de vendas
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vendas'
) as tabela_vendas_existe;

-- 5. ANÁLISE DE DEPENDÊNCIAS
SELECT '=== ANÁLISE DE DEPENDÊNCIAS ===' as secao;

WITH dependencias_analise AS (
  SELECT 
    p.id,
    p.codigo_pdv,
    p.nome,
    p.status,
    p.ficha_tecnica_id,
    ft.nome as ficha_nome,
    ft.ativo as ficha_ativa,
    -- Contar dependências
    (SELECT COUNT(*) FROM public.fichas_insumos fi WHERE fi.ficha_id = ft.id) as insumos_count,
    (SELECT COUNT(*) FROM public.fichas_bases fb WHERE fb.ficha_id = ft.id) as bases_count,
    (SELECT COUNT(*) FROM public.fichas_produtosprontos fpp WHERE fpp.ficha_id = ft.id) as produtos_prontos_count,
    (SELECT COUNT(*) FROM public.insumos_embalagem_delivery ied WHERE ied.ficha_id = ft.id) as embalagens_count,
    (SELECT COUNT(*) FROM public.fichas_produtosprontos fpp2 WHERE fpp2.produto_ficha_id = p.id) as usado_como_produto_pronto_count
  FROM public.produtos p
  INNER JOIN public.fichas_tecnicas ft ON ft.id = p.ficha_tecnica_id
  WHERE p.codigo_pdv = '80'
    AND p.status = 'ativo'
)
SELECT 
  'Análise completa' as tipo,
  id,
  codigo_pdv,
  nome,
  status,
  ficha_tecnica_id,
  ficha_nome,
  ficha_ativa,
  insumos_count,
  bases_count,
  produtos_prontos_count,
  embalagens_count,
  usado_como_produto_pronto_count,
  CASE 
    WHEN insumos_count > 0 OR bases_count > 0 OR produtos_prontos_count > 0 OR embalagens_count > 0 THEN 'FICHA TEM CONTEÚDO'
    ELSE 'FICHA VAZIA'
  END as ficha_status,
  CASE 
    WHEN usado_como_produto_pronto_count > 0 THEN 'USADO COMO PRODUTO PRONTO'
    ELSE 'NÃO USADO COMO PRODUTO PRONTO'
  END as produto_status
FROM dependencias_analise;

-- 6. ESTRATÉGIA DE DELEÇÃO
SELECT '=== ESTRATÉGIA DE DELEÇÃO ===' as secao;

-- Verificar se pode deletar o produto
WITH pode_deletar AS (
  SELECT 
    p.id,
    p.codigo_pdv,
    p.nome,
    -- Verificar se tem dependências que impedem deleção
    CASE 
      WHEN (SELECT COUNT(*) FROM public.fichas_produtosprontos fpp WHERE fpp.produto_ficha_id = p.id) > 0 
      THEN 'NÃO PODE DELETAR - Usado como produto pronto'
      WHEN (SELECT COUNT(*) FROM public.fichas_insumos fi INNER JOIN public.fichas_tecnicas ft ON ft.id = fi.ficha_id WHERE ft.id = p.ficha_tecnica_id) > 0
      THEN 'NÃO PODE DELETAR - Ficha tem insumos'
      WHEN (SELECT COUNT(*) FROM public.fichas_bases fb INNER JOIN public.fichas_tecnicas ft ON ft.id = fb.ficha_id WHERE ft.id = p.ficha_tecnica_id) > 0
      THEN 'NÃO PODE DELETAR - Ficha tem bases'
      WHEN (SELECT COUNT(*) FROM public.fichas_produtosprontos fpp INNER JOIN public.fichas_tecnicas ft ON ft.id = fpp.ficha_id WHERE ft.id = p.ficha_tecnica_id) > 0
      THEN 'NÃO PODE DELETAR - Ficha tem produtos prontos'
      WHEN (SELECT COUNT(*) FROM public.insumos_embalagem_delivery ied INNER JOIN public.fichas_tecnicas ft ON ft.id = ied.ficha_id WHERE ft.id = p.ficha_tecnica_id) > 0
      THEN 'NÃO PODE DELETAR - Ficha tem embalagens'
      ELSE 'PODE DELETAR - Sem dependências críticas'
    END as status_delecao
  FROM public.produtos p
  WHERE p.codigo_pdv = '80'
    AND p.status = 'ativo'
)
SELECT 
  'Status de deleção' as tipo,
  id,
  codigo_pdv,
  nome,
  status_delecao
FROM pode_deletar;

-- 7. SCRIPT PARA DELEÇÃO (SE POSSÍVEL)
SELECT '=== SCRIPT PARA DELEÇÃO (EXECUTAR APENAS SE POSSÍVEL) ===' as secao;

-- ⚠️  IMPORTANTE: Este script só deve ser executado se a análise mostrar que é seguro deletar
/*
-- Deletar produto (se não tiver dependências críticas)
DELETE FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'ativo'
  AND id NOT IN (
    -- Excluir produtos que são usados como produto pronto
    SELECT DISTINCT fpp.produto_ficha_id 
    FROM public.fichas_produtosprontos fpp 
    WHERE fpp.produto_ficha_id IS NOT NULL
  );
*/

-- 8. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Produtos código 80 restantes' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'ativo'

UNION ALL

SELECT 
  'Produtos código 80 inativos' as item,
  COUNT(*) as quantidade
FROM public.produtos 
WHERE codigo_pdv = '80' 
  AND status = 'inativo';
