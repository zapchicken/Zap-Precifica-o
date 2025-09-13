# 📋 Instruções para Importar Fichas Técnicas (Sem Insumos)

## 🎯 **Objetivo**
Importar seus 143 produtos como fichas técnicas básicas, sem insumos, para depois completar as informações manualmente.

## 📁 **Arquivos Disponíveis**
- `template_fichas_tecnicas_simples.csv` - Template em formato CSV
- `template_fichas_tecnicas_simples.xlsx` - Template em formato Excel

## 📊 **Estrutura do Template**

### Colunas Obrigatórias:

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `codigo_pdv` | Texto | Código único do produto | PRD001 |
| `produto` | Texto | Nome do produto | Combo Família Grande |
| `categoria` | Texto | Categoria do produto | COMBO LANCHES FRANGO |

### Colunas Opcionais:

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `tempo_preparo` | Número | Tempo de preparo em minutos | 30 |
| `rendimento` | Número | Quantidade produzida | 1 |
| `custo_unitario` | Número | Custo unitário (deixe 0.00) | 0.00 |
| `modo_preparo` | Texto | Instruções de preparo | Preparar conforme receita padrão |

## 🎯 **Categorias Disponíveis**

Use exatamente estas categorias (em maiúsculas):

- **ACOMPANHAMENTOS** - Acompanhamentos e porções
- **BEBIDAS CERVEJAS E CHOPP** - Cervejas e chopp
- **BEBIDAS REFRIGERANTES** - Refrigerantes e águas
- **BEBIDAS SUCOS** - Sucos naturais e industrializados
- **COMBO LANCHES CARNE ANGUS** - Combos com carne angus
- **COMBO LANCHES FRANGO** - Combos com frango
- **FRANGO AMERICANO** - Baldes e porções de frango
- **JUMBOS (COMBINADOS GRANDES)** - Combos grandes e familiares
- **LANCHES** - Lanches e sanduíches
- **MOLHOS** - Molhos e temperos
- **PROMOÇÕES** - Produtos em promoção
- **SALADAS** - Saladas e pratos leves
- **SOBREMESAS** - Sobremesas e doces
- **ZAPBOX (COMBINADOS INDIVIDUÁIS)** - Combos individuais

## ✅ **Validações**

### Campos Obrigatórios:
- ✅ `codigo_pdv` - Deve ser único
- ✅ `produto` - Nome do produto

### Campos Opcionais (com valores padrão):
- `categoria` - Se vazio, será "LANCHES"
- `tempo_preparo` - Se vazio, será 0
- `rendimento` - Se vazio, será 1
- `custo_unitario` - Se vazio, será 0.00
- `modo_preparo` - Se vazio, será "A definir"

## 🚀 **Como Importar**

1. **Baixe o template** (`template_fichas_tecnicas_simples.csv`)
2. **Edite com seus 143 produtos**:
   - Substitua os códigos pelos seus códigos reais
   - Substitua os nomes pelos seus produtos reais
   - Escolha as categorias corretas
   - Ajuste os tempos de preparo se souber
3. **Salve em formato CSV ou XLSX**
4. **Acesse a página "Fichas Técnicas"**
5. **Clique em "Importar Fichas Técnicas"**
6. **Selecione seu arquivo**
7. **Aguarde o processamento**

## 📝 **Exemplo de Uso**

```csv
codigo_pdv,produto,categoria,tempo_preparo,rendimento,custo_unitario,modo_preparo
BAL001,Balde 8 Pedaços,FRANGO AMERICANO,25,1,0.00,Preparar conforme receita padrão
COM001,Combo Família,COMBO LANCHES FRANGO,30,1,0.00,Preparar conforme receita padrão
BAT001,Batata Grande,ACOMPANHAMENTOS,15,1,0.00,Preparar conforme receita padrão
```

## ⚠️ **Importante**

- **Sem Insumos**: As fichas serão criadas sem insumos
- **Produtos Automáticos**: Cada ficha criará automaticamente um produto correspondente
- **Completar Depois**: Você pode editar cada ficha depois para adicionar insumos, custos e receitas
- **Códigos Únicos**: Use códigos únicos para cada produto

## 🔄 **Próximos Passos (Após Importação)**

1. **Verificar Importação**: Confirme que todos os 143 produtos foram importados
2. **Editar Fichas**: Acesse cada ficha e complete:
   - Insumos necessários
   - Quantidades
   - Custos unitários
   - Modo de preparo detalhado
3. **Calcular Custos**: O sistema calculará automaticamente os custos totais
4. **Ajustar Preços**: Defina preços de venda baseados nos custos

## 🆘 **Solução de Problemas**

### Erro: "Código PDV já existe"
- Verifique se o código já está cadastrado
- Use códigos únicos para cada produto

### Erro: "Categoria inválida"
- Use apenas as categorias listadas acima
- Verifique se não há espaços extras

### Erro: "Arquivo não encontrado"
- Verifique se o arquivo está em formato CSV ou XLSX
- Certifique-se de que o arquivo não está corrompido

## 💡 **Dicas**

- **Códigos**: Use um padrão consistente (ex: BAL001, COM001, BAT001)
- **Categorias**: Escolha a categoria mais específica possível
- **Tempo de Preparo**: Estime o tempo real de preparo
- **Modo de Preparo**: Pode deixar genérico por enquanto

## 🎉 **Resultado Esperado**

Após a importação, você terá:
- ✅ 143 fichas técnicas criadas
- ✅ 143 produtos no catálogo
- ✅ Produtos sincronizados automaticamente
- ✅ Base para completar as informações de insumos
