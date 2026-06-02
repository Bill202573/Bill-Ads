# 🚀 Setup da IA - Como Começar

## Pré-requisitos

1. **Conta OpenAI**
   - Criar em: https://platform.openai.com
   - Ter créditos disponíveis (mínimo recomendado: R$ 50)

2. **API Key da OpenAI**
   - Acessar: https://platform.openai.com/api/keys
   - Criar nova key
   - Copiar a chave (aparece uma única vez)

## 1️⃣ Configurar a Chave de API

### No seu projeto local:

Arquivo: `.env.local`
```env
VITE_OPENAI_API_KEY=sk_your_actual_key_here
```

**⚠️ SEGURANÇA:**
- Nunca commite .env.local no Git
- A chave nunca deve aparecer em commits
- Se vazar acidentalmente, revogue imediatamente em https://platform.openai.com/api/keys

### Em Produção (Vercel):

1. Acesse seu projeto em vercel.com
2. Vá para Settings → Environment Variables
3. Adicione:
   - Key: `VITE_OPENAI_API_KEY`
   - Value: `sk_...`

## 2️⃣ Escolher o Tipo de Negócio

A IA usa customizações específicas conforme seu tipo de negócio.

**Tipos suportados:**
- `ecommerce` - Loja online, e-commerce
- `saas` - Software/plataforma como serviço
- `b2b` - Vendas para empresas
- `services` - Consultoria, agência, serviços
- `app` - App móvel ou aplicação
- `lead_gen` - Geração de leads
- `other` - Outro tipo

**Como definir:**

No arquivo `src/services/openai-insights-service.ts`, adicione:

```typescript
// No método buildAdvancedPrompt, após o prompt inicial, adicione:

const businessCustomization = getCustomizationPrompt('ecommerce');
// Mude 'ecommerce' para seu tipo
prompt += businessCustomization;
```

## 3️⃣ Testar a Análise

### Teste Local

1. Conecte uma integração Meta Ads em Settings
2. Sincronize campanhas
3. Vá para "Insights & Análises"
4. Selecione uma campanha
5. Clique em "Analisar Campanha"
6. Aguarde a resposta da IA (~3-5 segundos)

### Verificar Erros

Se houver erro, abra o console do navegador (F12):
- DevTools → Console → veja a mensagem de erro
- Verifique se a API key está correta
- Confirme que há créditos suficientes

## 4️⃣ Entender os Insights Gerados

Cada insight tem:

```json
{
  "title": "CTR Abaixo da Média",
  "description": "O CTR é 1.2%, abaixo da meta de 2-3%...",
  "recommended_action": "1. Teste novo copy... 2. Revise imagem...",
  "confidence": 87
}
```

**Campos:**
- **title**: O problema ou oportunidade
- **description**: Por que isso importa (com números)
- **recommended_action**: O que fazer (passos concretos)
- **confidence**: Quão confiante a IA está (0-100%)

## 5️⃣ Personalizar para Seu Negócio

### Opção A: Usando as Customizações Prontas

Se seu negócio é um dos tipos suportados, é automático!

### Opção B: Criar Customização Personalizada

Edite `src/services/ai-customization.ts` e adicione seu tipo:

```typescript
myecommerce: {
  businessType: 'myecommerce',
  businessDescription: 'Loja de tênis esportivos',
  primaryKPIs: ['ROAS', 'Ticket Médio', 'Customer LTV'],
  benchmarks: {
    ctr: { min: 1.5, target: 3.5, max: 6 },
    cpc: { min: 0.4, target: 1.2, max: 2.5 },
    roas: { min: 2, target: 3.5, max: 5 },
  },
  focusAreas: [
    'Conversion rate em checkout',
    'Tamanho do produto certo',
    'Frete e devoluções',
  ],
  customPromptAddons: `
  CONTEXTO: Loja de tênis esportivos premium
  
  Focar em:
  - Segmentação por esporte (corrida, futebol, basquete)
  - Tamanho correto (muitas devoluções por tamanho errado)
  - Frete grátis acima de R$ 250
  `,
}
```

### Opção C: Ajustar Manualmente o Prompt

Edite o método `getSystemPrompt()` ou `buildAdvancedPrompt()` para adicionar contexto customizado.

## 6️⃣ Monitorar Custos

**Custo estimado por análise:**
- Análise simples: ~R$ 0.02
- Análise completa (múltiplas campanhas): ~R$ 0.05-0.10

**Exemplo:**
- 100 campanhas analisadas = ~R$ 5
- 1000 campanhas = ~R$ 50

Para ver uso:
1. Acesse https://platform.openai.com/account/usage
2. Veja quanto foi gasto no período
3. Defina limites em https://platform.openai.com/account/billing/limits

## 7️⃣ Treinar a IA (Prompt Engineering)

A IA melhora quando você:

### ✅ Fazer
1. **Adicionar contexto específico**
   ```typescript
   prompt += "\n=== SEU PÚBLICO ALVO ===\n";
   prompt += "Mulheres 25-35 anos, renda alta, urbanas";
   ```

2. **Refinar os benchmarks**
   ```typescript
   benchmarks: {
     ctr: { min: 2, target: 4, max: 8 }, // Seu alvo específico
   }
   ```

3. **Adicionar exemplos**
   ```typescript
   prompt += "\nExemplos de problemas similares que foram resolvidos:\n";
   prompt += "- CTR baixo → Novo copy → CTR subiu 40%\n";
   ```

### ❌ Evitar
1. Prompts muito genéricos
2. Contexto incompleto (não fornecer dados históricos)
3. Pedir coisas que a IA não consegue fazer (gerar imagens, criar anúncios)

## 8️⃣ Troubleshooting

### Erro: "OpenAI API key not configured"
- Solução: Verifique se a chave está em `.env.local`
- Recarregue a página (Ctrl+F5)
- Confirme se a variável VITE_OPENAI_API_KEY está correta

### Erro: "Rate limit exceeded"
- Solução: Aguarde 60 segundos antes de fazer nova análise
- Reduza o número de campanhas analisadas simultaneamente
- Considere upgrade de plano na OpenAI

### Insights vazios ou genéricos
- Solução: Verifique se há dados suficientes (mínimo 3 dias)
- Sincronize novamente as campanhas
- Ajuste o prompt para ser mais específico

### A IA não fala português
- Solução: Edite `getSystemPrompt()` e adicione "Sempre responda em português"
- Lembre-se que a IA não tem conhecimento de idioma do sistema

## 9️⃣ Próximas Melhorias

Conforme você coleta dados:

1. **Coletar Feedback**
   - Qual % das recomendações foi útil?
   - Quais insights foram implementados?
   - Qual foi o impacto?

2. **Fine-tuning (Futuro)**
   - Quando tiver 100+ análises bem-sucedidas
   - Pode fazer fine-tuning do modelo
   - +20-30% de melhora esperada

3. **Automação**
   - Alertas automáticos quando problema detectado
   - Recomendações implementadas automaticamente
   - Dashboard preditivo

## 🔟 Recursos Úteis

- **Documentação OpenAI**: https://platform.openai.com/docs
- **Guia de Prompt Engineering**: https://platform.openai.com/docs/guides/prompt-engineering
- **Pricing**: https://openai.com/pricing
- **Status API**: https://status.openai.com

---

**Dúvidas?** Consulte `AI_TRAINING_GUIDE.md` para entender melhor como a IA funciona.
