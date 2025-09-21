-- Adicionar colunas de cupons por categoria na tabela modelos_markup
-- Valor Cupom VD (Venda Direta) e Valor Cupom MKT (Marketplace) para cada categoria
-- Baseado na estrutura atual da tabela

-- ACOMPANHAMENTOS
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_acompanhamentos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_acompanhamentos NUMERIC DEFAULT 0;

-- BEBIDAS CERVEJAS E CHOPP
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_bebidas_cervejas_e_chopp NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_bebidas_cervejas_e_chopp NUMERIC DEFAULT 0;

-- BEBIDAS REFRIGERANTES
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_bebidas_refrigerantes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_bebidas_refrigerantes NUMERIC DEFAULT 0;

-- BEBIDAS SUCOS
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_bebidas_sucos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_bebidas_sucos NUMERIC DEFAULT 0;

-- COMBO LANCHES CARNE ANGUS
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_combo_lanches_carne_angus NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_combo_lanches_carne_angus NUMERIC DEFAULT 0;

-- COMBO LANCHES FRANGO
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_combo_lanches_frango NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_combo_lanches_frango NUMERIC DEFAULT 0;

-- FRANGO AMERICANO
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_frango_americano NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_frango_americano NUMERIC DEFAULT 0;

-- JUMBOS
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_jumbos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_jumbos NUMERIC DEFAULT 0;

-- LANCHES
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_lanches NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_lanches NUMERIC DEFAULT 0;

-- MOLHOS
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_molhos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_molhos NUMERIC DEFAULT 0;

-- PROMOÇÕES
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_promocoes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_promocoes NUMERIC DEFAULT 0;

-- SALADAS
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_saladas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_saladas NUMERIC DEFAULT 0;

-- SOBREMESAS
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_sobremesas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_sobremesas NUMERIC DEFAULT 0;

-- ZAPBOX
ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_zapbox NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_zapbox NUMERIC DEFAULT 0;

-- Atualizar registros existentes para garantir que os valores padrão sejam aplicados
UPDATE public.modelos_markup 
SET 
  valor_cupom_vd_acompanhamentos = COALESCE(valor_cupom_vd_acompanhamentos, 0),
  valor_cupom_mkt_acompanhamentos = COALESCE(valor_cupom_mkt_acompanhamentos, 0),
  valor_cupom_vd_bebidas_cervejas_e_chopp = COALESCE(valor_cupom_vd_bebidas_cervejas_e_chopp, 0),
  valor_cupom_mkt_bebidas_cervejas_e_chopp = COALESCE(valor_cupom_mkt_bebidas_cervejas_e_chopp, 0),
  valor_cupom_vd_bebidas_refrigerantes = COALESCE(valor_cupom_vd_bebidas_refrigerantes, 0),
  valor_cupom_mkt_bebidas_refrigerantes = COALESCE(valor_cupom_mkt_bebidas_refrigerantes, 0),
  valor_cupom_vd_bebidas_sucos = COALESCE(valor_cupom_vd_bebidas_sucos, 0),
  valor_cupom_mkt_bebidas_sucos = COALESCE(valor_cupom_mkt_bebidas_sucos, 0),
  valor_cupom_vd_combo_lanches_carne_angus = COALESCE(valor_cupom_vd_combo_lanches_carne_angus, 0),
  valor_cupom_mkt_combo_lanches_carne_angus = COALESCE(valor_cupom_mkt_combo_lanches_carne_angus, 0),
  valor_cupom_vd_combo_lanches_frango = COALESCE(valor_cupom_vd_combo_lanches_frango, 0),
  valor_cupom_mkt_combo_lanches_frango = COALESCE(valor_cupom_mkt_combo_lanches_frango, 0),
  valor_cupom_vd_frango_americano = COALESCE(valor_cupom_vd_frango_americano, 0),
  valor_cupom_mkt_frango_americano = COALESCE(valor_cupom_mkt_frango_americano, 0),
  valor_cupom_vd_jumbos = COALESCE(valor_cupom_vd_jumbos, 0),
  valor_cupom_mkt_jumbos = COALESCE(valor_cupom_mkt_jumbos, 0),
  valor_cupom_vd_lanches = COALESCE(valor_cupom_vd_lanches, 0),
  valor_cupom_mkt_lanches = COALESCE(valor_cupom_mkt_lanches, 0),
  valor_cupom_vd_molhos = COALESCE(valor_cupom_vd_molhos, 0),
  valor_cupom_mkt_molhos = COALESCE(valor_cupom_mkt_molhos, 0),
  valor_cupom_vd_promocoes = COALESCE(valor_cupom_vd_promocoes, 0),
  valor_cupom_mkt_promocoes = COALESCE(valor_cupom_mkt_promocoes, 0),
  valor_cupom_vd_saladas = COALESCE(valor_cupom_vd_saladas, 0),
  valor_cupom_mkt_saladas = COALESCE(valor_cupom_mkt_saladas, 0),
  valor_cupom_vd_sobremesas = COALESCE(valor_cupom_vd_sobremesas, 0),
  valor_cupom_mkt_sobremesas = COALESCE(valor_cupom_mkt_sobremesas, 0),
  valor_cupom_vd_zapbox = COALESCE(valor_cupom_vd_zapbox, 0),
  valor_cupom_mkt_zapbox = COALESCE(valor_cupom_mkt_zapbox, 0);

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'modelos_markup' 
  AND table_schema = 'public'
  AND column_name LIKE 'valor_cupom_%'
ORDER BY column_name;
