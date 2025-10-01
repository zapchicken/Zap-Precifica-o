-- =====================================================
-- SCRIPT PARA DELETAR E RECRIAR TABELA VENDAS
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai DELETAR a tabela vendas
-- e recriar do zero com a estrutura correta
--
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT '=== ESTRUTURA ATUAL DA TABELA VENDAS ===' as secao;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vendas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS EXISTENTES
SELECT '=== DADOS EXISTENTES ===' as secao;

SELECT 
  'Total de vendas' as item,
  COUNT(*) as quantidade
FROM public.vendas;

-- 3. DELETAR TABELA VENDAS
SELECT '=== DELETANDO TABELA VENDAS ===' as secao;

-- Deletar índices primeiro
DROP INDEX IF EXISTS idx_vendas_user_id;
DROP INDEX IF EXISTS idx_vendas_data_venda;
DROP INDEX IF EXISTS idx_vendas_pedido_numero;
DROP INDEX IF EXISTS idx_vendas_produto_codigo;
DROP INDEX IF EXISTS idx_vendas_canal;

-- Deletar tabela
DROP TABLE IF EXISTS public.vendas CASCADE;

-- 4. RECRIAR TABELA VENDAS
SELECT '=== RECRIANDO TABELA VENDAS ===' as secao;

CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  data_venda DATE NOT NULL,
  pedido_numero TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  produto_codigo TEXT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  canal TEXT NULL,
  observacoes TEXT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT vendas_pkey PRIMARY KEY (id),
  CONSTRAINT vendas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- 5. CRIAR ÍNDICES
SELECT '=== CRIANDO ÍNDICES ===' as secao;

CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON public.vendas USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_data_venda ON public.vendas USING btree (data_venda) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_pedido_numero ON public.vendas USING btree (pedido_numero) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_produto_codigo ON public.vendas USING btree (produto_codigo) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_canal ON public.vendas USING btree (canal) TABLESPACE pg_default;

-- 6. VERIFICAR ESTRUTURA FINAL
SELECT '=== ESTRUTURA FINAL ===' as secao;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vendas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. VERIFICAR ÍNDICES CRIADOS
SELECT '=== ÍNDICES CRIADOS ===' as secao;

SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'vendas' 
  AND schemaname = 'public'
ORDER BY indexname;

-- 8. VERIFICAR CONSTRAINTS
SELECT '=== CONSTRAINTS CRIADAS ===' as secao;

SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'vendas' 
  AND table_schema = 'public'
ORDER BY constraint_name;

-- 9. TESTAR INSERÇÃO DE DADOS
SELECT '=== TESTANDO INSERÇÃO DE DADOS ===' as secao;

-- Inserir dados de teste
INSERT INTO public.vendas (
  data_venda,
  pedido_numero,
  produto_nome,
  produto_codigo,
  quantidade,
  valor_unitario,
  valor_total,
  canal,
  observacoes,
  user_id
) VALUES (
  '2025-09-30',
  'PED-20250930-0001',
  'SuperBalde Premium (13 Un.)',
  '122',
  201,
  93.02,
  18696.19,
  'balcao',
  'Teste de importação',
  (SELECT id FROM auth.users LIMIT 1)
);

-- 10. VERIFICAR SE DADOS FORAM INSERIDOS
SELECT '=== VERIFICAÇÃO DE DADOS INSERIDOS ===' as secao;

SELECT 
  id,
  data_venda,
  pedido_numero,
  produto_nome,
  produto_codigo,
  quantidade,
  valor_unitario,
  valor_total,
  canal,
  created_at
FROM public.vendas
ORDER BY created_at DESC;

-- 11. LIMPAR DADOS DE TESTE
SELECT '=== LIMPANDO DADOS DE TESTE ===' as secao;

DELETE FROM public.vendas WHERE pedido_numero = 'PED-20250930-0001';

-- 12. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Tabela vendas deletada e recriada com sucesso' as status,
  'Estrutura correta aplicada' as descricao,
  'Pronta para importação' as observacao;

-- 13. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Tabela vendas foi recriada com sucesso' as passo;
SELECT '2. Estrutura está correta' as passo;
SELECT '3. Índices foram criados' as passo;
SELECT '4. Constraints foram aplicadas' as passo;
SELECT '5. Pode testar a importação novamente' as passo;
SELECT '6. Use o formato da imagem com data 30/09/2025' as passo;
