export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bases: {
        Row: {
          id: string
          nome: string
          codigo: string
          tipo_produto: string
          quantidade_total: number | null
          unidade_produto: string | null
          custo_total_batelada: number | null
          custo_por_kg: number | null
          custo_por_unidade: number | null
          rendimento: string | null
          tempo_preparo: number | null
          data_ficha: string | null
          foto: string | null
          modo_preparo: string | null
          observacoes: string | null
          ativo: boolean | null
          user_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          codigo: string
          tipo_produto: string
          quantidade_total?: number | null
          unidade_produto?: string | null
          custo_total_batelada?: number | null
          custo_por_kg?: number | null
          custo_por_unidade?: number | null
          rendimento?: string | null
          tempo_preparo?: number | null
          data_ficha?: string | null
          foto?: string | null
          modo_preparo?: string | null
          observacoes?: string | null
          ativo?: boolean | null
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          codigo?: string
          tipo_produto?: string
          quantidade_total?: number | null
          unidade_produto?: string | null
          custo_total_batelada?: number | null
          custo_por_kg?: number | null
          custo_por_unidade?: number | null
          rendimento?: string | null
          tempo_preparo?: number | null
          data_ficha?: string | null
          foto?: string | null
          modo_preparo?: string | null
          observacoes?: string | null
          ativo?: boolean | null
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      bases_insumos: {
        Row: {
          id: string
          base_id: string
          insumo_id: string
          quantidade: number
          unidade: string
          custo: number
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          base_id: string
          insumo_id: string
          quantidade: number
          unidade: string
          custo: number
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          base_id?: string
          insumo_id?: string
          quantidade?: number
          unidade?: string
          custo?: number
          user_id?: string
          created_at?: string | null
        }
      }
      fichas_tecnicas: {
        Row: {
          id: string
          nome: string
          codigo: string | null
          descricao: string | null
          categoria: string | null
          tipo_produto: string | null
          rendimento: number | null
          unidade_rendimento: string | null
          tempo_preparo: number | null
          modo_preparo: string | null
          custo_total_producao: number | null
          custo_por_unidade: number | null
          preco_sugerido: number | null
          margem_contribuicao: number | null
          observacoes: string | null
          foto: string | null
          data_ficha: string | null
          ativo: boolean | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          codigo?: string | null
          descricao?: string | null
          categoria?: string | null
          tipo_produto?: string | null
          rendimento?: number | null
          unidade_rendimento?: string | null
          tempo_preparo?: number | null
          modo_preparo?: string | null
          custo_total_producao?: number | null
          custo_por_unidade?: number | null
          preco_sugerido?: number | null
          margem_contribuicao?: number | null
          observacoes?: string | null
          foto?: string | null
          data_ficha?: string | null
          ativo?: boolean | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          codigo?: string | null
          descricao?: string | null
          categoria?: string | null
          tipo_produto?: string | null
          rendimento?: number | null
          unidade_rendimento?: string | null
          tempo_preparo?: number | null
          modo_preparo?: string | null
          custo_total_producao?: number | null
          custo_por_unidade?: number | null
          preco_sugerido?: number | null
          margem_contribuicao?: number | null
          observacoes?: string | null
          foto?: string | null
          data_ficha?: string | null
          ativo?: boolean | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      fichas_insumos: {
        Row: {
          id: string
          ficha_id: string
          insumo_id: string
          quantidade: number
          unidade: string
          custo_unitario: number | null
          custo_total: number | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          ficha_id: string
          insumo_id: string
          quantidade: number
          unidade: string
          custo_unitario?: number | null
          custo_total?: number | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          ficha_id?: string
          insumo_id?: string
          quantidade?: number
          unidade?: string
          custo_unitario?: number | null
          custo_total?: number | null
          user_id?: string
          created_at?: string
        }
      }
      fichas_bases: {
        Row: {
          id: string
          ficha_id: string
          base_id: string
          quantidade: number
          unidade: string
          custo_unitario: number | null
          custo_total: number | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          ficha_id: string
          base_id: string
          quantidade: number
          unidade: string
          custo_unitario?: number | null
          custo_total?: number | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          ficha_id?: string
          base_id?: string
          quantidade?: number
          unidade?: string
          custo_unitario?: number | null
          custo_total?: number | null
          user_id?: string
          created_at?: string
        }
      }
      produtos: {
        Row: {
          id: string
          nome: string
          codigo: string | null
          descricao: string | null
          categoria: string
          canal: string | null
          preco_atual: number | null
          custo_estimado: number | null
          margem_contribuicao: number | null
          observacoes: string | null
          foto: string | null
          ativo: boolean | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          codigo?: string | null
          descricao?: string | null
          categoria: string
          canal?: string | null
          preco_atual?: number | null
          custo_estimado?: number | null
          margem_contribuicao?: number | null
          observacoes?: string | null
          foto?: string | null
          ativo?: boolean | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          codigo?: string | null
          descricao?: string | null
          categoria?: string
          canal?: string | null
          preco_atual?: number | null
          custo_estimado?: number | null
          margem_contribuicao?: number | null
          observacoes?: string | null
          foto?: string | null
          ativo?: boolean | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      fornecedores: {
        Row: {
          id: string
          razao_social: string
          pessoa_contato: string | null
          telefone: string | null
          status: 'ativo' | 'inativo'
          condicoes_pagamento: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          razao_social: string
          pessoa_contato?: string | null
          telefone?: string | null
          status?: 'ativo' | 'inativo'
          condicoes_pagamento?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          razao_social?: string
          pessoa_contato?: string | null
          telefone?: string | null
          status?: 'ativo' | 'inativo'
          condicoes_pagamento?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      insumos: {
        Row: {
          id: string
          nome: string
          codigo_insumo: string | null
          fornecedor_id: string | null
          categoria: string
          unidade_medida: string
          tipo_embalagem: string | null
          preco_por_unidade: number
          fator_correcao: number
          quantidade_minima_compra: number
          ultima_compra: string | null
          quantidade_comprar: number
          deposito: string | null
          observacoes: string | null
          ativo: boolean
          user_id: string
          created_at: string
          updated_at: string
          nome_comercial?: string
        }
        Insert: {
          id?: string
          nome: string
          codigo_insumo?: string | null
          fornecedor_id?: string | null
          categoria: string
          unidade_medida: string
          tipo_embalagem?: string | null
          preco_por_unidade: number
          fator_correcao?: number
          quantidade_minima_compra?: number
          ultima_compra?: string | null
          quantidade_comprar?: number
          deposito?: string | null
          observacoes?: string | null
          ativo?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          codigo_insumo?: string | null
          fornecedor_id?: string | null
          categoria?: string
          unidade_medida?: string
          tipo_embalagem?: string | null
          preco_por_unidade?: number
          fator_correcao?: number
          quantidade_minima_compra?: number
          ultima_compra?: string | null
          quantidade_comprar?: number
          deposito?: string | null
          observacoes?: string | null
          ativo?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniência para cada tabela
export type Base = Database['public']['Tables']['bases']['Row']
export type BaseInsert = Database['public']['Tables']['bases']['Insert']
export type BaseUpdate = Database['public']['Tables']['bases']['Update']

export type BaseInsumo = Database['public']['Tables']['bases_insumos']['Row']
export type BaseInsumoInsert = Database['public']['Tables']['bases_insumos']['Insert']
export type BaseInsumoUpdate = Database['public']['Tables']['bases_insumos']['Update']

export type FichaTecnica = Database['public']['Tables']['fichas_tecnicas']['Row']
export type FichaTecnicaInsert = Database['public']['Tables']['fichas_tecnicas']['Insert']
export type FichaTecnicaUpdate = Database['public']['Tables']['fichas_tecnicas']['Update']

export type FichaInsumo = Database['public']['Tables']['fichas_insumos']['Row']
export type FichaInsumoInsert = Database['public']['Tables']['fichas_insumos']['Insert']
export type FichaInsumoUpdate = Database['public']['Tables']['fichas_insumos']['Update']

export type FichaBase = Database['public']['Tables']['fichas_bases']['Row']
export type FichaBaseInsert = Database['public']['Tables']['fichas_bases']['Insert']
export type FichaBaseUpdate = Database['public']['Tables']['fichas_bases']['Update']

export type Produto = Database['public']['Tables']['produtos']['Row']
export type ProdutoInsert = Database['public']['Tables']['produtos']['Insert']
export type ProdutoUpdate = Database['public']['Tables']['produtos']['Update']

export type Fornecedor = Database['public']['Tables']['fornecedores']['Row']
export type FornecedorInsert = Database['public']['Tables']['fornecedores']['Insert']
export type FornecedorUpdate = Database['public']['Tables']['fornecedores']['Update']

export type Insumo = Database['public']['Tables']['insumos']['Row']
export type InsumoInsert = Database['public']['Tables']['insumos']['Insert']
export type InsumoUpdate = Database['public']['Tables']['insumos']['Update']

// Tipos com relacionamentos
export type InsumoComFornecedor = Insumo & {
  fornecedores?: Fornecedor | null
}

export type BaseComInsumos = Base & {
  bases_insumos?: (BaseInsumo & {
    insumos?: Insumo
  })[]
}

export type FichaTecnicaCompleta = FichaTecnica & {
  fichas_insumos?: (FichaInsumo & {
    insumos?: Insumo
  })[]
  fichas_bases?: (FichaBase & {
    bases?: Base
  })[]
}