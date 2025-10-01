import { supabase } from '../lib/supabase';

// Função para ler arquivo CSV/Excel
const lerArquivo = async (file: File): Promise<any[]> => {
  const texto = await file.text();
  const linhas = texto.split('\n').filter(linha => linha.trim());
  
  if (linhas.length === 0) return [];
  
  // Detectar separador (vírgula, ponto e vírgula, tab)
  const primeiraLinha = linhas[0];
  const separadores = [',', ';', '\t'];
  const separador = separadores.find(sep => primeiraLinha.includes(sep)) || ',';
  
  // Processar cabeçalho
  const cabecalho = linhas[0].split(separador).map(col => col.trim().replace(/"/g, ''));
  
  // Processar dados
  const dados = linhas.slice(1).map((linha, index) => {
    const valores = linha.split(separador).map(val => val.trim().replace(/"/g, ''));
    const objeto: any = {};
    
    cabecalho.forEach((col, i) => {
      objeto[col] = valores[i] || '';
    });
    
    return objeto;
  });
  
  return dados;
};

// Função para buscar todos os produtos de uma vez (otimizada para arquivos grandes)
const buscarTodosProdutos = async (): Promise<Map<string, string>> => {
  try {
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

// Função para processar vendas no formato da imagem (sem data e pedido)
export const processarVendasFormatoImagem = async (file: File, dataVenda: string, canal: string) => {
  const dados = await lerArquivo(file);
  
  // Buscar todos os produtos uma única vez (otimização para arquivos grandes)
  const mapaProdutos = await buscarTodosProdutos();
  
  const vendasProcessadas = [];
  const erros = [];

  // Função para mapear campos do CSV no formato da imagem
  const mapearCamposFormatoImagem = (linha: any) => {
    return {
      produto: linha['Produto'] || linha['produto'] || linha.produto || linha.nome_produto || linha.product_name,
      codigo_pdv: linha['PDV'] || linha['pdv'] || linha.codigo_pdv || linha.codigo || linha.codigo_produto || linha.product_code,
      valor_unitario: linha['valor unitário'] || linha['valor_unitario'] || linha.valor_unitario || linha.valor || linha.preco || linha.price,
      quantidade: linha['Quantidade Vendida'] || linha['quantidade_vendida'] || linha.quantidade || linha.qtd || linha.qtde,
      valor_total: linha['Vendas Total'] || linha['vendas_total'] || linha.valor_total || linha.total || linha.total_vendas
    };
  };

  // Processar vendas no formato da imagem
  const totalLinhas = dados.length;
  
  for (const [index, linha] of dados.entries()) {
    try {
      // Mapear campos para os nomes esperados
      const camposMapeados = mapearCamposFormatoImagem(linha);
      
      // Verificar campos obrigatórios
      if (!camposMapeados.produto || !camposMapeados.quantidade || !camposMapeados.valor_unitario) {
        const camposFaltando = [];
        if (!camposMapeados.produto) camposFaltando.push('produto');
        if (!camposMapeados.quantidade) camposFaltando.push('quantidade');
        if (!camposMapeados.valor_unitario) camposFaltando.push('valor_unitario');
        
        const erroMsg = `Linha ${index + 2}: Campos obrigatórios faltando: ${camposFaltando.join(', ')}`;
        erros.push(erroMsg);
        continue;
      }

      // Usar a data fornecida pelo usuário
      let dataFormatada = dataVenda;
      
      // Gerar número do pedido automaticamente (formato: PED-YYYYMMDD-XXXX)
      const pedidoNumero = `PED-${dataFormatada.replace(/-/g, '')}-${String(index + 1).padStart(4, '0')}`;

      // Converter valores para números
      const quantidade = parseFloat(camposMapeados.quantidade.toString().replace(',', '.'));
      const valorUnitario = parseFloat(camposMapeados.valor_unitario.toString().replace(',', '.'));
      const valorTotal = parseFloat(camposMapeados.valor_total?.toString().replace(',', '.') || '0');

      // Verificar se os valores são válidos
      if (isNaN(quantidade) || isNaN(valorUnitario) || quantidade <= 0 || valorUnitario <= 0) {
        const erroMsg = `Linha ${index + 2}: Valores inválidos - Quantidade: ${quantidade}, Valor Unitário: ${valorUnitario}`;
        erros.push(erroMsg);
        continue;
      }

      // Buscar produto pelo código PDV
      let produtoEncontrado = null;
      if (camposMapeados.codigo_pdv) {
        produtoEncontrado = mapaProdutos.get(camposMapeados.codigo_pdv.toString());
      }

      // Se não encontrou pelo código PDV, tentar pelo nome
      if (!produtoEncontrado) {
        produtoEncontrado = camposMapeados.produto;
      }

      // Criar objeto da venda
      const venda = {
        id: `venda-${index}-${Date.now()}`,
        data: dataFormatada,
        pedido: pedidoNumero,
        produto: camposMapeados.produto,
        codigoPdv: camposMapeados.codigo_pdv,
        quantidade: quantidade,
        valorUnitario: valorUnitario,
        valorTotal: valorTotal,
        canal: canal,
        status: 'sucesso' as const,
        observacao: produtoEncontrado ? `Produto encontrado: ${produtoEncontrado}` : 'Produto não encontrado no catálogo'
      };

      vendasProcessadas.push(venda);

    } catch (error) {
      const erroMsg = `Linha ${index + 2}: Erro ao processar - ${error}`;
      erros.push(erroMsg);
    }
  }

  return {
    vendas: vendasProcessadas,
    erros: erros,
    totalLinhas: totalLinhas,
    sucessos: vendasProcessadas.length,
    falhas: erros.length
  };
};

// Função para salvar vendas no Supabase
export const salvarVendasFormatoImagem = async (vendas: any[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const vendasParaSalvar = vendas.map(venda => ({
    data_venda: venda.data,
    pedido_numero: venda.pedido,
    produto_nome: venda.produto,
    produto_codigo: venda.codigoPdv,
    quantidade: venda.quantidade,
    valor_unitario: venda.valorUnitario,
    valor_total: venda.valorTotal,
    canal: venda.canal,
    observacoes: venda.observacao,
    user_id: user.id
  }));

  const { data, error } = await supabase
    .from('vendas')
    .insert(vendasParaSalvar)
    .select();

  if (error) throw error;

  return data;
};
