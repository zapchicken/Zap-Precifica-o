// Função para melhorar texto de descrição de produtos
export const improveProductDescription = async (originalText: string): Promise<string> => {
  try {
    // Aqui você pode integrar com sua API de IA preferida (OpenAI, Claude, etc.)
    // Por enquanto, faremos uma melhoria básica local
    
    if (!originalText.trim()) {
      return originalText
    }

    // Melhoria básica: capitalização, pontuação e formatação
    let improvedText = originalText
      .trim()
      // Remove espaços extras
      .replace(/\s+/g, ' ')
      // Capitaliza primeira letra de cada frase
      .split('. ')
      .map(sentence => {
        sentence = sentence.trim()
        if (sentence.length > 0) {
          return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()
        }
        return sentence
      })
      .join('. ')
    
    // Adiciona ponto final se não houver
    if (improvedText && !improvedText.endsWith('.') && !improvedText.endsWith('!') && !improvedText.endsWith('?')) {
      improvedText += '.'
    }

    // Correções específicas para descrições de produtos de restaurante
    const corrections = {
      'mt': 'muito',
      'saboroso': 'saboroso',
      'gostoso': 'delicioso',
      'bom': 'excelente',
      'boa': 'excelente',
      'mt bom': 'muito saboroso',
      'mt boa': 'muito saborosa',
      'bem': 'muito',
      'perfeito': 'perfeito',
      'otimo': 'ótimo',
      'optimo': 'ótimo',
    }

    // Aplica correções
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
      improvedText = improvedText.replace(regex, correct)
    })

    // Adiciona palavras mais atrativas para descrições de restaurante
    if (improvedText.length < 50) {
      // Se a descrição for muito curta, adiciona elementos descritivos
      const descriptiveWords = [
        'preparo artesanal',
        'ingredientes selecionados',
        'sabor único',
        'receita especial',
        'apresentação cuidadosa'
      ]
      
      // Adiciona uma palavra descritiva aleatória se a descrição for muito simples
      if (!improvedText.includes('sabor') && !improvedText.includes('preparo') && !improvedText.includes('ingrediente')) {
        const randomDescriptor = descriptiveWords[Math.floor(Math.random() * descriptiveWords.length)]
        improvedText = `${improvedText.replace('.', '')}, com ${randomDescriptor}.`
      }
    }

    return improvedText

  } catch (error) {
    console.error('Erro ao melhorar texto:', error)
    return originalText
  }
}

// Função para integração futura com APIs de IA
export const improveTextWithAI = async (text: string, apiKey?: string): Promise<string> => {
  // Aqui você pode implementar a integração com OpenAI, Claude, ou outra API
  // Exemplo com OpenAI:
  /*
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em marketing gastronômico. Melhore a descrição de produtos de restaurante tornando-a mais atrativa e profissional, mantendo as informações principais. Retorne apenas o texto melhorado.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    })

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Erro na API de IA:', error)
    return improveProductDescription(text)
  }
  */
  
  // Por enquanto, usa a melhoria local
  return improveProductDescription(text)
}