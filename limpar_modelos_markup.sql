-- =====================================================
-- LIMPAR DADOS DA TABELA MODELOS_MARKUP
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- ⚠️ ATENÇÃO: Este comando irá APAGAR TODOS os dados da tabela modelos_markup
-- Certifique-se de que você quer fazer isso antes de executar!

-- Opção 1: Limpar TODOS os dados da tabela
DELETE FROM public.modelos_markup;

-- Opção 2: Limpar apenas os dados do seu usuário (mais seguro)
-- Substitua 'SEU_USER_ID_AQUI' pelo seu ID de usuário
-- DELETE FROM public.modelos_markup WHERE user_id = 'SEU_USER_ID_AQUI';

-- Verificar se a tabela está vazia
SELECT COUNT(*) as total_registros FROM public.modelos_markup;

-- Verificar a estrutura da tabela (para confirmar que as colunas estão lá)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modelos_markup' 
  AND table_schema = 'public'
ORDER BY column_name;
