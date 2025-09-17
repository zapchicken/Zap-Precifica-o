// Script para testar a persistência dos dados de markup
// Execute este script no console do navegador

async function testarPersistenciaMarkup() {
  console.log('🧪 Testando persistência dos dados de markup...');
  
  try {
    // 1. Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Usuário não autenticado:', userError);
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    
    // 2. Verificar configuração geral
    const { data: configGeral, error: configError } = await supabase
      .from('config_markup_geral')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (configError) {
      console.error('❌ Erro ao buscar configuração geral:', configError);
    } else {
      console.log('📊 Configuração geral:', configGeral);
    }
    
    // 3. Verificar canais de venda
    const { data: canaisVenda, error: canaisError } = await supabase
      .from('canais_venda')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (canaisError) {
      console.error('❌ Erro ao buscar canais de venda:', canaisError);
    } else {
      console.log('🛒 Canais de venda:', canaisVenda);
    }
    
    // 4. Verificar configurações de categoria
    const { data: configCategorias, error: categoriasError } = await supabase
      .from('config_markup_categoria')
      .select('*')
      .eq('user_id', user.id)
      .order('categoria', { ascending: true });
    
    if (categoriasError) {
      console.error('❌ Erro ao buscar configurações de categoria:', categoriasError);
    } else {
      console.log('📋 Configurações de categoria:', configCategorias);
    }
    
    // 5. Verificar modelos
    const { data: modelos, error: modelosError } = await supabase
      .from('modelos_markup')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (modelosError) {
      console.error('❌ Erro ao buscar modelos:', modelosError);
    } else {
      console.log('💾 Modelos salvos:', modelos);
    }
    
    // 6. Teste de persistência - fazer uma alteração e verificar se persiste
    console.log('🔄 Testando persistência...');
    
    // Salvar uma configuração de teste
    const configTeste = {
      faturamento_estimado_mensal: 10000,
      impostos_faturamento: 5,
      taxa_cartao: 3,
      outros_custos: 2,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };
    
    let dataTeste;
    if (configGeral?.id) {
      // Atualizar
      const { data, error } = await supabase
        .from('config_markup_geral')
        .update(configTeste)
        .eq('id', configGeral.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao atualizar configuração de teste:', error);
      } else {
        dataTeste = data;
        console.log('✅ Configuração de teste atualizada:', dataTeste);
      }
    } else {
      // Criar
      const { data, error } = await supabase
        .from('config_markup_geral')
        .insert([configTeste])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar configuração de teste:', error);
      } else {
        dataTeste = data;
        console.log('✅ Configuração de teste criada:', dataTeste);
      }
    }
    
    // 7. Verificar se a alteração persiste após um refresh simulado
    console.log('🔄 Simulando refresh...');
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buscar novamente
    const { data: configAposRefresh, error: refreshError } = await supabase
      .from('config_markup_geral')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (refreshError) {
      console.error('❌ Erro ao verificar após refresh:', refreshError);
    } else {
      console.log('✅ Configuração após refresh:', configAposRefresh);
      
      if (configAposRefresh.faturamento_estimado_mensal === 10000) {
        console.log('🎉 TESTE DE PERSISTÊNCIA PASSOU! Os dados persistem corretamente.');
      } else {
        console.log('❌ TESTE DE PERSISTÊNCIA FALHOU! Os dados não persistiram.');
      }
    }
    
    // 8. Restaurar configuração original se existia
    if (configGeral && configGeral.id) {
      console.log('🔄 Restaurando configuração original...');
      
      const { error: restoreError } = await supabase
        .from('config_markup_geral')
        .update({
          ...configGeral,
          updated_at: new Date().toISOString()
        })
        .eq('id', configGeral.id);
      
      if (restoreError) {
        console.error('❌ Erro ao restaurar configuração original:', restoreError);
      } else {
        console.log('✅ Configuração original restaurada');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar o teste
testarPersistenciaMarkup();
