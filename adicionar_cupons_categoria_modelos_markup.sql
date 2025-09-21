-- Adicionar colunas de cupons por categoria na tabela modelos_markup
-- Valor Cupom VD (Venda Direta) e Valor Cupom MKT (Marketplace) para cada categoria

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_acompanhamentos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_acompanhamentos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_bebidas_cervejas_e_chopp NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_bebidas_cervejas_e_chopp NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_bebidas_refrigerantes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_bebidas_refrigerantes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_bebidas_sucos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_bebidas_sucos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_combo_lanches_carne_angus NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_combo_lanches_carne_angus NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_combo_lanches_frango NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_combo_lanches_frango NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_frango_americano NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_frango_americano NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_jumbos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_jumbos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_lanches NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_lanches NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_molhos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_molhos NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_promocoes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_promocoes NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_saladas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_saladas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_sobremesas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_sobremesas NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_vd_zapbox NUMERIC DEFAULT 0;

ALTER TABLE public.modelos_markup 
ADD COLUMN IF NOT EXISTS valor_cupom_mkt_zapbox NUMERIC DEFAULT 0;

-- Atualizar registros existentes para garantir que os valores padrão sejam aplicados
UPDATE public.modelos_markup 
SET 
  valor_cupom_vd_acompanhamentos = 0,
  valor_cupom_mkt_acompanhamentos = 0,
  valor_cupom_vd_bebidas_cervejas_e_chopp = 0,
  valor_cupom_mkt_bebidas_cervejas_e_chopp = 0,
  valor_cupom_vd_bebidas_refrigerantes = 0,
  valor_cupom_mkt_bebidas_refrigerantes = 0,
  valor_cupom_vd_bebidas_sucos = 0,
  valor_cupom_mkt_bebidas_sucos = 0,
  valor_cupom_vd_combo_lanches_carne_angus = 0,
  valor_cupom_mkt_combo_lanches_carne_angus = 0,
  valor_cupom_vd_combo_lanches_frango = 0,
  valor_cupom_mkt_combo_lanches_frango = 0,
  valor_cupom_vd_frango_americano = 0,
  valor_cupom_mkt_frango_americano = 0,
  valor_cupom_vd_jumbos = 0,
  valor_cupom_mkt_jumbos = 0,
  valor_cupom_vd_lanches = 0,
  valor_cupom_mkt_lanches = 0,
  valor_cupom_vd_molhos = 0,
  valor_cupom_mkt_molhos = 0,
  valor_cupom_vd_promocoes = 0,
  valor_cupom_mkt_promocoes = 0,
  valor_cupom_vd_saladas = 0,
  valor_cupom_mkt_saladas = 0,
  valor_cupom_vd_sobremesas = 0,
  valor_cupom_mkt_sobremesas = 0,
  valor_cupom_vd_zapbox = 0,
  valor_cupom_mkt_zapbox = 0
WHERE 
  valor_cupom_vd_acompanhamentos IS NULL 
  OR valor_cupom_mkt_acompanhamentos IS NULL
  OR valor_cupom_vd_bebidas_cervejas_e_chopp IS NULL
  OR valor_cupom_mkt_bebidas_cervejas_e_chopp IS NULL
  OR valor_cupom_vd_bebidas_refrigerantes IS NULL
  OR valor_cupom_mkt_bebidas_refrigerantes IS NULL
  OR valor_cupom_vd_bebidas_sucos IS NULL
  OR valor_cupom_mkt_bebidas_sucos IS NULL
  OR valor_cupom_vd_combo_lanches_carne_angus IS NULL
  OR valor_cupom_mkt_combo_lanches_carne_angus IS NULL
  OR valor_cupom_vd_combo_lanches_frango IS NULL
  OR valor_cupom_mkt_combo_lanches_frango IS NULL
  OR valor_cupom_vd_frango_americano IS NULL
  OR valor_cupom_mkt_frango_americano IS NULL
  OR valor_cupom_vd_jumbos IS NULL
  OR valor_cupom_mkt_jumbos IS NULL
  OR valor_cupom_vd_lanches IS NULL
  OR valor_cupom_mkt_lanches IS NULL
  OR valor_cupom_vd_molhos IS NULL
  OR valor_cupom_mkt_molhos IS NULL
  OR valor_cupom_vd_promocoes IS NULL
  OR valor_cupom_mkt_promocoes IS NULL
  OR valor_cupom_vd_saladas IS NULL
  OR valor_cupom_mkt_saladas IS NULL
  OR valor_cupom_vd_sobremesas IS NULL
  OR valor_cupom_mkt_sobremesas IS NULL
  OR valor_cupom_vd_zapbox IS NULL
  OR valor_cupom_mkt_zapbox IS NULL;
