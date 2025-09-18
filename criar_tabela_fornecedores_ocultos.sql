-- =====================================================
-- TABELA PARA CONTROLAR FORNECEDORES OCULTOS POR USUÁRIO
-- =====================================================

-- Criar tabela de fornecedores ocultos
CREATE TABLE IF NOT EXISTS public.fornecedores_ocultos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razao_social TEXT NOT NULL, -- Para referência
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário só pode ocultar um fornecedor uma vez
  UNIQUE(fornecedor_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.fornecedores_ocultos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own hidden fornecedores" ON public.fornecedores_ocultos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hidden fornecedores" ON public.fornecedores_ocultos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hidden fornecedores" ON public.fornecedores_ocultos
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fornecedores_ocultos_user_id ON public.fornecedores_ocultos(user_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ocultos_fornecedor_id ON public.fornecedores_ocultos(fornecedor_id);

-- Comentários
COMMENT ON TABLE public.fornecedores_ocultos IS 'Controle de fornecedores ocultos por usuário';
COMMENT ON COLUMN public.fornecedores_ocultos.fornecedor_id IS 'ID do fornecedor que foi oculto';
COMMENT ON COLUMN public.fornecedores_ocultos.user_id IS 'ID do usuário que ocultou o fornecedor';
COMMENT ON COLUMN public.fornecedores_ocultos.razao_social IS 'Nome do fornecedor para referência';
