    -- =====================================================
    -- SCRIPT PARA ADICIONAR CONSTRAINT UNIQUE NO CÓDIGO PDV
    -- =====================================================
    -- 
    -- ⚠️  ATENÇÃO: Este script vai adicionar uma constraint UNIQUE
    -- para prevenir futuras duplicatas de código PDV
    -- NÃO APAGA nenhum dado, apenas adiciona proteção
    --
    -- =====================================================

    -- 1. VERIFICAR SITUAÇÃO ATUAL
    SELECT '=== SITUAÇÃO ATUAL ===' as secao;

    -- Verificar se já existe constraint UNIQUE
    SELECT 
    constraint_name,
    constraint_type,
    table_name
    FROM information_schema.table_constraints 
    WHERE table_name = 'produtos' 
    AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%codigo_pdv%';

    -- Verificar duplicatas atuais
    SELECT 
    'Duplicatas atuais' as status,
    COUNT(*) as quantidade
    FROM (
    SELECT codigo_pdv, user_id
    FROM public.produtos 
    WHERE codigo_pdv IS NOT NULL 
        AND codigo_pdv != ''
        AND status = 'ativo'
    GROUP BY codigo_pdv, user_id
    HAVING COUNT(*) > 1
    ) duplicatas;

    -- 2. VERIFICAR ESTRUTURA DA TABELA
    SELECT '=== ESTRUTURA DA TABELA PRODUTOS ===' as secao;

    SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'produtos'
    AND column_name IN ('codigo_pdv', 'user_id')
    ORDER BY ordinal_position;

    -- 3. ADICIONAR CONSTRAINT UNIQUE
    SELECT '=== ADICIONANDO CONSTRAINT UNIQUE ===' as secao;

    -- Adicionar constraint UNIQUE para codigo_pdv + user_id
    DO $$
    BEGIN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'produtos_codigo_pdv_user_unique' 
        AND table_name = 'produtos'
        AND constraint_type = 'UNIQUE'
    ) THEN
        -- Adicionar constraint UNIQUE
        ALTER TABLE public.produtos 
        ADD CONSTRAINT produtos_codigo_pdv_user_unique 
        UNIQUE (codigo_pdv, user_id);
        
        RAISE NOTICE '✅ Constraint UNIQUE adicionada com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Constraint UNIQUE já existe.';
    END IF;
    END $$;

    -- 4. VERIFICAR SE A CONSTRAINT FOI CRIADA
    SELECT '=== VERIFICAÇÃO DA CONSTRAINT ===' as secao;

    SELECT 
    'Constraint criada' as status,
    CASE 
        WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'produtos_codigo_pdv_user_unique' 
        AND table_name = 'produtos'
        AND constraint_type = 'UNIQUE'
        ) THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as constraint_status;

    -- 5. TESTAR A CONSTRAINT
    SELECT '=== TESTE DA CONSTRAINT ===' as secao;

    -- Verificar se ainda há duplicatas ativas
    SELECT 
    'Duplicatas ativas restantes' as status,
    COUNT(*) as quantidade
    FROM (
    SELECT codigo_pdv, user_id
    FROM public.produtos 
    WHERE codigo_pdv IS NOT NULL 
        AND codigo_pdv != ''
        AND status = 'ativo'
    GROUP BY codigo_pdv, user_id
    HAVING COUNT(*) > 1
    ) duplicatas;

    -- 6. RESUMO FINAL
    SELECT '=== RESUMO FINAL ===' as secao;

    SELECT 
    'Total de produtos' as item,
    COUNT(*) as quantidade
    FROM public.produtos

    UNION ALL

    SELECT 
    'Total de produtos ativos' as item,
    COUNT(*) as quantidade
    FROM public.produtos 
    WHERE status = 'ativo'

    UNION ALL

    SELECT 
    'Total de produtos com código PDV' as item,
    COUNT(*) as quantidade
    FROM public.produtos 
    WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
    AND status = 'ativo'

    UNION ALL

    SELECT 
    'Total de códigos PDV únicos' as item,
    COUNT(DISTINCT codigo_pdv) as quantidade
    FROM public.produtos 
    WHERE codigo_pdv IS NOT NULL 
    AND codigo_pdv != ''
    AND status = 'ativo'

    UNION ALL

    SELECT 
    'Total de duplicatas ativas' as item,
    COUNT(*) as quantidade
    FROM (
    SELECT codigo_pdv, user_id
    FROM public.produtos 
    WHERE codigo_pdv IS NOT NULL 
        AND codigo_pdv != ''
        AND status = 'ativo'
    GROUP BY codigo_pdv, user_id
    HAVING COUNT(*) > 1
    ) duplicatas;

    -- 7. INFORMAÇÕES SOBRE A CONSTRAINT
    SELECT '=== INFORMAÇÕES DA CONSTRAINT ===' as secao;

    SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    kcu.ordinal_position
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_name = 'produtos_codigo_pdv_user_unique'
    ORDER BY kcu.ordinal_position;

    -- 8. PRÓXIMOS PASSOS
    SELECT '=== PRÓXIMOS PASSOS ===' as secao;

    SELECT '1. Constraint UNIQUE adicionada com sucesso!' as passo;
    SELECT '2. Futuras tentativas de criar produtos com código PDV duplicado falharão' as passo;
    SELECT '3. O sistema agora previne duplicatas automaticamente' as passo;
    SELECT '4. Teste criando um produto com código PDV existente para verificar' as passo;
