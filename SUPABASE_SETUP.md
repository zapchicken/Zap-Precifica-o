# 🚀 Configuração do Supabase para ZapPrice

## 📋 Pré-requisitos

1. **Conta no Supabase**: [https://supabase.com](https://supabase.com)
2. **Projeto criado** no Supabase
3. **Node.js** instalado (versão 16+)

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Digite um nome para o projeto (ex: "zapprice")
6. Escolha uma senha forte para o banco
7. Escolha a região mais próxima
8. Clique em "Create new project"

### 2. Obter Credenciais

1. No seu projeto, vá para **Settings** → **API**
2. Copie a **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
3. Copie a **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configurar Variáveis de Ambiente

1. **Renomeie** o arquivo `env.example` para `.env.local`
2. **Edite** o arquivo `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 4. Executar SQL do Schema

1. No Supabase, vá para **SQL Editor**
2. Execute o seguinte SQL para criar as tabelas:

```sql
-- Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Criar tabela de fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social VARCHAR NOT NULL,
  pessoa_contato VARCHAR,
  telefone VARCHAR,
  status VARCHAR DEFAULT 'ativo',
  condicoes_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Criar tabela de insumos
CREATE TABLE IF NOT EXISTS public.insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_insumo TEXT,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  categoria TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  tipo_embalagem TEXT,
  preco_por_unidade NUMERIC NOT NULL,
  fator_correcao NUMERIC DEFAULT 1.00,
  quantidade_minima_compra INTEGER DEFAULT 0,
  ultima_compra DATE,
  quantidade_comprar INTEGER DEFAULT 0,
  deposito TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de bases
CREATE TABLE IF NOT EXISTS public.bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  tipo_produto TEXT NOT NULL,
  quantidade_total NUMERIC DEFAULT 0,
  unidade_produto TEXT DEFAULT 'kg',
  custo_total_batelada NUMERIC DEFAULT 0,
  custo_por_kg NUMERIC,
  custo_por_unidade NUMERIC,
  rendimento TEXT,
  tempo_preparo INTEGER,
  data_ficha DATE DEFAULT CURRENT_DATE,
  foto TEXT,
  modo_preparo TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de fichas técnicas
CREATE TABLE IF NOT EXISTS public.fichas_tecnicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  codigo VARCHAR,
  descricao TEXT,
  categoria VARCHAR,
  tipo_produto VARCHAR,
  rendimento NUMERIC,
  unidade_rendimento VARCHAR,
  tempo_preparo INTEGER,
  modo_preparo TEXT,
  custo_total_producao NUMERIC,
  custo_por_unidade NUMERIC,
  preco_sugerido NUMERIC,
  margem_contribuicao NUMERIC,
  observacoes TEXT,
  foto TEXT,
  data_ficha DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabelas de relacionamento
CREATE TABLE IF NOT EXISTS public.bases_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id UUID REFERENCES public.bases(id) NOT NULL,
  insumo_id UUID REFERENCES public.insumos(id) NOT NULL,
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  custo NUMERIC NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fichas_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID REFERENCES public.fichas_tecnicas(id) NOT NULL,
  insumo_id UUID REFERENCES public.insumos(id) NOT NULL,
  quantidade NUMERIC NOT NULL,
  unidade VARCHAR NOT NULL,
  custo_unitario NUMERIC,
  custo_total NUMERIC,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fichas_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID REFERENCES public.fichas_tecnicas(id) NOT NULL,
  base_id UUID REFERENCES public.bases(id) NOT NULL,
  quantidade NUMERIC NOT NULL,
  unidade VARCHAR NOT NULL,
  custo_unitario NUMERIC,
  custo_total NUMERIC,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bases_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_bases ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (usuário só vê seus próprios dados)
CREATE POLICY "Users can view own fornecedores" ON public.fornecedores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fornecedores" ON public.fornecedores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fornecedores" ON public.fornecedores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fornecedores" ON public.fornecedores
  FOR DELETE USING (auth.uid() = user_id);

-- Repetir para outras tabelas...
```

### 5. Testar Conexão

1. **Reinicie** o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. **Acesse** o Dashboard
3. **Verifique** o componente "Status do Supabase"
4. **Clique** em "Testar Conexão"

## 🚨 Solução de Problemas

### Erro: "Invalid API key"
- Verifique se a chave anônima está correta
- Certifique-se de que não há espaços extras

### Erro: "Invalid URL"
- Verifique se a URL do projeto está correta
- Certifique-se de que inclui `https://`

### Erro: "Connection failed"
- Verifique se o projeto está ativo no Supabase
- Verifique se as tabelas foram criadas corretamente
- Verifique as políticas RLS

### Erro: "Table doesn't exist"
- Execute o SQL do schema novamente
- Verifique se não há erros de sintaxe

## 📱 Próximos Passos

Após conectar com sucesso:

1. **Teste** as funcionalidades básicas
2. **Cadastre** alguns insumos de teste
3. **Crie** fichas técnicas
4. **Configure** fornecedores

## 🔒 Segurança

- **NUNCA** commite o arquivo `.env.local`
- **SEMPRE** use políticas RLS
- **MANTENHA** as chaves seguras
- **ROTACIONE** as chaves regularmente

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique o console do navegador
2. Verifique os logs do Supabase
3. Teste a conexão no SQL Editor
4. Verifique se as variáveis de ambiente estão carregadas
