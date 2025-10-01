# 🔍 **Verificação de Problemas na Importação de Vendas**

## 📋 **Checklist de Verificação:**

### 1. **Verificar Formato do Arquivo**
- ✅ Arquivo é CSV ou XLSX?
- ✅ Arquivo não está corrompido?
- ✅ Arquivo tem dados válidos?

### 2. **Verificar Formato de Importação**
- ✅ Formato "Completo" ou "Imagem" selecionado?
- ✅ Se formato "Imagem", data da venda preenchida?
- ✅ Se formato "Imagem", canal selecionado?

### 3. **Verificar Console do Navegador**
- ❌ Há erros em vermelho?
- ❌ Há warnings em amarelo?
- ❌ Há mensagens de rede?
- ❌ Há mensagens do Supabase?

### 4. **Verificar Validação de Dados**
- ❌ Campos obrigatórios preenchidos?
- ❌ Formato dos dados correto?
- ❌ Valores numéricos válidos?

### 5. **Verificar Conexão com Supabase**
- ❌ Tabela `vendas` existe?
- ❌ Usuário autenticado?
- ❌ Permissões corretas?

## 🚨 **Problemas Comuns:**

### **Problema 1: Arquivo não é reconhecido**
```
Solução: Verificar se o arquivo é CSV ou XLSX
```

### **Problema 2: Formato não selecionado**
```
Solução: Selecionar "Formato Completo" ou "Formato da Imagem"
```

### **Problema 3: Data não preenchida (formato imagem)**
```
Solução: Preencher a data da venda obrigatória
```

### **Problema 4: Erro de validação**
```
Solução: Verificar se os dados estão no formato correto
```

### **Problema 5: Erro de conexão**
```
Solução: Verificar se o Supabase está funcionando
```

## 🔧 **Como Debugar:**

### **Passo 1: Abrir Console do Navegador**
1. Pressione `F12`
2. Vá para a aba "Console"
3. Verifique se há erros em vermelho

### **Passo 2: Verificar Arquivo**
1. Confirme se o arquivo é CSV ou XLSX
2. Verifique se o arquivo tem dados
3. Verifique se o arquivo não está corrompido

### **Passo 3: Verificar Formato**
1. Selecione o formato correto
2. Se formato "Imagem", preencha a data
3. Se formato "Imagem", selecione o canal

### **Passo 4: Verificar Validação**
1. Verifique se os campos obrigatórios estão preenchidos
2. Verifique se os dados estão no formato correto
3. Verifique se os valores numéricos são válidos

### **Passo 5: Verificar Supabase**
1. Verifique se a tabela `vendas` existe
2. Verifique se o usuário está autenticado
3. Verifique se há permissões corretas

## 📊 **Mensagens de Erro Comuns:**

### **"Data da venda é obrigatória"**
```
Solução: Preencher a data da venda (formato imagem)
```

### **"Arquivo não é reconhecido"**
```
Solução: Usar arquivo CSV ou XLSX
```

### **"Campos obrigatórios faltando"**
```
Solução: Verificar se o arquivo tem as colunas corretas
```

### **"Erro ao processar arquivo"**
```
Solução: Verificar se o arquivo não está corrompido
```

### **"Erro ao salvar no Supabase"**
```
Solução: Verificar se a tabela vendas existe
```

## 🎯 **Teste Rápido:**

1. **Selecione um arquivo CSV simples**
2. **Escolha o formato "Completo"**
3. **Clique em importar**
4. **Verifique se há erros no console**

## 📞 **Se Ainda Não Funcionar:**

1. **Copie o erro do console**
2. **Verifique se a tabela vendas existe**
3. **Verifique se o usuário está autenticado**
4. **Verifique se há permissões corretas**
