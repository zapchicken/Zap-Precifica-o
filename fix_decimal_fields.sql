-- Script simples para corrigir campos decimais na tabela insumos

-- Alterar quantidade_minima_compra para aceitar decimais
ALTER TABLE public.insumos 
ALTER COLUMN quantidade_minima_compra TYPE NUMERIC;

-- Alterar quantidade_comprar para aceitar decimais  
ALTER TABLE public.insumos 
ALTER COLUMN quantidade_comprar TYPE NUMERIC;
