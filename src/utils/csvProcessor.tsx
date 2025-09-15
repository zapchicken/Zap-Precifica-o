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

// Função para buscar nome do produto pelo código PDV
const buscarNomeProduto = async (codigoPdv: string): Promise<string> => {
  try {
    const { supabase } = await import('../lib/supabase');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return `Produto ${codigoPdv}`;

    const { data: produto, error } = await supabase
      .from('produtos')
      .select('nome')
      .eq('codigo_pdv', codigoPdv)
      .eq('user_id', user.id)
      .single();

    if (error || !produto) {
      console.log(`⚠️ Produto não encontrado para código ${codigoPdv}`);
      return `Produto ${codigoPdv}`;
    }

    console.log(`✅ Produto encontrado: ${codigoPdv} → ${produto.nome}`);
    return produto.nome;
  } catch (error) {
    console.error(`❌ Erro ao buscar produto ${codigoPdv}:`, error);
    return `Produto ${codigoPdv}`;
  }
};

export const processarVendas = async (file: File) => {
  console.log('📁 Processando arquivo:', file.name, file.type);
  
  const dados = await lerArquivo(file);
  console.log('📊 Dados lidos do arquivo:', dados.length, 'linhas');
  console.log('📋 Primeira linha:', dados[0]);
  
  const vendasProcessadas = [];
  const erros = [];

  for (const [index, linha] of dados.entries()) {
    try {
      console.log(`🔍 Processando linha ${index + 2}:`, linha);
      
      if (!linha.data || !linha.quantidade || !linha.valor_unitario || !linha.pedido_numero) {
        const camposFaltando = [];
        if (!linha.data) camposFaltando.push('data');
        if (!linha.quantidade) camposFaltando.push('quantidade');
        if (!linha.valor_unitario) camposFaltando.push('valor_unitario');
        if (!linha.pedido_numero) camposFaltando.push('pedido_numero');
        
        const erroMsg = `Linha ${index + 2}: Campos obrigatórios faltando: ${camposFaltando.join(', ')}`;
        console.error(`❌ ${erroMsg}`);
        console.error(`📋 Dados da linha:`, linha);
        erros.push(erroMsg);
        continue;
      }

      // Converter data para formato ISO (YYYY-MM-DD)
      let dataFormatada = linha.data.toString().trim();
      
      // Se a data está no formato DD/MM/YYYY, converter para YYYY-MM-DD
      if (dataFormatada.includes('/')) {
        const partes = dataFormatada.split('/');
        if (partes.length === 3) {
          const [dia, mes, ano] = partes;
          dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }
      
      console.log(`📅 Data convertida: "${linha.data}" → "${dataFormatada}"`);

      // Lógica inteligente para nome do produto
      let nomeProduto: string;
      
      if (linha.produto?.toString().trim()) {
        // Se produto foi fornecido no CSV, usar o nome fornecido
        nomeProduto = linha.produto.toString().trim();
        console.log(`📝 Usando nome fornecido: "${nomeProduto}"`);
      } else if (linha.codigo_pdv?.toString().trim()) {
        // Se não foi fornecido, buscar na tabela produtos
        console.log(`🔍 Buscando nome do produto para código: ${linha.codigo_pdv}`);
        nomeProduto = await buscarNomeProduto(linha.codigo_pdv.toString().trim());
      } else {
        // Fallback final
        nomeProduto = 'Produto N/A';
        console.log(`⚠️ Usando fallback: "${nomeProduto}"`);
      }

      const venda = {
        data_venda: dataFormatada,
        pedido_numero: linha.pedido_numero.toString().trim(),
        produto_nome: nomeProduto,
        produto_codigo: linha.codigo_pdv?.toString().trim() || null,
        quantidade: parseInt(linha.quantidade),
        valor_unitario: parseFloat(linha.valor_unitario),
        valor_total: parseInt(linha.quantidade) * parseFloat(linha.valor_unitario),
        canal: linha.canal?.toString().trim() || null,
        observacoes: linha.observacoes?.toString().trim() || null
      };

      console.log(`✅ Venda processada:`, venda);
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