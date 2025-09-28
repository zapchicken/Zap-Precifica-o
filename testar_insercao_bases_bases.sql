-- Script para testar inserção na tabela bases_bases
-- Execute este script no SQL Editor do Supabase para testar

-- 1. Verificar se existem bases para testar
SELECT id, nome, codigo FROM public.bases 
WHERE user_id = auth.uid() 
LIMIT 2;

-- 2. Testar inserção manual (substitua os IDs pelos reais)
-- INSERT INTO public.bases_bases (
--   base_id,
--   base_insumo_id,
--   quantidade,
--   unidade,
--   custo_unitario,
--   user_id
-- ) VALUES (
--   'SUBSTITUA_PELO_ID_DA_BASE_PRINCIPAL',
--   'SUBSTITUA_PELO_ID_DA_BASE_INSUMO',
--   1.5,
--   'kg',
--   10.50,
--   auth.uid()
-- );

-- 3. Verificar se a inserção funcionou
-- SELECT * FROM public.bases_bases WHERE user_id = auth.uid();

-- 4. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'bases_bases';
