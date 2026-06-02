/**
 * Customização de IA - Configurações de análise personalizadas por tipo de negócio
 *
 * Use este arquivo para ajustar como a IA analisa campanhas específicas do seu negócio.
 */

export interface AICustomization {
  businessType: 'ecommerce' | 'saas' | 'b2b' | 'services' | 'app' | 'lead_gen' | 'other';
  businessDescription: string;
  primaryKPIs: string[];
  benchmarks: {
    ctr: { min: number; target: number; max: number };
    cpc: { min: number; target: number; max: number };
    roas?: { min: number; target: number; max: number };
    conversionRate?: { min: number; target: number; max: number };
  };
  focusAreas: string[];
  customPromptAddons: string;
}

/**
 * Configurações padrão por tipo de negócio
 */
export const BUSINESS_CUSTOMIZATIONS: Record<string, AICustomization> = {
  ecommerce: {
    businessType: 'ecommerce',
    businessDescription: 'Loja online de e-commerce',
    primaryKPIs: ['ROAS', 'AOV (Ticket Médio)', 'Conversion Rate', 'Customer Lifetime Value'],
    benchmarks: {
      ctr: { min: 0.5, target: 2.5, max: 5 },
      cpc: { min: 0.3, target: 1.5, max: 3 },
      roas: { min: 1.5, target: 3, max: 5 },
      conversionRate: { min: 0.5, target: 2, max: 4 },
    },
    focusAreas: [
      'Conversion rate optimization',
      'Ticket médio e AOV',
      'Cart abandonment',
      'Product page optimization',
      'Retargeting effectiveness',
    ],
    customPromptAddons: `
CONTEXTO: Este é um negócio de E-COMMERCE

MÉTRICAS CRÍTICAS:
- Taxa de conversão (quanto % dos cliques viram vendas)
- ROAS (cada R$ gasto deve gerar R$ 3+ em vendas)
- Ticket médio (valor médio do pedido)
- Custo de aquisição (CAC) vs Lifetime Value (LTV)

PRIORIDADES DE ANÁLISE:
1. O ROAS está abaixo do alvo? Recomende testes de creative
2. Conversão baixa? Analise landing page e UX
3. CPC alto? Pode ser audience targeting ruim ou produto não relevante

RECOMENDAÇÕES ESPECÍFICAS PARA E-COMMERCE:
- Teste retargeting para quem visitou mas não comprou
- Implemente pixel de rastreamento correto
- Use dynamic ads com produtos específicos
- A/B teste preços, frete e promoções
`,
  },

  saas: {
    businessType: 'saas',
    businessDescription: 'Plataforma SaaS / Software',
    primaryKPIs: ['Trial Signups', 'Conversion to Paid', 'CAC vs LTV', 'Monthly Active Users'],
    benchmarks: {
      ctr: { min: 1, target: 3, max: 6 },
      cpc: { min: 0.5, target: 2, max: 5 },
      conversionRate: { min: 1, target: 3, max: 6 },
    },
    focusAreas: [
      'Trial conversion rate',
      'Lead quality vs quantity',
      'Free tier activation',
      'Upsell opportunities',
      'Churn reduction',
    ],
    customPromptAddons: `
CONTEXTO: Este é um negócio de SAAS

MÉTRICAS CRÍTICAS:
- Taxa de conversão para trial (% que começam teste gratuito)
- Trial to Paid conversion (% que viram clientes pagos)
- CAC payback period (quanto tempo para recuperar o investimento em ads)
- LTV (lifetime value do cliente)

PRIORIDADES:
1. Leads qualificados são mais importantes que volume
2. Landing page deve destacar benefício principal, não features
3. CTR baixo? Segmente por persona (startup vs enterprise)
4. Conversion baixa? Pode ser formulário muito longo

RECOMENDAÇÕES:
- Use lead magnets (webinars, case studies, templates)
- Segmente por company size / industry
- Implemente chat widget em landing page
- Faça retargeting para leads que abandonaram formulário
- Teste ofertas (teste grátis estendido, crédito, etc)
`,
  },

  b2b: {
    businessType: 'b2b',
    businessDescription: 'Empresa B2B (vendas para empresas)',
    primaryKPIs: ['Lead Quality', 'Sales Qualified Leads (SQL)', 'Demo Requests', 'Closed Deals'],
    benchmarks: {
      ctr: { min: 0.8, target: 2, max: 4 },
      cpc: { min: 1, target: 3, max: 8 },
      conversionRate: { min: 0.5, target: 2, max: 4 },
    },
    focusAreas: [
      'Lead quality score',
      'Sales readiness',
      'Decision maker targeting',
      'Account-based marketing',
      'Demo booking rate',
    ],
    customPromptAddons: `
CONTEXTO: Este é um negócio B2B

MÉTRICAS CRÍTICAS:
- Lead quality (só importa se é prospect real, não spam)
- MQL to SQL conversion (qual % de leads são viáveis?)
- Sales cycle length (quanto tempo até fechar?)
- Deal size / Lifetime value

PRIORIDADES:
1. QUALIDADE > QUANTIDADE (1 lead bom vale 100 ruins)
2. Targeting é crítico: job title, company size, industry
3. Mensagem deve ser específica para decision maker
4. Timing é importante (lead precisa estar procurando solução)

RECOMENDAÇÕES:
- Use LinkedIn Ads para targeting preciso
- Crie conteúdo específico por vertical/indústria
- Implemente lead scoring (qualifique antes de passar sales)
- Faça retargeting de visitantes com company accounts
- Use case studies de clientes similares
- Ofereça recursos educacionais (webinars, whitepapers) para nutrir leads
`,
  },

  services: {
    businessType: 'services',
    businessDescription: 'Empresa de serviços (consultoria, agência, etc)',
    primaryKPIs: ['Qualified Inquiries', 'Proposal Rate', 'Project Value', 'Client Retention'],
    benchmarks: {
      ctr: { min: 1, target: 2.5, max: 4 },
      cpc: { min: 0.8, target: 2, max: 4 },
      conversionRate: { min: 2, target: 5, max: 10 },
    },
    focusAreas: [
      'Inquiry quality',
      'Portfolio showcase',
      'Social proof / testimonials',
      'Service expertise positioning',
      'Budget qualification',
    ],
    customPromptAddons: `
CONTEXTO: Este é um negócio de SERVIÇOS

MÉTRICAS CRÍTICAS:
- Número de leads qualificados (pessoas realmente precisando do serviço)
- Taxa de proposta (qual % de leads recebem proposta)
- Valor médio do projeto
- Taxa de fechamento
- Retenção e referrals

PRIORIDADES:
1. Demonstre expertise e confiança (portfolio, prêmios, certificações)
2. Social proof é crucial (reviews, testimonials, case studies)
3. Precisa usar retargeting (decisão de serviços é lenta)
4. Posicione valor, não apenas preço

RECOMENDAÇÕES:
- Mostre trabalhos anteriores (portfolio ads)
- Use vídeos de clientes satisfeitos (testimonials)
- Cite prêmios, certificações, experiência
- Segmente por tipo de projeto (startup vs corporation)
- Inclua CTA claro (chamar, email, agendar consulta)
- Retarget visitantes de website por 30+ dias
- Destaque diferenciais (metodologia, expertise, tempo, qualidade)
`,
  },

  lead_gen: {
    businessType: 'lead_gen',
    businessDescription: 'Geração de leads',
    primaryKPIs: ['Lead Volume', 'Lead Cost', 'Lead Quality Score', 'Form Completion Rate'],
    benchmarks: {
      ctr: { min: 1.5, target: 3, max: 6 },
      cpc: { min: 0.2, target: 1, max: 2.5 },
      conversionRate: { min: 5, target: 10, max: 20 },
    },
    focusAreas: [
      'Form optimization',
      'Lead form fatigue',
      'Data quality',
      'Form abandonment',
      'Lead validation',
    ],
    customPromptAddons: `
CONTEXTO: Este é um negócio de GERAÇÃO DE LEADS

MÉTRICAS CRÍTICAS:
- CPL (Cost Per Lead) - quanto custa gerar 1 lead?
- Form completion rate - qual % das pessoas completam o formulário?
- Lead quality - qual % dos leads é válido/acionável?
- Lead throughput - quantos leads está gerando?

PRIORIDADES:
1. Equilíbrio entre quantidade e qualidade
2. Formulário muito longo = abandono
3. Oferta tem que ser irresistível (free trial, guide, webinar, etc)
4. Mobile optimization é CRÍTICO

RECOMENDAÇÕES:
- Teste diferentes ofertas (guia, template, consulta, webinar)
- Minimize campos do formulário (3-5 é ideal)
- Use progressive profiling (dados em múltiplos passos)
- Implemente live chat para ajudar no checkout
- A/B teste CTA button copy ("Get Free Guide" vs "Download Now")
- Mobile: botão grande, formulário rápido
- Follow-up automático (email em 5 minutos)
- Valide qualidade (email válido, número real, etc)
`,
  },

  app: {
    businessType: 'app',
    businessDescription: 'App móvel ou aplicação',
    primaryKPIs: ['Install Rate', 'Cost Per Install', '7-Day Retention', 'Monthly Active Users'],
    benchmarks: {
      ctr: { min: 2, target: 4, max: 8 },
      cpc: { min: 0.5, target: 1.5, max: 3 },
      conversionRate: { min: 5, target: 12, max: 20 },
    },
    focusAreas: [
      'Install conversion',
      'Post-install retention',
      'User onboarding',
      'In-app engagement',
      'DAU/MAU ratio',
    ],
    customPromptAddons: `
CONTEXTO: Este é um negócio de APP MÓVEL

MÉTRICAS CRÍTICAS:
- CPI (Cost Per Install) - quanto custa cada install
- Install rate - qual % clica e completa o download?
- Day 1 / Day 7 retention - qual % volta para usar?
- Daily Active Users (DAU) vs Monthly Active Users (MAU)

PRIORIDADES:
1. Instalar é fácil, manter usuário é difícil
2. Primeira experiência é crítica (primeiras 24h)
3. Onboarding smooth = melhor retention
4. Reengagement para usuários inativos

RECOMENDAÇÕES:
- Mostre app em ação (vídeo ou screenshots)
- Destaque principais features na primeira tela
- Use app store optimization (icon, description, screenshots)
- Retargeting de quem instalou mas não usou
- Push notifications estratégicas (não spam)
- Ofereça incentivos (bonus, moeda, conteúdo exclusivo)
- A/B teste onboarding tutoriais
- Implemente deep linking (publicidade direto em feature)
- Segmente por tipo de usuário (novo vs repeat)
`,
  },

  other: {
    businessType: 'other',
    businessDescription: 'Outro tipo de negócio',
    primaryKPIs: [],
    benchmarks: {
      ctr: { min: 1, target: 2, max: 5 },
      cpc: { min: 0.5, target: 1.5, max: 3 },
    },
    focusAreas: ['Performance geral', 'Otimização contínua'],
    customPromptAddons: '',
  },
};

