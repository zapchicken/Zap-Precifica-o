-- =====================================================
-- POLÍTICAS DE SEGURANÇA PARA SUPABASE STORAGE
-- Bucket: fichas-imagens
-- =====================================================

-- 1. Habilitar RLS no bucket (se ainda não estiver habilitado)
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 2. Política para permitir leitura pública do bucket
CREATE POLICY "Permitir leitura pública do bucket fichas-imagens" ON storage.objects
FOR SELECT
USING (bucket_id = 'fichas-imagens');

-- 3. Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Permitir upload para usuários autenticados" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'fichas-imagens' 
  AND auth.role() = 'authenticated'
);

-- 4. Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'fichas-imagens' 
  AND auth.role() = 'authenticated'
);

-- 5. Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'fichas-imagens' 
  AND auth.role() = 'authenticated'
);

-- 6. Verificar se o bucket existe e está configurado corretamente
-- Se o bucket não existir, criar com as configurações corretas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fichas-imagens',
  'fichas-imagens',
  true, -- Bucket público para leitura
  5242880, -- Limite de 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'] -- Tipos permitidos
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 7. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 8. Se necessário, remover políticas conflitantes
-- (Execute apenas se houver conflitos)
-- DROP POLICY IF EXISTS "nome_da_politica_conflitante" ON storage.objects;
