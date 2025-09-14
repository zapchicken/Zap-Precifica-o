import { useState } from 'react';

export const useAISuggestions = () => {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async (insumos: any[]) => {
    setIsLoading(true);
    setSuggestions(null);

    try {
      // Verificar se a chave da API está disponível
      const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
      console.log('API Key disponível:', !!apiKey);
      console.log('Insumos enviados:', insumos.length, 'itens');

      if (!apiKey) {
        throw new Error('Chave da API não encontrada. Verifique o arquivo .env.local');
      }

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: `Você é um consultor especializado em precificação para restaurantes e lanchonetes. 
              
Analise os insumos fornecidos e dê sugestões específicas e práticas:

1. MARKUP IDEAL: Para cada categoria de insumo, sugira um markup baseado no tipo de produto
2. ECONOMIA DE FORNECEDOR: Identifique insumos onde pode haver economia trocando fornecedor
3. MARGEM DE MANOBRA: Aponte qual insumo tem maior potencial de ajuste de preço

Seja específico com números e valores. Use apenas os dados fornecidos. Responda em português brasileiro de forma direta e profissional.`
            },
            {
              role: 'user',
              content: `Analise estes insumos do meu restaurante e me dê sugestões práticas de precificação:

${JSON.stringify(insumos.slice(0, 10), null, 2)}

${insumos.length > 10 ? `\n... e mais ${insumos.length - 10} insumos no total.` : ''}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        setSuggestions(content);
      } else {
        throw new Error('Resposta da API em formato inesperado');
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      setSuggestions(`Erro ao gerar sugestões: ${error.message}. Verifique o console para mais detalhes.`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    suggestions,
    isLoading,
    generateSuggestions,
  };
};