/**
 * Gera prompt customizado baseado no tipo de negócio
 */
export function getCustomizationPrompt(businessType: string): string {
  const customization = BUSINESS_CUSTOMIZATIONS[businessType] || BUSINESS_CUSTOMIZATIONS.other;

  let prompt = `\n=== CONTEXTO DO NEGÓCIO ===\n`;
  prompt += `${customization.businessDescription}\n\n`;

  prompt += `KPIs PRINCIPAIS: ${customization.primaryKPIs.join(', ')}\n\n`;

  prompt += `BENCHMARKS DO NEGÓCIO:\n`;
  prompt += `- CTR esperado: ${customization.benchmarks.ctr.min}-${customization.benchmarks.ctr.max}% (alvo: ${customization.benchmarks.ctr.target}%)\n`;
  prompt += `- CPC esperado: R$ ${customization.benchmarks.cpc.min}-${customization.benchmarks.cpc.max} (alvo: R$ ${customization.benchmarks.cpc.target})\n`;

  if (customization.benchmarks.roas) {
    prompt += `- ROAS esperado: ${customization.benchmarks.roas.min}-${customization.benchmarks.roas.max}x (alvo: ${customization.benchmarks.roas.target}x)\n`;
  }

  if (customization.benchmarks.conversionRate) {
    prompt += `- Taxa de conversão: ${customization.benchmarks.conversionRate.min}-${customization.benchmarks.conversionRate.max}% (alvo: ${customization.benchmarks.conversionRate.target}%)\n`;
  }

  prompt += `\nÁREAS DE FOCO:\n`;
  customization.focusAreas.forEach((area) => {
    prompt += `- ${area}\n`;
  });

  prompt += customization.customPromptAddons;

  return prompt;
}

export default BUSINESS_CUSTOMIZATIONS;
