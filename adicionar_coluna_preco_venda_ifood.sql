    -- Adicionar coluna preco_venda_ifood na tabela produtos
    -- Execute este script no Supabase SQL Editor

    -- Adicionar a nova coluna
    ALTER TABLE produtos 
    ADD COLUMN preco_venda_ifood DECIMAL(10,2) DEFAULT 0;

    -- Adicionar comentário na coluna para documentação
    COMMENT ON COLUMN produtos.preco_venda_ifood IS 'Preço de venda específico para o canal IFood';

    -- Verificar se a coluna foi criada corretamente
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'produtos' 
    AND column_name = 'preco_venda_ifood';
