// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.error('Crie um arquivo .env.local com:')
  console.error('VITE_SUPABASE_URL=sua_url_aqui')
  console.error('VITE_SUPABASE_ANON_KEY=sua_chave_aqui')
  
  // Fallback para desenvolvimento
  if (import.meta.env.DEV) {
    console.warn('⚠️ Modo de desenvolvimento - usando configuração mock')
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Função para testar a conexão
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('insumos').select('count').limit(1)
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('❌ Erro inesperado na conexão:', error)
    return false
  }
}

// Função para verificar se as credenciais estão configuradas
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key')
}