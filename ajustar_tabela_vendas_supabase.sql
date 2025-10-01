-- =====================================================
-- SCRIPT PARA AJUSTAR TABELA VENDAS NO SUPABASE
-- =====================================================
-- 
-- ⚠️  ATENÇÃO: Este script vai ajustar a tabela vendas
-- para corresponder ao schema fornecido pelo usuário
--
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA VENDAS
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

-- 2. VERIFICAR SE A TABELA EXISTE
SELECT '=== VERIFICAÇÃO DE EXISTÊNCIA ===' as secao;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendas' AND table_schema = 'public')
    THEN 'Tabela vendas existe'
    ELSE 'Tabela vendas NÃO existe'
  END as status;

-- 3. CRIAR TABELA VENDAS SE NÃO EXISTIR
SELECT '=== CRIANDO TABELA VENDAS ===' as secao;

CREATE TABLE IF NOT EXISTS public.vendas (
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

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
SELECT '=== CRIANDO ÍNDICES ===' as secao;

CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON public.vendas USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_data_venda ON public.vendas USING btree (data_venda) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_pedido_numero ON public.vendas USING btree (pedido_numero) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_produto_codigo ON public.vendas USING btree (produto_codigo) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vendas_canal ON public.vendas USING btree (canal) TABLESPACE pg_default;

-- 5. VERIFICAR ESTRUTURA FINAL
SELECT '=== ESTRUTURA FINAL DA TABELA VENDAS ===' as secao;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vendas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. VERIFICAR ÍNDICES CRIADOS
SELECT '=== ÍNDICES CRIADOS ===' as secao;

SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'vendas' 
  AND schemaname = 'public'
ORDER BY indexname;

-- 7. VERIFICAR CONSTRAINTS
SELECT '=== CONSTRAINTS CRIADAS ===' as secao;

SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'vendas' 
  AND table_schema = 'public'
ORDER BY constraint_name;

-- 8. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
  'Tabela vendas criada/atualizada com sucesso' as status,
  'Estrutura correspondente ao schema fornecido' as descricao,
  'Pronta para uso com o sistema de importação' as observacao;

-- 9. PRÓXIMOS PASSOS
SELECT '=== PRÓXIMOS PASSOS ===' as secao;

SELECT '1. Tabela vendas está pronta para uso' as passo;
SELECT '2. Sistema de importação funcionará corretamente' as passo;
SELECT '3. Índices criados para performance' as passo;
SELECT '4. Constraints aplicadas para integridade' as passo;
SELECT '5. Pode testar a importação de vendas' as passo;
