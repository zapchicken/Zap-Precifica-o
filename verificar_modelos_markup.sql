-- Script para verificar a tabela modelos_markup

-- 1. Verificar se a tabela existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'modelos_markup';

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'modelos_markup'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'modelos_markup';

-- 4. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'modelos_markup';

-- 5. Verificar dados na tabela (sem filtro de usuário para debug)
SELECT COUNT(*) as total_registros FROM public.modelos_markup;

-- 6. Verificar dados com user_id específico (substitua pelo seu user_id)
-- SELECT * FROM public.modelos_markup WHERE user_id = 'SEU_USER_ID_AQUI';

-- 7. Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'modelos_markup';
