// Script para testar o processamento de valores monetários brasileiros
// Execute este script no console do navegador

function testarValoresBrasileiros() {
  console.log('🧪 Testando processamento de valores monetários brasileiros...');
  
  // Função copiada do csvProcessor.tsx para teste
  const processarValorBrasileiro = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      throw new Error('Valor vazio ou nulo');
    }
    
    let valorStr = valor.toString().trim();
    console.log(`💰 Processando valor: "${valorStr}"`);
    
    // Se já é um número, verificar se precisa de correção
    if (typeof valor === 'number') {
      // Se o valor é muito grande (ex: 799 em vez de 79,90), pode ter sido multiplicado por 100
      if (valor > 1000) {
        console.log(`⚠️ Valor muito grande detectado (${valor}), tentando correção...`);
        // Tentar dividir por 100 para valores muito grandes
        const valorCorrigido = valor / 100;
        console.log(`✅ Valor corrigido: ${valor} → ${valorCorrigido}`);
        return valorCorrigido;
      }
      return valor;
    }
    
    // Remover caracteres não numéricos exceto vírgula e ponto
    valorStr = valorStr.replace(/[^\d,.-]/g, '');
    
    // Tratar formato brasileiro (vírgula como separador decimal)
    if (valorStr.includes(',') && !valorStr.includes('.')) {
      // Formato brasileiro: 79,90
      valorStr = valorStr.replace(',', '.');
      console.log(`🇧🇷 Formato brasileiro detectado: ${valor} → ${valorStr}`);
    } else if (valorStr.includes(',') && valorStr.includes('.')) {
      // Formato com milhares: 1.234,56
      const partes = valorStr.split(',');
      if (partes.length === 2) {
        const parteInteira = partes[0].replace(/\./g, '');
        const parteDecimal = partes[1];
        valorStr = `${parteInteira}.${parteDecimal}`;
        console.log(`🇧🇷 Formato brasileiro com milhares: ${valor} → ${valorStr}`);
      }
    }
    
    const valorNumerico = parseFloat(valorStr);
    
    if (isNaN(valorNumerico)) {
      throw new Error(`Valor não é um número válido: "${valor}" → "${valorStr}"`);
    }
    
    if (valorNumerico <= 0) {
      throw new Error(`Valor deve ser maior que zero: ${valorNumerico}`);
    }
    
    console.log(`✅ Valor processado com sucesso: ${valor} → ${valorNumerico}`);
    return valorNumerico;
  };
  
  // Casos de teste
  const casosTeste = [
    // Formato brasileiro simples
    { input: '79,90', esperado: 79.90, descricao: 'Formato brasileiro simples' },
    { input: '12,50', esperado: 12.50, descricao: 'Formato brasileiro simples' },
    { input: '5,00', esperado: 5.00, descricao: 'Formato brasileiro simples' },
    
    // Formato brasileiro com milhares
    { input: '1.234,56', esperado: 1234.56, descricao: 'Formato brasileiro com milhares' },
    { input: '10.000,00', esperado: 10000.00, descricao: 'Formato brasileiro com milhares' },
    { input: '999.999,99', esperado: 999999.99, descricao: 'Formato brasileiro com milhares' },
    
    // Formato americano
    { input: '79.90', esperado: 79.90, descricao: 'Formato americano' },
    { input: '12.50', esperado: 12.50, descricao: 'Formato americano' },
    
    // Números já convertidos
    { input: 79.90, esperado: 79.90, descricao: 'Número já convertido' },
    { input: 12.50, esperado: 12.50, descricao: 'Número já convertido' },
    
    // Valores grandes que podem ter sido multiplicados
    { input: 7990, esperado: 79.90, descricao: 'Valor grande (multiplicado por 100)' },
    { input: 1250, esperado: 12.50, descricao: 'Valor grande (multiplicado por 100)' },
    
    // Valores com caracteres especiais
    { input: 'R$ 79,90', esperado: 79.90, descricao: 'Valor com símbolo R$' },
    { input: 'R$ 1.234,56', esperado: 1234.56, descricao: 'Valor com símbolo R$ e milhares' },
    { input: 'USD 79.90', esperado: 79.90, descricao: 'Valor com símbolo USD' },
    
    // Casos extremos
    { input: '0,50', esperado: 0.50, descricao: 'Valor pequeno' },
    { input: '0,01', esperado: 0.01, descricao: 'Valor muito pequeno' },
  ];
  
  let sucessos = 0;
  let falhas = 0;
  
  console.log('\n📊 Executando testes...\n');
  
  casosTeste.forEach((caso, index) => {
    try {
      console.log(`\n--- Teste ${index + 1}: ${caso.descricao} ---`);
      const resultado = processarValorBrasileiro(caso.input);
      
      if (Math.abs(resultado - caso.esperado) < 0.01) {
        console.log(`✅ PASSOU: ${caso.input} → ${resultado} (esperado: ${caso.esperado})`);
        sucessos++;
      } else {
        console.log(`❌ FALHOU: ${caso.input} → ${resultado} (esperado: ${caso.esperado})`);
        falhas++;
      }
    } catch (error) {
      console.log(`❌ ERRO: ${caso.input} → ${error.message}`);
      falhas++;
    }
  });
  
  console.log('\n📈 RESULTADO FINAL:');
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log(`📊 Total: ${sucessos + falhas}`);
  console.log(`🎯 Taxa de sucesso: ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%`);
  
  if (falhas === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! O processamento de valores brasileiros está funcionando corretamente.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os casos que falharam acima.');
  }
}

// Executar os testes
testarValoresBrasileiros();
