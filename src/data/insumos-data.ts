import { CatalogInsumo } from "@/components/InsumoCombobox"

export const insumosCatalog: ReadonlyArray<CatalogInsumo> = [
  // Carnes e Aves
  { id: 1, nome: "Frango Inteiro", codigo_insumo: "FRANG001", fornecedor: "Aviário Central", unidade_medida: "kg", preco_por_unidade: 8.50 },
  { id: 2, nome: "Coxa de Frango", codigo_insumo: "FRANG002", fornecedor: "Aviário Central", unidade_medida: "kg", preco_por_unidade: 12.80 },
  { id: 3, nome: "Peito de Frango", codigo_insumo: "FRANG003", fornecedor: "Aviário Central", unidade_medida: "kg", preco_por_unidade: 18.90 },
  { id: 4, nome: "Asa de Frango", codigo_insumo: "FRANG004", fornecedor: "Aviário Central", unidade_medida: "kg", preco_por_unidade: 15.60 },
  
  // Óleos e Gorduras
  { id: 5, nome: "Óleo de Soja", codigo_insumo: "OLEO001", fornecedor: "Distribuidora São Paulo", unidade_medida: "litro", preco_por_unidade: 4.20 },
  { id: 6, nome: "Óleo de Girassol", codigo_insumo: "OLEO002", fornecedor: "Distribuidora São Paulo", unidade_medida: "litro", preco_por_unidade: 5.80 },
  
  // Acompanhamentos
  { id: 7, nome: "Batata Pré-Frita", codigo_insumo: "ACOMP001", fornecedor: "McCain", unidade_medida: "kg", preco_por_unidade: 12.80 },
  { id: 8, nome: "Mandioca Pré-Frita", codigo_insumo: "ACOMP002", fornecedor: "Fábrica de Congelados", unidade_medida: "kg", preco_por_unidade: 10.50 },
  { id: 9, nome: "Polenta Frita", codigo_insumo: "ACOMP003", fornecedor: "Fábrica de Congelados", unidade_medida: "kg", preco_por_unidade: 8.90 },
  
  // Temperos e Condimentos
  { id: 10, nome: "Sal Refinado", codigo_insumo: "TEMP001", fornecedor: "Cisne", unidade_medida: "kg", preco_por_unidade: 1.20 },
  { id: 11, nome: "Pimenta do Reino", codigo_insumo: "TEMP002", fornecedor: "Kitano", unidade_medida: "kg", preco_por_unidade: 35.00 },
  { id: 12, nome: "Alho em Pó", codigo_insumo: "TEMP003", fornecedor: "Kitano", unidade_medida: "kg", preco_por_unidade: 18.50 },
  { id: 13, nome: "Cebola em Pó", codigo_insumo: "TEMP004", fornecedor: "Kitano", unidade_medida: "kg", preco_por_unidade: 15.80 },
  { id: 14, nome: "Páprica Doce", codigo_insumo: "TEMP005", fornecedor: "Kitano", unidade_medida: "kg", preco_por_unidade: 28.90 },
  
  // Molhos
  { id: 15, nome: "Molho Barbecue", codigo_insumo: "MOLHO001", fornecedor: "Heinz", unidade_medida: "litro", preco_por_unidade: 8.50 },
  { id: 16, nome: "Molho de Alho", codigo_insumo: "MOLHO002", fornecedor: "Hellmann's", unidade_medida: "litro", preco_por_unidade: 12.30 },
  { id: 17, nome: "Maionese", codigo_insumo: "MOLHO003", fornecedor: "Hellmann's", unidade_medida: "litro", preco_por_unidade: 9.80 },
  
  // Embalagens
  { id: 18, nome: "Embalagem Combo", codigo_insumo: "EMB001", fornecedor: "Embalagens Express", unidade_medida: "unidade", preco_por_unidade: 0.45 },
  { id: 19, nome: "Embalagem Balde", codigo_insumo: "EMB002", fornecedor: "Embalagens Express", unidade_medida: "unidade", preco_por_unidade: 0.65 },
  { id: 20, nome: "Embalagem Individual", codigo_insumo: "EMB003", fornecedor: "Embalagens Express", unidade_medida: "unidade", preco_por_unidade: 0.25 },
  { id: 21, nome: "Copo Bebida 300ml", codigo_insumo: "EMB004", fornecedor: "Embalagens Express", unidade_medida: "unidade", preco_por_unidade: 0.15 },
  { id: 22, nome: "Tampa Copo", codigo_insumo: "EMB005", fornecedor: "Embalagens Express", unidade_medida: "unidade", preco_por_unidade: 0.08 },
  { id: 23, nome: "Canudo", codigo_insumo: "EMB006", fornecedor: "Embalagens Express", unidade_medida: "unidade", preco_por_unidade: 0.03 },
  
  // Bebidas
  { id: 24, nome: "Refrigerante Cola 350ml", codigo_insumo: "BEB001", fornecedor: "Coca-Cola", unidade_medida: "unidade", preco_por_unidade: 1.80 },
  { id: 25, nome: "Refrigerante Guaraná 350ml", codigo_insumo: "BEB002", fornecedor: "Antarctica", unidade_medida: "unidade", preco_por_unidade: 1.75 },
  { id: 26, nome: "Suco Natural Laranja", codigo_insumo: "BEB003", fornecedor: "Fazenda do Suco", unidade_medida: "litro", preco_por_unidade: 8.50 },
  
  // Outros Ingredientes
  { id: 27, nome: "Farinha de Trigo", codigo_insumo: "ING001", fornecedor: "Dona Benta", unidade_medida: "kg", preco_por_unidade: 3.80 },
  { id: 28, nome: "Farinha de Rosca", codigo_insumo: "ING002", fornecedor: "Yoki", unidade_medida: "kg", preco_por_unidade: 5.20 },
  { id: 29, nome: "Ovos", codigo_insumo: "ING003", fornecedor: "Granja Feliz", unidade_medida: "unidade", preco_por_unidade: 0.35 },
  { id: 30, nome: "Leite Integral", codigo_insumo: "ING004", fornecedor: "Parmalat", unidade_medida: "litro", preco_por_unidade: 4.50 }
]