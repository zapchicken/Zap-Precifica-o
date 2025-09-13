-- =====================================================
-- SQL PARA ADICIONAR CANAIS PADRÃO
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário logado
-- Você pode encontrar o ID do usuário na tabela auth.users

-- Adicionar canais padrão para o usuário específico
INSERT INTO public.canais_venda (nome, taxa_marketplace, taxa_antecipacao, user_id)
VALUES 
  ('Venda Direta', 0, 0, 'SEU_USER_ID_AQUI'),
  ('iFood', 12, 0, 'SEU_USER_ID_AQUI')
ON CONFLICT (nome, user_id) DO NOTHING;

-- Para encontrar seu user_id, execute esta query:
-- SELECT id, email FROM auth.users WHERE email = 'zapchicken@yahoo.com';
