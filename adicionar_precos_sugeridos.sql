-- =====================================================
-- ADICIONAR CAMPOS DE PREÇOS SUGERIDOS NA TABELA PRODUTOS
-- =====================================================

-- Adicionar colunas para preços sugeridos
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS preco_sugerido_venda_direta NUMERIC NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS preco_sugerido_ifood NUMERIC NULL DEFAULT 0;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.produtos.preco_sugerido_venda_direta IS 'Preço sugerido calculado para venda direta baseado no markup da categoria';
COMMENT ON COLUMN public.produtos.preco_sugerido_ifood IS 'Preço sugerido calculado para iFood baseado no markup da categoria';

-- Criar índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_produtos_preco_sugerido_venda_direta ON public.produtos(preco_sugerido_venda_direta);
CREATE INDEX IF NOT EXISTS idx_produtos_preco_sugerido_ifood ON public.produtos(preco_sugerido_ifood);

-- Atualizar RLS (Row Level Security) se necessário
-- Os campos herdam as mesmas políticas de segurança da tabela produtos
