// Script para testar os dados de "Produtos Mais Vendidos" no dashboard
// Execute este script no console do navegador

async function testarProdutosMaisVendidos() {
  console.log('🧪 Testando dados de "Produtos Mais Vendidos"...');
  
  try {
    // 1. Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Usuário não autenticado:', userError);
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    
    // 2. Buscar todas as vendas
    const { data: vendas, error: vendasError } = await supabase
      .from('vendas')
      .select('id, data_venda, pedido_numero, produto_nome, produto_codigo, quantidade, valor_unitario, valor_total, canal, observacoes, created_at')
      .eq('user_id', user.id)
      .order('data_venda', { ascending: false });
    
    if (vendasError) {
      console.error('❌ Erro ao buscar vendas:', vendasError);
      return;
    }
    
    console.log('📊 Total de vendas encontradas:', vendas?.length || 0);
    
    if (!vendas || vendas.length === 0) {
      console.log('⚠️ Nenhuma venda encontrada no banco de dados');
      return;
    }
    
    // 3. Mostrar algumas vendas de exemplo
    console.log('🔍 Primeiras 5 vendas:');
    vendas.slice(0, 5).forEach((venda, index) => {
      console.log(`  ${index + 1}. ${venda.produto_nome} - Qtd: ${venda.quantidade} - Valor: R$ ${venda.valor_total} (${typeof venda.valor_total})`);
    });
    
    // 4. Calcular produtos mais vendidos (mesmo algoritmo do dashboard)
    console.log('\n🧮 Calculando produtos mais vendidos...');
    
    const produtosTop = vendas
      .reduce((acc, venda) => {
        console.log(`🔍 Processando: ${venda.produto_nome} - Valor: ${venda.valor_total} (${typeof venda.valor_total}) - Qtd: ${venda.quantidade} (${typeof venda.quantidade})`);
        
        const existing = acc.find(p => p.nome === venda.produto_nome);
        if (existing) {
          const valorAnterior = existing.vendas;
          const quantidadeAnterior = existing.quantidade;
          
          existing.vendas += parseFloat(venda.valor_total) || 0;
          existing.quantidade += parseInt(venda.quantidade) || 0;
          
          console.log(`  📊 Atualizado: ${valorAnterior} + ${venda.valor_total} = ${existing.vendas}, ${quantidadeAnterior} + ${venda.quantidade} = ${existing.quantidade}`);
        } else {
          const novoProduto = {
            nome: venda.produto_nome,
            vendas: parseFloat(venda.valor_total) || 0,
            quantidade: parseInt(venda.quantidade) || 0,
            margem: "Calculando..."
          };
          
          acc.push(novoProduto);
          console.log(`  🆕 Novo: ${novoProduto.nome} - R$ ${novoProduto.vendas} - Qtd: ${novoProduto.quantidade}`);
        }
        return acc;
      }, [])
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 3);
    
    // 5. Mostrar resultado
    console.log('\n🏆 TOP 3 PRODUTOS MAIS VENDIDOS:');
    produtosTop.forEach((produto, index) => {
      console.log(`  ${index + 1}. ${produto.nome}`);
      console.log(`     💰 Total vendido: R$ ${produto.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`     📦 Quantidade: ${produto.quantidade}`);
      console.log(`     💵 Valor médio: R$ ${(produto.vendas / produto.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log('');
    });
    
    // 6. Verificar se há problemas com os dados
    console.log('🔍 Verificando problemas nos dados...');
    
    const problemas = [];
    
    // Verificar valores nulos ou inválidos
    const vendasComProblemas = vendas.filter(v => 
      !v.valor_total || 
      isNaN(parseFloat(v.valor_total)) || 
      !v.quantidade || 
      isNaN(parseInt(v.quantidade)) ||
      !v.produto_nome
    );
    
    if (vendasComProblemas.length > 0) {
      problemas.push(`❌ ${vendasComProblemas.length} vendas com dados inválidos`);
      console.log('Vendas com problemas:');
      vendasComProblemas.slice(0, 5).forEach(v => {
        console.log(`  - ${v.produto_nome}: valor_total=${v.valor_total}, quantidade=${v.quantidade}`);
      });
    }
    
    // Verificar tipos de dados
    const tiposValorTotal = [...new Set(vendas.map(v => typeof v.valor_total))];
    const tiposQuantidade = [...new Set(vendas.map(v => typeof v.quantidade))];
    
    console.log('📊 Tipos de dados encontrados:');
    console.log(`  valor_total: ${tiposValorTotal.join(', ')}`);
    console.log(`  quantidade: ${tiposQuantidade.join(', ')}`);
    
    if (tiposValorTotal.length > 1) {
      problemas.push(`⚠️ Tipos inconsistentes para valor_total: ${tiposValorTotal.join(', ')}`);
    }
    
    if (tiposQuantidade.length > 1) {
      problemas.push(`⚠️ Tipos inconsistentes para quantidade: ${tiposQuantidade.join(', ')}`);
    }
    
    // 7. Resumo final
    console.log('\n📈 RESUMO:');
    console.log(`✅ Total de vendas: ${vendas.length}`);
    console.log(`✅ Produtos únicos: ${produtosTop.length}`);
    console.log(`✅ Valor total vendido: R$ ${vendas.reduce((sum, v) => sum + (parseFloat(v.valor_total) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    
    if (problemas.length > 0) {
      console.log('\n⚠️ PROBLEMAS ENCONTRADOS:');
      problemas.forEach(problema => console.log(`  ${problema}`));
    } else {
      console.log('\n🎉 Nenhum problema encontrado nos dados!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar o teste
testarProdutosMaisVendidos();
