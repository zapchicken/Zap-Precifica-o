# 📋 Instruções para Importar Produtos

## 📁 Arquivos de Exemplo

- `exemplo_importar_produtos.csv` - Template em formato CSV
- `exemplo_importar_produtos.xlsx` - Template em formato Excel

## 📊 Estrutura do Arquivo

### Colunas Obrigatórias:

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `codigo` | Texto | Código único do produto | PRD001 |
| `nome` | Texto | Nome do produto | Combo Família Grande |
| `categoria` | Texto | Categoria do produto | Combo |
| `preco_atual` | Número | Preço de venda atual | 45.90 |
| `descricao` | Texto | Descrição do produto | Combo completo com 12 pedaços... |
| `ativo` | Boolean | Se o produto está ativo | true |

### Colunas Opcionais:

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `observacoes` | Texto | Observações adicionais | Produto sazonal |

## 🎯 Categorias Disponíveis

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

## ✅ Validações

### Campos Obrigatórios:
- ✅ `codigo` - Deve ser único
- ✅ `nome` - Não pode estar vazio
- ✅ `categoria` - Deve ser uma categoria válida
- ✅ `preco_atual` - Deve ser um número positivo
- ✅ `ativo` - Deve ser `true` ou `false`

### Formato dos Dados:
- **Preços**: Use ponto (.) como separador decimal (ex: 45.90)
- **Códigos**: Use apenas letras e números (ex: PRD001)
- **Booleanos**: Use `true` ou `false` (sem aspas)

## 🚀 Como Importar

1. **Baixe o template** (`exemplo_importar_produtos.csv`)
2. **Edite o arquivo** com seus produtos
3. **Salve em formato CSV ou XLSX**
4. **Acesse a página "Produtos de Venda"**
5. **Clique em "Importar Excel"**
6. **Selecione seu arquivo**
7. **Aguarde o processamento**

## ⚠️ Dicas Importantes

- **Códigos únicos**: Cada produto deve ter um código único
- **Categorias**: Use apenas as categorias listadas acima
- **Preços**: Use sempre ponto (.) como separador decimal
- **Encoding**: Salve o arquivo em UTF-8 para caracteres especiais
- **Primeira linha**: Deve conter os cabeçalhos das colunas

## 🔧 Exemplo de Uso

```csv
codigo,nome,categoria,preco_atual,descricao,ativo
PRD001,Combo Família Grande,COMBO LANCHES FRANGO,45.90,Combo completo com 12 pedaços,true
PRD002,Balde Médio 8 Pedaços,FRANGO AMERICANO,32.90,Balde com 8 pedaços de frango,true
PRD003,Porção Batata Grande,ACOMPANHAMENTOS,12.50,Porção grande de batata frita,true
```

## 🆘 Solução de Problemas

### Erro: "Código já existe"
- Verifique se o código já está cadastrado no sistema
- Use códigos únicos para cada produto

### Erro: "Categoria inválida"
- Use apenas as categorias listadas acima
- Verifique se não há espaços extras

### Erro: "Preço inválido"
- Use ponto (.) como separador decimal
- Não use vírgula (,) para separar decimais
- Exemplo correto: 45.90
- Exemplo incorreto: 45,90

### Erro: "Arquivo não encontrado"
- Verifique se o arquivo está em formato CSV ou XLSX
- Certifique-se de que o arquivo não está corrompido
