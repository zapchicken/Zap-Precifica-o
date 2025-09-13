import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Função auxiliar para ler arquivos
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

// Processador de CSV/XLSX para produtos
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

// Processador de CSV/XLSX para insumos
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

// Processador de CSV/XLSX para vendas
export const processarVendas = async (file: File) => {
  const dados = await lerArquivo(file);
  const vendasProcessadas = [];
  const erros = [];

  for (const [index, linha] of dados.entries()) {
    try {
      if (!linha.data || !linha.produto || !linha.quantidade || !linha.valor_unitario) {
        erros.push(`Linha ${index + 2}: Data, produto, quantidade e valor unitário são obrigatórios`);
        continue;
      }

      const venda = {
        id: `temp-${Date.now()}-${index}`,
        data_venda: linha.data.toString(),
        produto_nome: linha.produto.toString().trim(),
        produto_codigo: linha.codigo_pdv?.toString().trim() || null,
        quantidade: parseInt(linha.quantidade),
        valor_unitario: parseFloat(linha.valor_unitario),
        valor_total: parseInt(linha.quantidade) * parseFloat(linha.valor_unitario),
        canal: linha.canal?.toString().trim() || null,
        observacoes: linha.observacoes?.toString().trim() || null,
        created_at: new Date().toISOString(),
        user_id: 'mock-user'
      };

      vendasProcessadas.push(venda);
    } catch (error) {
      erros.push(`Linha ${index + 2}: Erro ao processar - ${error}`);
    }
  }

  return { dados: vendasProcessadas, erros };
};

// Função mock para salvar dados (substitui a função do Supabase)
export const salvarNoSupabase = async (tabela: 'produtos' | 'insumos' | 'vendas', dados: any[]) => {
  // Simular delay de salvamento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Simulando salvamento de ${dados.length} itens na tabela ${tabela}:`, dados);
  
  return {
    data: dados,
    error: null,
    count: dados.length
  };
};