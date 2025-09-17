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
        // CRÍTICO: Forçar leitura como texto para preservar vírgulas decimais
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: "",
          blankrows: false
        });
        
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

    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('codigo_pdv, nome')
      .eq('user_id', user.id)
      .not('codigo_pdv', 'is', null);

    if (error) {
      return new Map();
    }

    // Criar mapa código_pdv -> nome
    const mapaProdutos = new Map<string, string>();
    produtos?.forEach(produto => {
      if (produto.codigo_pdv) {
        mapaProdutos.set(produto.codigo_pdv.toString(), produto.nome);
      }
    });
    return mapaProdutos;
  } catch (error) {
    return new Map();
  }
};

export const processarVendas = async (file: File) => {
  const dados = await lerArquivo(file);
  
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

  // Processar vendas
  const totalLinhas = dados.length;
  
  for (const [index, linha] of dados.entries()) {
    try {
      
      // Mapear campos para os nomes esperados
      const camposMapeados = mapearCampos(linha);
      
      
      
      if (!camposMapeados.data || !camposMapeados.quantidade || !camposMapeados.valor_unitario || !camposMapeados.pedido_numero) {
        const camposFaltando = [];
        if (!camposMapeados.data) camposFaltando.push('data');
        if (!camposMapeados.quantidade) camposFaltando.push('quantidade');
        if (!camposMapeados.valor_unitario) camposFaltando.push('valor_unitario');
        if (!camposMapeados.pedido_numero) camposFaltando.push('pedido_numero');
        
        const erroMsg = `Linha ${index + 2}: Campos obrigatórios faltando: ${camposFaltando.join(', ')}`;
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
      } else if (dataFormatada.includes('/')) {
        // Se a data está no formato DD/MM/YYYY ou DD/MM/YY, converter para YYYY-MM-DD
        const partes = dataFormatada.split('/');
        if (partes.length === 3) {
          let [dia, mes, ano] = partes;
          
          // Se o ano tem 2 dígitos, assumir 20XX
          if (ano.length === 2) {
            ano = '20' + ano;
          }
          
          dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }
      
      // Validar e corrigir data inválida
      const validarECorrigirData = (dataStr: string): string => {
        // Verificar se está no formato YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
          throw new Error(`Formato de data inválido: ${dataStr}`);
        }
        
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        
        // Validar ano
        if (ano < 1900 || ano > 2100) {
          throw new Error(`Ano inválido: ${ano}`);
        }
        
        // Validar mês
        if (mes < 1 || mes > 12) {
          throw new Error(`Mês inválido: ${mes}`);
        }
        
        // Validar dia
        if (dia < 1 || dia > 31) {
          throw new Error(`Dia inválido: ${dia}`);
        }
        
        // Verificar se o dia existe no mês
        const diasNoMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        // Verificar ano bissexto
        if (mes === 2 && ((ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0))) {
          diasNoMes[1] = 29;
        }
        
        if (dia > diasNoMes[mes - 1]) {
          // Corrigir dia inválido para o último dia do mês
          const diaCorrigido = diasNoMes[mes - 1];
          console.warn(`⚠️ Data inválida corrigida: ${dataStr} → ${ano}-${mes.toString().padStart(2, '0')}-${diaCorrigido.toString().padStart(2, '0')}`);
          return `${ano}-${mes.toString().padStart(2, '0')}-${diaCorrigido.toString().padStart(2, '0')}`;
        }
        
        return dataStr;
      };
      
      // Aplicar validação e correção
      dataFormatada = validarECorrigirData(dataFormatada);

      // Limpar valor unitário - tratar diferentes formatos
      let valorOriginal = camposMapeados.valor_unitario;
      
      // Se o valor já foi convertido incorretamente (ex: 799 em vez de 79,90)
      if (typeof valorOriginal === 'number' && valorOriginal > 100) {
        // Tentar reconstruir o valor decimal dividindo por 10 ou 100
        // Assumir que valores grandes foram multiplicados por 100
        valorOriginal = (valorOriginal / 100).toString();
      }
      
      const valorLimpo = valorOriginal.toString().replace(',', '.').trim();
      
      // Validar se o valor é um número válido
      const valorNumerico = parseFloat(valorLimpo);
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error(`Valor unitário inválido: "${camposMapeados.valor_unitario}" → "${valorLimpo}"`);
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
      

      vendasProcessadas.push(venda);
    } catch (error) {
      erros.push(`Linha ${index + 2}: Erro ao processar - ${error}`);
    }
  }
  return { dados: vendasProcessadas, erros };
};

