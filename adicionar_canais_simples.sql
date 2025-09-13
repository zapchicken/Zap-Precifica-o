-- Execute este SQL no Supabase SQL Editor
-- Primeiro execute o SQL "encontrar_user_id.sql" para pegar seu ID

-- Substitua 'c9757bef-8d70-4674-acb9-137f2f9ae203' pelo seu user_id real
INSERT INTO public.canais_venda (nome, taxa_marketplace, taxa_antecipacao, user_id)
VALUES 
  ('Venda Direta', 0, 0, 'c9757bef-8d70-4674-acb9-137f2f9ae203'),
  ('iFood', 12, 0, 'c9757bef-8d70-4674-acb9-137f2f9ae203')
ON CONFLICT DO NOTHING;
