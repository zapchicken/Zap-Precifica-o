// Script para buscar informações sobre o produto com código PDV 93
// Este script será executado no console do navegador

async function buscarProduto93() {
  console.log('🔍 Buscando informações sobre o produto com código PDV 93...');
  
  try {
    // Buscar produto por código PDV
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('*')
      .eq('codigo_pdv', '93')
      .single();
    
    if (produtoError) {
      console.error('❌ Erro ao buscar produto:', produtoError);
      return;
    }
    
    if (!produto) {
      console.log('❌ Produto com código PDV 93 não encontrado');
      return;
    }
    
    console.log('✅ Produto encontrado:', produto);
    
    // Buscar ficha técnica se existir
    if (produto.ficha_tecnica_id) {
      const { data: ficha, error: fichaError } = await supabase
        .from('fichas_tecnicas')
        .select('*')
        .eq('id', produto.ficha_tecnica_id)
        .single();
      
      if (fichaError) {
        console.error('❌ Erro ao buscar ficha técnica:', fichaError);
      } else {
        console.log('📋 Ficha técnica:', ficha);
      }
    }
    
    // Buscar configurações de markup
    const { data: configGeral, error: configError } = await supabase
      .from('config_markup_geral')
      .select('*')
      .single();
    
    if (configError) {
      console.error('❌ Erro ao buscar configuração geral:', configError);
    } else {
      console.log('⚙️ Configuração geral:', configGeral);
    }
    
    const { data: configCategorias, error: categoriasError } = await supabase
      .from('config_markup_categorias')
      .select('*');
    
    if (categoriasError) {
      console.error('❌ Erro ao buscar configurações de categorias:', categoriasError);
    } else {
      console.log('📊 Configurações de categorias:', configCategorias);
    }
    
    const { data: canaisVenda, error: canaisError } = await supabase
      .from('canais_venda')
      .select('*');
    
    if (canaisError) {
      console.error('❌ Erro ao buscar canais de venda:', canaisError);
    } else {
      console.log('🛒 Canais de venda:', canaisVenda);
    }
    
    // Calcular preços sugeridos
    if (produto.preco_custo && produto.categoria) {
      console.log('🧮 Calculando preços sugeridos...');
      
      // Função para calcular markup (copiada do código)
      const calcularMarkupSimples = (categoria, canal) => {
        if (!categoria || categoria.trim() === '') return 0;
        
        const categoriaMapeada = mapearCategoria(categoria);
        const configCategoria = configCategorias?.find(c => c.categoria === categoriaMapeada);
        if (!configCategoria) return 0;
        
        const canalVenda = canaisVenda?.find(c => c.nome === canal);
        if (!canalVenda) return 0;
        
        const custosTotais = 
          (configGeral?.impostos_faturamento || 0) +
          (configGeral?.taxa_cartao || 0) +
          (configGeral?.outros_custos || 0) +
          canalVenda.taxa_marketplace +
          canalVenda.taxa_antecipacao;
        
        if (custosTotais >= 100) return 0;
        
        const markup = (1 + (configCategoria.lucro_desejado / 100) + (configCategoria.reserva_operacional / 100)) / (1 - (custosTotais / 100));
        
        return Math.round(markup * 100) / 100;
      };
      
      const mapearCategoria = (categoriaProduto) => {
        const mapeamento = {
          'ACOMPANHAMENTOS': 'ACOMPANHAMENTOS',
          'BEBIDAS CERVEJAS E CHOPP': 'BEBIDAS CERVEJAS E CHOPP',
          'BEBIDAS REFRIGERANTES': 'BEBIDAS REFRIGERANTES',
          'BEBIDAS SUCOS': 'BEBIDAS SUCOS',
          'COMBO LANCHES CARNE ANGUS': 'COMBO LANCHES CARNE ANGUS',
          'COMBO LANCHES FRANGO': 'COMBO LANCHES FRANGO',
          'FRANGO AMERICANO': 'FRANGO AMERICANO',
          'LANCHES': 'LANCHES',
          'ALIMENTOS': 'LANCHES'
        };
        return mapeamento[categoriaProduto] || 'LANCHES';
      };
      
      const arredondarPara90 = (preco) => {
        const precoInteiro = Math.floor(preco);
        return precoInteiro + 0.90;
      };
      
      const calcularPrecoSugerido = (precoCusto, categoria, canal) => {
        if (!precoCusto || precoCusto <= 0) return 0;
        const markup = calcularMarkupSimples(categoria, canal);
        if (markup <= 0) return 0;
        const precoSugerido = precoCusto * markup;
        return arredondarPara90(precoSugerido);
      };
      
      const precoSugeridoVendaDireta = calcularPrecoSugerido(produto.preco_custo, produto.categoria, 'Venda Direta');
      const precoSugeridoIfood = calcularPrecoSugerido(produto.preco_custo, produto.categoria, 'iFood');
      
      console.log('💰 Preços calculados:');
      console.log(`   Custo: R$ ${produto.preco_custo}`);
      console.log(`   Preço sugerido Venda Direta: R$ ${precoSugeridoVendaDireta}`);
      console.log(`   Preço sugerido iFood: R$ ${precoSugeridoIfood}`);
      console.log(`   Preço atual Venda Direta: R$ ${produto.preco_venda}`);
      console.log(`   Preço atual iFood: R$ ${produto.preco_venda_ifood}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a função
buscarProduto93();
