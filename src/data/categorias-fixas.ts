export const CATEGORIAS_FIXAS = [
  { categoria: 'ACOMPANHAMENTOS', label: 'Acompanhamentos' },
  { categoria: 'BEBIDAS CERVEJAS E CHOPP', label: 'Bebidas (Cervejas e Chopp)' },
  { categoria: 'BEBIDAS REFRIGERANTES', label: 'Bebidas (Refrigerantes)' },
  { categoria: 'BEBIDAS SUCOS', label: 'Bebidas (Sucos)' },
  { categoria: 'COMBO LANCHES CARNE ANGUS', label: 'Combo Lanches (Carne Angus)' },
  { categoria: 'COMBO LANCHES FRANGO', label: 'Combo Lanches (Frango)' },
  { categoria: 'FRANGO AMERICANO', label: 'Frango Americano' },
  { categoria: 'JUMBOS (COMBINADOS GRANDES)', label: 'Jumbos (Combinados Grandes)' },
  { categoria: 'LANCHES', label: 'Lanches' },
  { categoria: 'MOLHOS', label: 'Molhos' },
  { categoria: 'PROMOÇÕES', label: 'Promoções' },
  { categoria: 'SALADAS', label: 'Saladas' },
  { categoria: 'SOBREMESAS', label: 'Sobremesas' },
  { categoria: 'ZAPBOX (COMBINADOS INDIVIDUAIS)', label: 'Zapbox (Combinados Individuais)' },
] as const;

export type CategoriaFixa = typeof CATEGORIAS_FIXAS[number]['categoria'];

export type CategoriaValor = {
  categoria: CategoriaFixa;
  lucroDesejado: number;
  reservaOperacional: number;
  valorCupomVd: number;
  valorCupomMkt: number;
};
