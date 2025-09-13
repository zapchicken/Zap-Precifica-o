# 📋 Guia de Importação Flexível - Fichas Técnicas

## 🎯 **Você pode importar com as informações que tem!**

### 📊 **Opções de Template:**

#### **Opção 1: Mínimo (Apenas o essencial)**
- **Arquivo**: `template_fichas_minimo.csv`
- **Campos**: Apenas `codigo_pdv` e `produto`
- **Use quando**: Você só tem códigos e nomes dos produtos

```csv
codigo_pdv,produto
PRD001,Combo Família Grande
PRD002,Balde Médio 8 Pedaços
```

#### **Opção 2: Completo (Com todas as informações)**
- **Arquivo**: `template_fichas_completo.csv`
- **Campos**: Todos os campos disponíveis
- **Use quando**: Você tem mais informações sobre os produtos

```csv
codigo_pdv,produto,categoria,tempo_preparo,rendimento,custo_unitario,modo_preparo
PRD001,Combo Família Grande,COMBO LANCHES FRANGO,30,1,0.00,Preparar conforme receita padrão
```

## ✅ **Campos Obrigatórios (Mínimo para funcionar):**

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `codigo_pdv` | Código único do produto | PRD001 |
| `produto` | Nome do produto | Combo Família Grande |

## 🔧 **Campos Opcionais (Preencha se tiver):**

| Campo | Descrição | Valor Padrão | Exemplo |
|-------|-----------|--------------|---------|
| `categoria` | Categoria do produto | LANCHES | COMBO LANCHES FRANGO |
| `tempo_preparo` | Tempo em minutos | 0 | 30 |
| `rendimento` | Quantidade produzida | 1 | 1 |
| `custo_unitario` | Custo unitário | 0.00 | 0.00 |
| `modo_preparo` | Instruções de preparo | "A definir" | Preparar conforme receita |

## 🎯 **Categorias Disponíveis (se quiser usar):**

- ACOMPANHAMENTOS
- BEBIDAS CERVEJAS E CHOPP
- BEBIDAS REFRIGERANTES
- BEBIDAS SUCOS
- COMBO LANCHES CARNE ANGUS
- COMBO LANCHES FRANGO
- FRANGO AMERICANO
- JUMBOS (COMBINADOS GRANDES)
- LANCHES
- MOLHOS
- PROMOÇÕES
- SALADAS
- SOBREMESAS
- ZAPBOX (COMBINADOS INDIVIDUÁIS)

## 🚀 **Como Proceder:**

### **Cenário 1: Só tenho códigos e nomes**
1. Use `template_fichas_minimo.csv`
2. Preencha apenas `codigo_pdv` e `produto`
3. Importe normalmente
4. Complete as informações depois editando cada ficha

### **Cenário 2: Tenho algumas informações extras**
1. Use `template_fichas_completo.csv`
2. Preencha os campos que souber
3. Deixe vazios os campos que não souber
4. O sistema usará valores padrão

### **Cenário 3: Tenho informações parciais**
1. Use qualquer template
2. Preencha o que souber
3. Deixe vazio o que não souber
4. Complete depois

## 📝 **Exemplos Práticos:**

### **Exemplo 1: Só códigos e nomes**
```csv
codigo_pdv,produto
BAL001,Balde 8 Pedaços
COM001,Combo Família
BAT001,Batata Grande
```

### **Exemplo 2: Com algumas categorias**
```csv
codigo_pdv,produto,categoria
BAL001,Balde 8 Pedaços,FRANGO AMERICANO
COM001,Combo Família,COMBO LANCHES FRANGO
BAT001,Batata Grande,ACOMPANHAMENTOS
```

### **Exemplo 3: Com tempo de preparo**
```csv
codigo_pdv,produto,categoria,tempo_preparo
BAL001,Balde 8 Pedaços,FRANGO AMERICANO,25
COM001,Combo Família,COMBO LANCHES FRANGO,30
BAT001,Batata Grande,ACOMPANHAMENTOS,15
```

## ⚠️ **Importante:**

- **Códigos únicos**: Cada produto deve ter um código único
- **Nomes obrigatórios**: Todo produto precisa de um nome
- **Campos vazios**: Podem ser preenchidos depois
- **Valores padrão**: O sistema usará valores padrão para campos vazios

## 🔄 **Após a Importação:**

1. **Verificar**: Confirme que todos os produtos foram importados
2. **Editar**: Acesse cada ficha e complete as informações
3. **Adicionar insumos**: Defina os insumos necessários
4. **Calcular custos**: O sistema calculará automaticamente
5. **Ajustar preços**: Defina preços de venda

## 💡 **Dicas:**

- **Comece simples**: Use o template mínimo se não tiver muitas informações
- **Complete gradualmente**: Adicione informações conforme for lembrando
- **Use categorias**: Ajuda na organização dos produtos
- **Tempo de preparo**: Estime se souber, deixe 0 se não souber

## 🎉 **Resultado:**

Independente de quantas informações você tiver, conseguirá:
- ✅ Importar todos os 143 produtos
- ✅ Criar fichas técnicas básicas
- ✅ Ter produtos no catálogo
- ✅ Completar informações depois
- ✅ Adicionar insumos e custos posteriormente

**Use o template que melhor se adequa às suas informações disponíveis!** 🚀