export const salvarNoSupabase = async (tabela: 'produtos' | 'insumos' | 'vendas', dados: any[]) => {
  try {
    // Importar supabase dinamicamente para evitar problemas de SSR
    const { supabase } = await import('../lib/supabase');
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error(`Usuário não autenticado: ${userError?.message || 'Usuário não encontrado'}`);
    }

    // Validar dados antes de processar
    if (!dados || dados.length === 0) {
      throw new Error('Nenhum dado fornecido para salvar');
    }

    // Adicionar user_id aos dados e validar campos obrigatórios
    const dadosComUserId = dados.map((item, index) => {
      // Validar campos obrigatórios para vendas
      if (tabela === 'vendas') {
        if (!item.data_venda || !item.pedido_numero || !item.produto_nome || 
            item.quantidade === undefined || item.valor_unitario === undefined || item.valor_total === undefined) {
          throw new Error(`Linha ${index + 1}: Campos obrigatórios faltando para venda`);
        }
        
        // Validar tipos de dados
        if (typeof item.quantidade !== 'number' || item.quantidade <= 0) {
          throw new Error(`Linha ${index + 1}: Quantidade deve ser um número positivo`);
        }
        
        if (typeof item.valor_unitario !== 'number' || item.valor_unitario <= 0) {
          throw new Error(`Linha ${index + 1}: Valor unitário deve ser um número positivo`);
        }
        
        if (typeof item.valor_total !== 'number' || item.valor_total <= 0) {
          throw new Error(`Linha ${index + 1}: Valor total deve ser um número positivo`);
        }
        
        // Validar formato da data
        if (!/^\d{4}-\d{2}-\d{2}$/.test(item.data_venda)) {
          throw new Error(`Linha ${index + 1}: Data deve estar no formato YYYY-MM-DD`);
        }
      }
      
      return {
        ...item,
        user_id: user.id
      };
    });

    console.log(`📊 Salvando ${dadosComUserId.length} registros na tabela ${tabela}`);
    
    // Processar em lotes para evitar timeout em grandes volumes
    const BATCH_SIZE = 1000;
    const batches = [];
    
    for (let i = 0; i < dadosComUserId.length; i += BATCH_SIZE) {
      batches.push(dadosComUserId.slice(i, i + BATCH_SIZE));
    }
    
    let allResults = [];
    let totalCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📦 Processando lote ${i + 1}/${batches.length} (${batch.length} registros)`);
      
      let result;
      
      if (tabela === 'vendas') {
        // Salvar vendas
        result = await supabase
          .from('vendas')
          .insert(batch)
          .select();
      } else if (tabela === 'produtos') {
        // Salvar produtos
        result = await supabase
          .from('produtos')
          .insert(batch)
          .select();
      } else if (tabela === 'insumos') {
        // Salvar insumos
        result = await supabase
          .from('insumos')
          .insert(batch)
          .select();
      } else {
        throw new Error(`Tabela ${tabela} não suportada`);
      }

      if (result.error) {
        console.error(`❌ Erro no lote ${i + 1}:`, result.error);
        throw new Error(`Erro do Supabase no lote ${i + 1}: ${result.error.message} (${result.error.code})`);
      }
      
      if (result.data) {
        allResults.push(...result.data);
        totalCount += result.data.length;
      }
    }

    console.log(`✅ Total de ${totalCount} registros salvos com sucesso`);
    
    return {
      data: allResults,
      error: null,
      count: totalCount
    };
  } catch (error: any) {
    console.error('❌ Erro ao salvar no Supabase:', error);
    return {
      data: null,
      error: error.message,
      count: 0
    };
  }
};