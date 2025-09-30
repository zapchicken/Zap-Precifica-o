# 🔧 Configuração das Variáveis de Ambiente no Vercel

## Problema Identificado

Os produtos aparecem localmente mas não em produção no Vercel porque as **variáveis de ambiente do Supabase não estão configuradas** no Vercel.

## Solução

### 1. Acessar o Dashboard do Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto `zapprice`

### 2. Configurar Variáveis de Ambiente

1. No dashboard do projeto, vá para **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 3. Obter as Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Vá para o seu projeto
3. Navegue para **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 4. Configurar no Vercel

1. **VITE_SUPABASE_URL**: Cole a URL do projeto Supabase
2. **VITE_SUPABASE_ANON_KEY**: Cole a chave anônima pública

### 5. Redeploy

Após configurar as variáveis:
1. Vá para **Deployments** no Vercel
2. Clique em **Redeploy** no último deployment
3. Ou faça um novo commit para triggerar um novo deploy

## Verificação

Após o redeploy, acesse a aplicação e:
1. Vá para a página "Produtos de Venda"
2. Clique no botão "🔍 Diagnóstico"
3. Verifique se todas as verificações estão com ✅

## Estrutura das Variáveis

```bash
# No Vercel Environment Variables
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
```

## Troubleshooting

### Se ainda não funcionar:

1. **Verifique se as variáveis estão corretas** no dashboard do Vercel
2. **Confirme que o projeto Supabase está ativo**
3. **Verifique se as tabelas foram criadas** no Supabase
4. **Teste a conexão** usando o diagnóstico na aplicação

### Logs do Vercel:

1. Vá para **Functions** → **View Function Logs**
2. Procure por erros relacionados ao Supabase
3. Verifique se as variáveis estão sendo carregadas

## Próximos Passos

Após configurar as variáveis:
1. ✅ Produtos devem aparecer em produção
2. ✅ Autenticação deve funcionar
3. ✅ Todas as funcionalidades devem estar operacionais

---

**Nota**: As variáveis de ambiente são essenciais para a aplicação funcionar em produção. Sem elas, a aplicação não consegue conectar com o banco de dados Supabase.
