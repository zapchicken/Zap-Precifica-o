# 🔧 Configuração do Supabase Storage

## ❌ Problema Atual
```
StorageApiError: new row violates row-level security policy
```

## ✅ Solução: Configurar Políticas RLS

### 1. Acesse o Supabase Dashboard
- Vá para: **Storage** > **Policies**
- Ou: **SQL Editor**

### 2. Execute este SQL no SQL Editor:

```sql
-- Habilitar RLS no bucket
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Public read access for fichas-imagens" ON storage.objects
FOR SELECT
USING (bucket_id = 'fichas-imagens');

-- Política para upload (usuários autenticados)
CREATE POLICY "Authenticated users can upload to fichas-imagens" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'fichas-imagens' 
  AND auth.role() = 'authenticated'
);

-- Política para atualização (usuários autenticados)
CREATE POLICY "Authenticated users can update fichas-imagens" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'fichas-imagens' 
  AND auth.role() = 'authenticated'
);

-- Política para exclusão (usuários autenticados)
CREATE POLICY "Authenticated users can delete fichas-imagens" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'fichas-imagens' 
  AND auth.role() = 'authenticated'
);
```

### 3. Verificar Configuração do Bucket

No **Storage** > **Buckets**, certifique-se que:

- ✅ **Nome**: `fichas-imagens`
- ✅ **Public**: `true` (para leitura pública)
- ✅ **File size limit**: `5MB` (ou mais se necessário)
- ✅ **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### 4. Testar Upload

Após configurar as políticas, teste o upload novamente.

## 🔍 Verificar se Funcionou

### No SQL Editor, execute:
```sql
-- Verificar políticas criadas
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### Resultado esperado:
```
policyname                                    | cmd    | permissive
----------------------------------------------|--------|-----------
Public read access for fichas-imagens        | SELECT | PERMISSIVE
Authenticated users can upload to fichas-imagens | INSERT | PERMISSIVE
Authenticated users can update fichas-imagens    | UPDATE | PERMISSIVE
Authenticated users can delete fichas-imagens    | DELETE | PERMISSIVE
```

## 🚨 Se Ainda Não Funcionar

### Opção 1: Bucket Público (Desenvolvimento)
```sql
-- Remover todas as políticas
DROP POLICY IF EXISTS "Public read access for fichas-imagens" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to fichas-imagens" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update fichas-imagens" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete fichas-imagens" ON storage.objects;

-- Política mais permissiva (apenas para desenvolvimento)
CREATE POLICY "Allow all operations on fichas-imagens" ON storage.objects
FOR ALL
USING (bucket_id = 'fichas-imagens');
```

### Opção 2: Verificar Autenticação
Certifique-se que o usuário está logado no app antes de fazer upload.

## 📝 Notas Importantes

1. **Desenvolvimento**: Use políticas mais permissivas
2. **Produção**: Use políticas mais restritivas
3. **Backup**: Sempre faça backup antes de alterar políticas
4. **Teste**: Teste em ambiente de desenvolvimento primeiro

## 🎯 Próximos Passos

1. Execute o SQL acima
2. Teste o upload
3. Se funcionar, as imagens aparecerão no bucket
4. URLs públicas serão geradas automaticamente
