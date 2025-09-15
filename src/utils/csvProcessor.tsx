import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const lerArquivo = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;
        
        if (file.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'binary' });
        } else {
          workbook = XLSX.read(data, { type: 'array' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    
    if (file.name.endsWith('.csv')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

export const processarProdutos = async (file: File) => {
  const dados = await lerArquivo(file);
  const produtosProcessados = [];
  const erros = [];

  for (const [index, linha] of dados.entries()) {
    try {
      if (!linha.nome || !linha.categoria) {
        erros.push(`Linha ${index + 2}: Nome e categoria são obrigatórios`);
        continue;
      }

      const produto = {
        id: `temp-${Date.now()}-${index}`,
        nome: linha.nome.toString().trim(),
        codigo: linha.codigo?.toString().trim() || null,
        categoria: linha.categoria.toString().trim(),
        preco_atual: linha.preco_atual ? parseFloat(linha.preco_atual) : null,
        ativo: true,
        created_at: new Date().toISOString(),
        user_id: 'mock-user'
      };

      produtosProcessados.push(produto);
    } catch (error) {
      erros.push(`Linha ${index + 2}: Erro ao processar - ${error}`);
    }
  }

  return { dados: produtosProcessados, erros };
};

export const processarInsumos = async (file: File) => {
  const dados = await lerArquivo(file);
  const insumosProcessados = [];
  const erros = [];

  for (const [index, linha] of dados.entries()) {
    try {
      if (!linha.nome || !linha.categoria || !linha.unidade_medida || !linha.preco_unitario) {
        erros.push(`Linha ${index + 2}: Nome, categoria, unidade de medida e preço são obrigatórios`);
        continue;
      }

      const insumo = {
        id: `temp-${Date.now()}-${index}`,
        nome: linha.nome.toString().trim(),
        codigo_insumo: linha.codigo?.toString().trim() || null,
        categoria: linha.categoria.toString().trim(),
        unidade_medida: linha.unidade_medida.toString().trim(),
        preco_por_unidade: parseFloat(linha.preco_unitario),
        quantidade_comprar: linha.quantidade_comprar ? parseFloat(linha.quantidade_comprar) : 0,
        quantidade_minima_compra: linha.quantidade_minima ? parseFloat(linha.quantidade_minima) : 0,
        tipo_embalagem: linha.tipo_embalagem?.toString().trim() || null,
        deposito: linha.deposito?.toString().trim() || null,
        fator_correcao: linha.fator_correcao ? parseFloat(linha.fator_correcao) : 1.0,
        observacoes: linha.observacoes?.toString().trim() || null,
        ativo: true,
        created_at: new Date().toISOString(),
        user_id: 'mock-user'
      };

      insumosProcessados.push(insumo);
    } catch (error) {
      erros.push(`Linha ${index + 2}: Erro ao processar - ${error}`);
    }
  }

  return { dados: insumosProcessados, erros };
};

// Função para buscar TODOS os produtos de uma vez (otimizada para arquivos grandes)
const buscarTodosProdutos = async (): Promise<Map<string, string>> => {
  try {
    const { supabase } = await import('../lib/supabase');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Map();

    console.log('🔍 Buscando todos os produtos cadastrados...');
    
    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('codigo_pdv, nome')
      .eq('user_id', user.id)
      .not('codigo_pdv', 'is', null);

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return new Map();
    }

    // Criar mapa código_pdv -> nome
    const mapaProdutos = new Map<string, string>();
    produtos?.forEach(produto => {
      if (produto.codigo_pdv) {
        mapaProdutos.set(produto.codigo_pdv.toString(), produto.nome);
      }
    });

    console.log(`✅ ${mapaProdutos.size} produtos carregados para mapeamento`);
    return mapaProdutos;
  } catch (error) {
    console.error(`❌ Erro ao buscar produtos:`, error);
    return new Map();
  }
};

export const processarVendas = async (file: File) => {
  console.log('📁 Processando arquivo:', file.name, file.type);
  
  const dados = await lerArquivo(file);
  console.log('📊 Dados lidos do arquivo:', dados.length, 'linhas');
  console.log('📋 Primeira linha:', dados[0]);
  
  // Buscar todos os produtos uma única vez (otimização para arquivos grandes)
  const mapaProdutos = await buscarTodosProdutos();
  
  const vendasProcessadas = [];
  const erros = [];

  // Função para mapear campos do CSV para os campos esperados
  const mapearCampos = (linha: any) => {
    return {
      data: linha['Data'] || linha['data'] || linha.data || linha.data_venda || linha.date,
      quantidade: linha['Qtd.'] || linha['qtd'] || linha.quantidade || linha.qtd || linha.qtde,
      valor_unitario: linha['Valor Un. Item'] || linha['valor_unitario'] || linha.valor_unitario || linha.valor || linha.preco || linha.price,
      pedido_numero: linha['Cod. Ped.'] || linha['pedido_numero'] || linha.pedido_numero || linha.pedido || linha.numero_pedido || linha.order_number,
      produto: linha['Produto'] || linha['produto'] || linha.produto || linha.nome_produto || linha.product_name,
      codigo_pdv: linha['codigo_pdv'] || linha['codigo'] || linha.codigo || linha.codigo_produto || linha.product_code,
      canal: linha['Canal'] || linha['canal'] || linha.canal || linha.tipo_venda || linha.channel,
      observacoes: linha['Observações'] || linha['observacoes'] || linha.observacoes || linha.obs || linha.observacao || linha.notes
    };
  };

  // Processar vendas com feedback de progresso para arquivos grandes
  const totalLinhas = dados.length;
  console.log(`🚀 Iniciando processamento de ${totalLinhas} linhas...`);
  
  for (const [index, linha] of dados.entries()) {
    try {
      // Feedback de progresso a cada 100 linhas para arquivos grandes
      if (totalLinhas > 500 && (index + 1) % 100 === 0) {
        const progresso = Math.round(((index + 1) / totalLinhas) * 100);
        console.log(`📊 Progresso: ${index + 1}/${totalLinhas} linhas (${progresso}%)`);
      }
      
      // Mapear campos para os nomes esperados
      const camposMapeados = mapearCampos(linha);
      
      // Log detalhado apenas para arquivos pequenos ou primeiras linhas
      if (totalLinhas <= 50 || index < 3) {
        console.log(`🔄 Campos mapeados:`, camposMapeados);
      }
      
      if (!camposMapeados.data || !camposMapeados.quantidade || !camposMapeados.valor_unitario || !camposMapeados.pedido_numero) {
        const camposFaltando = [];
        if (!camposMapeados.data) camposFaltando.push('data');
        if (!camposMapeados.quantidade) camposFaltando.push('quantidade');
        if (!camposMapeados.valor_unitario) camposFaltando.push('valor_unitario');
        if (!camposMapeados.pedido_numero) camposFaltando.push('pedido_numero');
        
        const erroMsg = `Linha ${index + 2}: Campos obrigatórios faltando: ${camposFaltando.join(', ')}`;
        console.error(`❌ ${erroMsg}`);
        console.error(`📋 Dados da linha:`, linha);
        erros.push(erroMsg);
        continue;
      }

      // Converter data para formato ISO (YYYY-MM-DD)
      let dataFormatada = camposMapeados.data.toString().trim();
      
      // Verificar se é uma data serial do Excel (número decimal)
      if (!isNaN(parseFloat(dataFormatada)) && parseFloat(dataFormatada) > 25000) {
        // É uma data serial do Excel - converter para data
        const dataSerial = parseFloat(dataFormatada);
        // Excel conta dias desde 1 de janeiro de 1900 (com correção para bug do Excel)
        const dataExcel = new Date((dataSerial - 25569) * 86400 * 1000);
        dataFormatada = dataExcel.toISOString().split('T')[0];
        // Log de conversão apenas para arquivos pequenos
        if (totalLinhas <= 50 || index < 3) {
          console.log(`📅 Data serial Excel convertida: "${camposMapeados.data}" → "${dataFormatada}"`);
        }
      } else if (dataFormatada.includes('/')) {
        // Se a data está no formato DD/MM/YYYY, converter para YYYY-MM-DD
        const partes = dataFormatada.split('/');
        if (partes.length === 3) {
          const [dia, mes, ano] = partes;
          dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
        // Log de conversão apenas para arquivos pequenos
        if (totalLinhas <= 50 || index < 3) {
          console.log(`📅 Data formato DD/MM/YYYY convertida: "${camposMapeados.data}" → "${dataFormatada}"`);
        }
      } else {
        // Log de conversão apenas para arquivos pequenos
        if (totalLinhas <= 50 || index < 3) {
          console.log(`📅 Data mantida como: "${dataFormatada}"`);
        }
      }

      // Limpar valor unitário removendo "R$" e tratando vírgula decimal brasileira
      let valorUnitarioLimpo = camposMapeados.valor_unitario.toString().trim();
      
      // Remover "R$" e espaços
      valorUnitarioLimpo = valorUnitarioLimpo.replace(/R\$\s*/g, '');
      
      // Tratar formato brasileiro: "1.234,56" -> "1234.56"
      // Se tem vírgula, é formato brasileiro: separador de milhares é ponto, decimal é vírgula
      if (valorUnitarioLimpo.includes(',')) {
        // Formato brasileiro: remover pontos (milhares) e substituir vírgula por ponto (decimal)
        valorUnitarioLimpo = valorUnitarioLimpo.replace(/\./g, '').replace(',', '.');
      }
      // Se não tem vírgula, manter como está (formato internacional)
      
      // Validar se o valor é um número válido
      const valorNumerico = parseFloat(valorUnitarioLimpo);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error(`Valor unitário inválido: "${camposMapeados.valor_unitario}" → "${valorUnitarioLimpo}"`);
      }
      
      // Log de conversão para debug (apenas para arquivos pequenos)
      if (totalLinhas <= 50 || index < 3) {
        console.log(`💰 Valor convertido: "${camposMapeados.valor_unitario}" → "${valorUnitarioLimpo}" → ${valorNumerico}`);
      }
      
      // Lógica inteligente para nome do produto (otimizada)
      let nomeProduto: string;
      
      if (camposMapeados.produto?.toString().trim()) {
        // Se produto foi fornecido no CSV, usar o nome fornecido
        nomeProduto = camposMapeados.produto.toString().trim();
      } else if (camposMapeados.codigo_pdv?.toString().trim()) {
        // Buscar no mapa de produtos (muito mais rápido!)
        const codigoPdv = camposMapeados.codigo_pdv.toString().trim();
        nomeProduto = mapaProdutos.get(codigoPdv) || `Produto ${codigoPdv}`;
      } else {
        // Fallback final
        nomeProduto = 'Produto N/A';
      }

      const quantidade = parseInt(camposMapeados.quantidade);
      const valorTotal = quantidade * valorNumerico;
      
      const venda = {
        data_venda: dataFormatada,
        pedido_numero: camposMapeados.pedido_numero.toString().trim(),
        produto_nome: nomeProduto,
        produto_codigo: camposMapeados.codigo_pdv?.toString().trim() || null,
        quantidade: quantidade,
        valor_unitario: valorNumerico,
        valor_total: valorTotal,
        canal: camposMapeados.canal?.toString().trim() || null,
        observacoes: camposMapeados.observacoes?.toString().trim() || null
      };
      
      // Log detalhado para debug (apenas para arquivos pequenos)
      if (totalLinhas <= 50 || index < 3) {
        console.log(`🧮 Cálculo: ${quantidade} × ${valorNumerico} = ${valorTotal}`);
      }

      // Log de venda processada apenas para arquivos pequenos
      if (totalLinhas <= 50 || index < 3) {
        console.log(`✅ Venda processada:`, venda);
      }
      vendasProcessadas.push(venda);
    } catch (error) {
      console.error(`❌ Erro na linha ${index + 2}:`, error);
      erros.push(`Linha ${index + 2}: Erro ao processar - ${error}`);
    }
  }

  console.log(`📊 Resultado final: ${vendasProcessadas.length} vendas processadas, ${erros.length} erros`);
  return { dados: vendasProcessadas, erros };
};

export const salvarNoSupabase = async (tabela: 'produtos' | 'insumos' | 'vendas', dados: any[]) => {
  try {
    console.log(`🔄 Iniciando salvamento de ${dados.length} itens na tabela ${tabela}`);
    
    // Importar supabase dinamicamente para evitar problemas de SSR
    const { supabase } = await import('../lib/supabase');
    console.log('✅ Supabase importado com sucesso');
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Usuário:', user ? `${user.email} (${user.id})` : 'Não autenticado');
    
    if (userError || !user) {
      throw new Error(`Usuário não autenticado: ${userError?.message || 'Usuário não encontrado'}`);
    }

    // Adicionar user_id aos dados
    const dadosComUserId = dados.map(item => ({
      ...item,
      user_id: user.id
    }));

    console.log(`📊 Dados preparados para inserção:`, dadosComUserId.slice(0, 2)); // Log apenas os primeiros 2 itens
    
    // Log específico para valores monetários
    if (tabela === 'vendas' && dadosComUserId.length > 0) {
      console.log(`💰 Valores que serão salvos:`);
      dadosComUserId.slice(0, 3).forEach((venda, index) => {
        console.log(`   ${index + 1}. Valor unitário: ${venda.valor_unitario}, Valor total: ${venda.valor_total}`);
      });
    }

    let result;
    
    if (tabela === 'vendas') {
      console.log('💾 Salvando vendas...');
      // Salvar vendas
      result = await supabase
        .from('vendas')
        .insert(dadosComUserId)
        .select();
    } else if (tabela === 'produtos') {
      console.log('💾 Salvando produtos...');
      // Salvar produtos
      result = await supabase
        .from('produtos')
        .insert(dadosComUserId)
        .select();
    } else if (tabela === 'insumos') {
      console.log('💾 Salvando insumos...');
      // Salvar insumos
      result = await supabase
        .from('insumos')
        .insert(dadosComUserId)
        .select();
    } else {
      throw new Error(`Tabela ${tabela} não suportada`);
    }

    console.log('📋 Resultado da inserção:', result);

    if (result.error) {
      console.error('❌ Erro do Supabase:', result.error);
      throw new Error(`Erro do Supabase: ${result.error.message} (${result.error.code})`);
    }

    console.log(`✅ Salvamento real de ${dados.length} itens na tabela ${tabela} concluído`);
    console.log(`📊 Itens salvos:`, result.data?.length || 0);
    
    return {
      data: result.data,
      error: null,
      count: result.data?.length || 0
    };
  } catch (error: any) {
    console.error(`❌ Erro ao salvar na tabela ${tabela}:`, error);
    return {
      data: null,
      error: error.message,
      count: 0
    };
  }
};