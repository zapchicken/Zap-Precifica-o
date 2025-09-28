-- Script para executar a criação da tabela bases_bases no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela para bases como insumos em outras bases
CREATE TABLE IF NOT EXISTS public.bases_bases (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    base_id uuid NOT NULL, -- Base que contém a outra base como insumo
    base_insumo_id uuid NOT NULL, -- Base que está sendo usada como insumo
    quantidade numeric NOT NULL,
    unidade text NOT NULL,
    custo_unitario numeric NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bases_bases_pkey PRIMARY KEY (id),
    CONSTRAINT bases_bases_base_id_fkey FOREIGN KEY (base_id) REFERENCES public.bases (id) ON DELETE CASCADE,
    CONSTRAINT bases_bases_base_insumo_id_fkey FOREIGN KEY (base_insumo_id) REFERENCES public.bases (id) ON DELETE CASCADE,
    CONSTRAINT bases_bases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_bases_bases_base_id ON public.bases_bases USING btree (base_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_bases_bases_base_insumo_id ON public.bases_bases USING btree (base_insumo_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_bases_bases_user_id ON public.bases_bases USING btree (user_id) TABLESPACE pg_default;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.bases_bases ENABLE ROW LEVEL SECURITY;

-- Política RLS para permitir acesso apenas aos dados do usuário
CREATE POLICY "Users can access their own bases_bases" ON public.bases_bases
    FOR ALL USING (auth.uid() = user_id);

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bases_bases' 
ORDER BY ordinal_position;
