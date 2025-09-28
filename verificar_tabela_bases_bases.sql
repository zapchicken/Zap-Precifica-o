-- Verificar se a tabela bases_bases foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bases_bases' 
ORDER BY ordinal_position;

-- Verificar se as políticas RLS estão ativas
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

-- Verificar se a tabela tem dados
SELECT COUNT(*) as total_registros FROM public.bases_bases;

-- Verificar estrutura da tabela
\d public.bases_bases;
