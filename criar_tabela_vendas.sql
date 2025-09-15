-- =====================================================
-- TABELA DE VENDAS PARA ZAPPRICE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_venda DATE NOT NULL,
  pedido_numero TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  produto_codigo TEXT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  canal TEXT NULL,
  observacoes TEXT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON public.vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data_venda ON public.vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_pedido_numero ON public.vendas(pedido_numero);
CREATE INDEX IF NOT EXISTS idx_vendas_produto_codigo ON public.vendas(produto_codigo);
CREATE INDEX IF NOT EXISTS idx_vendas_canal ON public.vendas(canal);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver/editar suas próprias vendas
CREATE POLICY "Usuários podem gerenciar suas próprias vendas" ON public.vendas
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- COMENTÁRIOS DAS COLUNAS
-- =====================================================

COMMENT ON TABLE public.vendas IS 'Tabela para armazenar dados de vendas importados';
COMMENT ON COLUMN public.vendas.id IS 'Identificador único da venda';
COMMENT ON COLUMN public.vendas.data_venda IS 'Data da venda';
COMMENT ON COLUMN public.vendas.pedido_numero IS 'Número do pedido (obrigatório)';
COMMENT ON COLUMN public.vendas.produto_nome IS 'Nome do produto vendido';
COMMENT ON COLUMN public.vendas.produto_codigo IS 'Código do produto (opcional)';
COMMENT ON COLUMN public.vendas.quantidade IS 'Quantidade vendida';
COMMENT ON COLUMN public.vendas.valor_unitario IS 'Valor unitário do produto';
COMMENT ON COLUMN public.vendas.valor_total IS 'Valor total da venda (quantidade × valor_unitario)';
COMMENT ON COLUMN public.vendas.canal IS 'Canal de venda (iFood, WhatsApp, Balcão, etc.) - opcional';
COMMENT ON COLUMN public.vendas.observacoes IS 'Observações adicionais';
COMMENT ON COLUMN public.vendas.user_id IS 'ID do usuário proprietário dos dados';
COMMENT ON COLUMN public.vendas.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.vendas.updated_at IS 'Data da última atualização';
