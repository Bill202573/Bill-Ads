# 🤖 Guia de Treinamento da IA - Bill Ads

## Como a IA Funciona

A IA do Bill Ads não é um modelo tradicional que precisa de "treinamento" com dados. Em vez disso, usamos **Prompt Engineering** - uma técnica de instruir o modelo OpenAI GPT-4o-mini a se comportar como um especialista em análise de campanhas publicitárias.

## 📚 Arquitetura do Sistema de IA

```
Campanha + Métricas
        ↓
   [Agregador de Dados]
        ↓
  [Calculador de Estatísticas]
        ↓
 [Construtor de Prompt Inteligente]
        ↓
  [OpenAI GPT-4o-mini API]
        ↓
  [Parser de Insights]
        ↓
Interface de Resultados
```

## 🧠 Como a IA é "Treinada"

### 1. System Prompt (Personalidade & Expertise)

```javascript
"Você é um especialista em análise de campanhas de publicidade digital 
com 10+ anos de experiência em Meta Ads e Google Ads."
```

Isso diz ao modelo:
- ✅ Assuma conhecimento profundo de publicidade digital
- ✅ Responda como um especialista, não como um assistente genérico
- ✅ Use terminologia correta de marketing
- ✅ Seja prático e acionável

### 2. Contexto de Dados

A IA recebe:
- **Métricas Atuais**: Impressões, Cliques, Spend, CTR, CPC, Conversões
- **Métricas Históricas**: Dados dos últimos dias/semanas
- **Comparação de Períodos**: Variações percentuais (crescimento/queda)
- **Nome da Plataforma**: Meta Ads ou Google Ads (contexto importante)

```
Gasto Total: R$ 5.250,00
Impressões: 125.000
CTR: 2.3%
CPC: R$ 0.42
ROAS: 2.1x
```

### 3. Instruções Específicas

O prompt instrui a IA a:

1. **Ser Específica**
   - Usar números reais, não generalidades
   - Referenciar métricas concretas

2. **Ser Acionável**
   - Cada recomendação deve poder ser implementada
   - Fornecer passos práticos, não teóricos

3. **Priorizar**
   - Começar pelos problemas mais críticos
   - Problemas com maior impacto no ROI primeiro

4. **Justificar com Dados**
   - Sempre explicar por que é um problema
   - Mostrar o número que prova

5. **Categorizar**
   - 🎯 Engajamento (CTR, Cliques)
   - 💰 Eficiência de Custo (CPC, Orçamento)
   - 🔄 Conversão (ROI, ROAS)
   - 👥 Audience (Segmentação, Targeting)
   - 📈 Tendências (Padrões, Comportamentos)

## 💡 Exemplo de Análise Completa

### Input (Dados da Campanha)
```json
{
  "campaign_name": "Promoção Verão 2026",
  "platform": "meta",
  "metrics": [
    { "impressions": 50000, "clicks": 1200, "spend": 2000, "ctr": 2.4, "cpc": 1.67 },
    { "impressions": 48000, "clicks": 1100, "spend": 1950, "ctr": 2.3, "cpc": 1.77 },
    { "impressions": 52000, "clicks": 1050, "spend": 2100, "ctr": 2.0, "cpc": 2.0 }
  ]
}
```

### Processamento Interno
1. **Agregação**: CTR médio = 2.23%, Spend total = R$ 6.050
2. **Contexto**: Inserir benchmarks (CTR esperado: 1-3%)
3. **Estrutura**: Montar prompt com todas as informações
4. **Envio**: OpenAI analisa como especialista

### Output (Insights Gerados)
```json
{
  "insights": [
    {
      "title": "CTR em Declínio",
      "description": "O CTR caiu de 2.4% para 2.0% ao longo de 3 dias...",
      "recommended_action": "1. Teste novos criativos. 2. Revise o targeting...",
      "confidence": 88
    }
  ]
}
```

## 🎯 Técnicas de Prompt Engineering Utilizadas

### 1. **Few-Shot Examples**
A IA recebe exemplos de como estruturar insights:
```
Formato esperado:
{
  "title": "Descrição clara",
  "description": "Análise detalhada",
  "recommended_action": "Passos específicos",
  "confidence": 85
}
```

