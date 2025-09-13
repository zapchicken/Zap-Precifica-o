# Estrutura da API - Taxa de Marcação

## Visão Geral

A API para o sistema de Taxa de Marcação utiliza o Supabase como backend, fornecendo endpoints RESTful para gerenciar configurações de markup, canais de venda, categorias e modelos salvos.

## Tabelas do Banco de Dados

### 1. config_markup_geral
Armazena as configurações básicas para cálculo de markup.

```sql
CREATE TABLE config_markup_geral (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faturamento_estimado_mensal NUMERIC NOT NULL DEFAULT 0,
  impostos_faturamento NUMERIC NOT NULL DEFAULT 0,
  taxa_cartao NUMERIC NOT NULL DEFAULT 0,
  outros_custos NUMERIC NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. canais_venda
Gerencia os canais de venda com suas respectivas taxas.

```sql
CREATE TABLE canais_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  taxa_marketplace NUMERIC NOT NULL DEFAULT 0,
  taxa_antecipacao NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. config_markup_categoria
Configurações de lucro e reserva por categoria de produto.

```sql
CREATE TABLE config_markup_categoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  lucro_desejado NUMERIC NOT NULL DEFAULT 0,
  reserva_operacional NUMERIC NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. modelos_markup
Modelos de configuração salvos para reutilização.

```sql
CREATE TABLE modelos_markup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  config_geral JSONB NOT NULL,
  canais_venda JSONB NOT NULL,
  config_categorias JSONB NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Endpoints da API

### Configuração Geral

#### GET /config_markup_geral
Retorna a configuração geral do usuário.

**Resposta:**
```json
{
  "id": "uuid",
  "faturamento_estimado_mensal": 50000.00,
  "impostos_faturamento": 5.0,
  "taxa_cartao": 3.0,
  "outros_custos": 2.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### POST /config_markup_geral
Cria uma nova configuração geral.

**Payload:**
```json
{
  "faturamento_estimado_mensal": 50000.00,
  "impostos_faturamento": 5.0,
  "taxa_cartao": 3.0,
  "outros_custos": 2.0
}
```

#### PATCH /config_markup_geral?id=eq.{id}
Atualiza a configuração geral existente.

**Payload:**
```json
{
  "faturamento_estimado_mensal": 60000.00,
  "impostos_faturamento": 6.0
}
```

### Canais de Venda

#### GET /canais_venda
Retorna todos os canais de venda do usuário.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome": "iFood",
    "taxa_marketplace": 12.0,
    "taxa_antecipacao": 0.0,
    "ativo": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /canais_venda
Cria um novo canal de venda.

**Payload:**
```json
{
  "nome": "Uber Eats",
  "taxa_marketplace": 15.0,
  "taxa_antecipacao": 2.0,
  "ativo": true
}
```

#### PATCH /canais_venda?id=eq.{id}
Atualiza um canal de venda existente.

**Payload:**
```json
{
  "taxa_marketplace": 14.0,
  "ativo": false
}
```

#### DELETE /canais_venda?id=eq.{id}
Remove um canal de venda.

### Configurações por Categoria

#### GET /config_markup_categoria
Retorna todas as configurações de categoria do usuário.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "categoria": "BEBIDAS",
    "lucro_desejado": 30.0,
    "reserva_operacional": 10.0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /config_markup_categoria
Cria uma nova configuração de categoria.

**Payload:**
```json
{
  "categoria": "ALIMENTOS",
  "lucro_desejado": 25.0,
  "reserva_operacional": 8.0
}
```

#### PATCH /config_markup_categoria?id=eq.{id}
Atualiza uma configuração de categoria existente.

**Payload:**
```json
{
  "lucro_desejado": 35.0,
  "reserva_operacional": 12.0
}
```

#### DELETE /config_markup_categoria?id=eq.{id}
Remove uma configuração de categoria.

### Modelos de Markup

#### GET /modelos_markup
Retorna todos os modelos salvos do usuário.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome": "Configuração Padrão 2024",
    "config_geral": {
      "faturamento_estimado_mensal": 50000.00,
      "impostos_faturamento": 5.0,
      "taxa_cartao": 3.0,
      "outros_custos": 2.0
    },
    "canais_venda": [
      {
        "nome": "iFood",
        "taxa_marketplace": 12.0,
        "taxa_antecipacao": 0.0,
        "ativo": true
      }
    ],
    "config_categorias": [
      {
        "categoria": "BEBIDAS",
        "lucro_desejado": 30.0,
        "reserva_operacional": 10.0
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /modelos_markup
Salva um novo modelo de configuração.

**Payload:**
```json
{
  "nome": "Configuração Padrão 2024",
  "config_geral": {
    "faturamento_estimado_mensal": 50000.00,
    "impostos_faturamento": 5.0,
    "taxa_cartao": 3.0,
    "outros_custos": 2.0
  },
  "canais_venda": [
    {
      "nome": "iFood",
      "taxa_marketplace": 12.0,
      "taxa_antecipacao": 0.0,
      "ativo": true
    }
  ],
  "config_categorias": [
    {
      "categoria": "BEBIDAS",
      "lucro_desejado": 30.0,
      "reserva_operacional": 10.0
    }
  ]
}
```

#### DELETE /modelos_markup?id=eq.{id}
Remove um modelo salvo.

## Cálculo de Markup

### Fórmula
```
M = (1 + L + R) / (1 - T)
```

Onde:
- **M** = Markup (fator multiplicador)
- **L** = % Lucro desejado
- **R** = % Reserva operacional  
- **T** = Soma de todos os % sobre faturamento

### Componentes de T (Custos Totais)
- % Impostos sobre faturamento
- % Taxa de cartão
- % Outros custos
- % Despesas fixas / faturamento (calculado automaticamente)
- % Taxa do marketplace
- % Taxa de antecipação

### Validações
- Se T >= 100%, o cálculo retorna "N/A" (não aplicável)
- Todos os valores são validados para não serem negativos
- O sistema alerta quando custos excedem 100% do faturamento

## Segurança

### Row Level Security (RLS)
Todas as tabelas possuem RLS habilitado, garantindo que usuários só acessem seus próprios dados.

### Políticas de Acesso
- **SELECT**: Usuários podem visualizar apenas seus próprios registros
- **INSERT**: Usuários podem criar registros apenas para si mesmos
- **UPDATE**: Usuários podem atualizar apenas seus próprios registros
- **DELETE**: Usuários podem deletar apenas seus próprios registros

### Autenticação
Todas as operações requerem autenticação via Supabase Auth. O `user_id` é automaticamente preenchido com o ID do usuário autenticado.

## Exemplos de Uso

### 1. Configurar Markup Básico
```javascript
// 1. Salvar configuração geral
await supabase
  .from('config_markup_geral')
  .insert([{
    faturamento_estimado_mensal: 50000,
    impostos_faturamento: 5,
    taxa_cartao: 3,
    outros_custos: 2
  }])

