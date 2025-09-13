-- Verificar se as políticas RLS estão funcionando corretamente
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('config_markup_geral', 'canais_venda', 'config_markup_categoria', 'modelos_markup');

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('config_markup_geral', 'canais_venda', 'config_markup_categoria', 'modelos_markup');

-- 3. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('config_markup_geral', 'canais_venda', 'config_markup_categoria', 'modelos_markup');
