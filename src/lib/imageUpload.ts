// src/lib/imageUpload.ts
import { supabase } from './supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param file - Arquivo de imagem
 * @param folder - Pasta no bucket (opcional)
 * @returns Promise com resultado do upload
 */
export const uploadImageToStorage = async (
  file: File, 
  folder: string = 'fichas'
): Promise<UploadResult> => {
  try {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Arquivo deve ser uma imagem'
      }
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Imagem muito grande. Máximo 5MB permitido.'
      }
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('fichas-imagens')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload:', error)
      
      // Tratamento específico para erro de RLS
      if (error.message.includes('row-level security policy')) {
        return {
          success: false,
          error: 'Erro de permissão: Configure as políticas RLS do Storage no Supabase Dashboard. Veja o arquivo CONFIGURAR_STORAGE.md'
        }
      }
      
      return {
        success: false,
        error: `Erro no upload: ${error.message}`
      }
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('fichas-imagens')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl
    }

  } catch (error: any) {
    console.error('Erro inesperado no upload:', error)
    return {
      success: false,
      error: `Erro inesperado: ${error.message}`
    }
  }
}

/**
 * Remove uma imagem do Supabase Storage
 * @param url - URL da imagem a ser removida
 * @returns Promise com resultado da remoção
 */
export const deleteImageFromStorage = async (url: string): Promise<UploadResult> => {
  try {
    // Extrair o caminho do arquivo da URL
    const urlParts = url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const folder = urlParts[urlParts.length - 2]
    const filePath = `${folder}/${fileName}`

    // Remover do Storage
    const { error } = await supabase.storage
      .from('fichas-imagens')
      .remove([filePath])

    if (error) {
      console.error('Erro ao remover imagem:', error)
      return {
        success: false,
        error: `Erro ao remover imagem: ${error.message}`
      }
    }

    return {
      success: true
    }

  } catch (error: any) {
    console.error('Erro inesperado ao remover imagem:', error)
    return {
      success: false,
      error: `Erro inesperado: ${error.message}`
    }
  }
}

/**
 * Comprime uma imagem antes do upload
 * @param file - Arquivo de imagem original
 * @param maxWidth - Largura máxima (padrão: 800)
 * @param maxHeight - Altura máxima (padrão: 600)
 * @param quality - Qualidade da compressão (0-1, padrão: 0.8)
 * @returns Promise com arquivo comprimido
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Configurar canvas
      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Criar novo arquivo com nome original
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Erro ao comprimir imagem'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Erro ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Upload completo: comprime e faz upload da imagem
 * @param file - Arquivo de imagem original
 * @param folder - Pasta no bucket
 * @returns Promise com resultado do upload
 */
export const uploadAndCompressImage = async (
  file: File,
  folder: string = 'fichas'
): Promise<UploadResult> => {
  try {
    // Comprimir imagem
    const compressedFile = await compressImage(file)
    
    // Fazer upload
    const result = await uploadImageToStorage(compressedFile, folder)
    
    return result
  } catch (error: any) {
    return {
      success: false,
      error: `Erro na compressão: ${error.message}`
    }
  }
}