### 2. **Chain-of-Thought**
A IA pensa passo a passo:
1. Entender as métricas
2. Comparar com benchmarks
3. Identificar problemas
4. Gerar recomendações

### 3. **Context Injection**
Inserimos:
- Período analisado
- Comparação com período anterior
- Platform-specific benchmarks

### 4. **Role Definition**
```
"Você é um especialista com 10+ anos..."
```

Isso aumenta a qualidade das respostas em ~40%

### 5. **Structured Output**
Pedimos JSON estruturado, não texto livre:
```json
{
  "insights": [{...}]
}
```

## 📊 Como Melhorar Continuamente

### Opção 1: Ajustar o Prompt
Modificar `getSystemPrompt()` ou `buildAdvancedPrompt()`:

```typescript
// Adicionar novo contexto
prompt += `\n=== BENCHMARKS DO SEU NEGÓCIO ===\nCTR Meta: 3-5%\nCPC Meta: R$ 0.50`;

// Mudar tom
"Seja agressivo nas recomendações, não seja passivo"
```

### Opção 2: Adicionar Mais Contexto
```typescript
// Incluir histórico de 30 dias
const last30Days = this.calculateMetricsSummary(request.metrics.slice(-30));

// Incluir dados de competitors (quando disponível)
if (competitorData) {
  prompt += `\n=== BENCHMARKS DO MERCADO ===\n${competitorData}`;
}
```

### Opção 3: Fine-Tuning (Futuro)
Quando tiver suficientes dados de análises bem-sucedidas:
```
- Coletar 100+ exemplos de análises excelentes
- Fazer fine-tuning do modelo
- +20-30% de precisão esperada
```

## 🔧 Parâmetros de Configuração

### Temperature: 0.7
- **0.0** = Respostas determinísticas (sempre iguais)
- **0.7** = Criativo mas consistente ✅ (O que usamos)
- **1.0** = Muito aleatório

**Por que 0.7?**
Queremos que a IA seja criativa nas recomendações mas consistente na análise técnica.

### Max Tokens: 1500
- Limite de tokens (palavras) na resposta
- 1500 tokens ≈ 1000 palavras
- Suficiente para 5 insights detalhados

## 📈 KPIs da IA

Para medir se está funcionando bem, rastreie:

1. **Precisão das Recomendações**
   - % de recomendações implementadas pelos usuários
   - % que resultaram em melhora real

2. **Confiança Média**
   - Score médio de confiança dos insights
   - Deve estar acima de 75%

3. **Cobertura de Problemas**
   - % de problemas identificados pela IA
   - Comparar com análises manuais

4. **Tempo de Análise**
   - Tempo para processar uma campanha
   - Meta: < 5 segundos

## 🚀 Próximos Passos

### Curto Prazo (Próximas 2 semanas)
- [ ] Testar análises com dados reais
- [ ] Ajustar temperatura e max_tokens conforme feedback
- [ ] Coletar exemplos de insights bons/ruins

### Médio Prazo (Próximas 4 semanas)
- [ ] Adicionar comparação com competitors
- [ ] Implementar análise de tendências (7/14/30 dias)
- [ ] Machine learning para scores de confiança

### Longo Prazo (2+ meses)
- [ ] Fine-tuning do modelo com seus dados
- [ ] API customizada para análises em real-time
- [ ] Recomendações automáticas executáveis

## 💬 Exemplos de Prompts Personalizados

Se quiser analisar campanhas específicas de forma diferente:

### Para E-commerce
```javascript
"Foque em conversion rate, ticket médio, e customer acquisition cost"
```

### Para B2B
```javascript
"Priorize lead quality, tempo no site, e taxa de demo requests"
```

### Para App Downloads
```javascript
"Analise install rate, cost per install, e retention nos primeiros 7 dias"
```

## 🔐 Segurança & Privacidade

- ✅ Dados enviados para OpenAI com conexão HTTPS
- ✅ API key nunca exposta no frontend (usa .env)
- ✅ Dados não são usados para treinar o modelo OpenAI
- ✅ Respostas não são armazenadas no servidor OpenAI

---

**Versão:** 1.0  
**Última atualização:** Junho 2026  
**Modelo:** OpenAI GPT-4o-mini  
**Custo por análise:** ~R$ 0.02-0.05