// 2. Adicionar canais de venda
await supabase
  .from('canais_venda')
  .insert([
    { nome: 'Venda Direta', taxa_marketplace: 0, taxa_antecipacao: 0 },
    { nome: 'iFood', taxa_marketplace: 12, taxa_antecipacao: 0 }
  ])

// 3. Configurar categorias
await supabase
  .from('config_markup_categoria')
  .insert([
    { categoria: 'BEBIDAS', lucro_desejado: 30, reserva_operacional: 10 },
    { categoria: 'ALIMENTOS', lucro_desejado: 25, reserva_operacional: 8 }
  ])
```

### 2. Calcular Markup
```javascript
// Exemplo de cálculo para BEBIDAS no iFood:
// L = 30% (lucro desejado)
// R = 10% (reserva operacional)
// T = 5% (impostos) + 3% (cartão) + 2% (outros) + 8% (despesas fixas) + 12% (iFood) = 30%
// M = (1 + 0.30 + 0.10) / (1 - 0.30) = 1.40 / 0.70 = 2.0x

// Se um produto custa R$ 10,00, o preço de venda será R$ 20,00
```

### 3. Exportar Dados
```javascript
// Exportar tabela de markup para CSV
const calculos = calcularMarkup()
const csvContent = [
  ['Categoria', 'Canal', 'Markup', 'Custos Totais (%)'],
  ...calculos.map(calc => [
    calc.categoria,
    calc.canal,
    calc.markup,
    calc.custos_totais
  ])
].map(row => row.join(',')).join('\n')
```

## Considerações Técnicas

### Performance
- Índices criados em `user_id` para otimizar consultas
- Cálculos realizados no frontend para melhor responsividade
- Dados carregados em paralelo para reduzir tempo de carregamento

### Escalabilidade
- Estrutura preparada para múltiplos usuários
- JSONB usado para modelos permite flexibilidade
- RLS garante isolamento de dados

### Manutenibilidade
- Código modular com hooks separados
- Interfaces TypeScript para type safety
- Documentação completa da API
