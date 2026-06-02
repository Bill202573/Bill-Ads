import { DailyMetrics, CampaignInsight } from '@/types/ads';

interface OpenAIInsightRequest {
  campaign_name: string;
  platform: string;
  metrics: DailyMetrics[];
  previous_period_metrics?: DailyMetrics[];
}

interface MetricsSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCTR: number;
  avgCPC: number;
  avgROAS?: number;
  daysActive: number;
}

export class OpenAIInsightsService {
  private apiKey: string;
  private model: string = 'gpt-4o-mini';

  constructor(apiKey: string = import.meta.env.VITE_OPENAI_API_KEY || '') {
    this.apiKey = apiKey;
  }

  /**
   * Analyze campaign performance using OpenAI GPT-4o-mini
   */
  async analyzePerformance(request: OpenAIInsightRequest): Promise<CampaignInsight[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!request.metrics || request.metrics.length === 0) {
      throw new Error('No metrics available for analysis');
    }

    const currentSummary = this.calculateMetricsSummary(request.metrics);
    const previousSummary = request.previous_period_metrics
      ? this.calculateMetricsSummary(request.previous_period_metrics)
      : null;

    const prompt = this.buildAdvancedPrompt(request, currentSummary, previousSummary);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parseInsights(content, request.campaign_name);
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw error;
    }
  }

  /**
   * System prompt - define o comportamento e especialidade da IA
   */
  private getSystemPrompt(): string {
    return `Você é um especialista em análise de campanhas de publicidade digital com 10+ anos de experiência em Meta Ads e Google Ads.

Sua missão é analisar campanhas publicitárias e gerar insights acionáveis que ajudem a melhorar o ROI, otimizar custos e aumentar conversões.

Sua análise deve ser:
- Específica: Use números reais dos dados fornecidos
- Acionável: Cada recomendação deve ser implementável
- Priorizada: Comece pelos problemas mais críticos
- Baseada em dados: Sempre justifique com métricas
- Em Português: Respostas sempre em português brasileiro

Focos principais de análise:
1. Performance (CTR, CPC, ROAS)
2. Eficiência de custo
3. Oportunidades de otimização
4. Problemas críticos
5. Comparação com períodos anteriores (se disponível)`;
  }

  /**
   * Calcula estatísticas agregadas dos métricas
   */
  private calculateMetricsSummary(metrics: DailyMetrics[]): MetricsSummary {
    const total = metrics.reduce(
      (acc, m) => ({
        spend: acc.spend + (m.spend || 0),
        impressions: acc.impressions + (m.impressions || 0),
        clicks: acc.clicks + (m.clicks || 0),
        conversions: acc.conversions + (m.conversions || 0),
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
    );

    const avgCTR = total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0;
    const avgCPC = total.clicks > 0 ? total.spend / total.clicks : 0;
    const avgROAS = total.spend > 0 ? (total.conversions * 50) / total.spend : 0; // Assumindo $50 por conversão

    return {
      totalSpend: total.spend,
      totalImpressions: total.impressions,
      totalClicks: total.clicks,
      totalConversions: total.conversions,
      avgCTR: parseFloat(avgCTR.toFixed(2)),
      avgCPC: parseFloat(avgCPC.toFixed(2)),
      avgROAS: parseFloat(avgROAS.toFixed(2)),
      daysActive: metrics.length,
    };
  }

  /**
   * Calcula variação percentual entre dois períodos
   */
  private calculateVariation(current: number, previous: number): number {
    if (previous === 0) return 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  }

  /**
   * Build análise prompt avançada
   */
  private buildAdvancedPrompt(
    request: OpenAIInsightRequest,
    currentSummary: MetricsSummary,
    previousSummary: MetricsSummary | null
  ): string {
    let prompt = `
CAMPANHA: ${request.campaign_name}
PLATAFORMA: ${request.platform.toUpperCase()}
PERÍODO: Últimos ${currentSummary.daysActive} dias

=== MÉTRICAS ATUAIS ===
Gasto Total: R$ ${currentSummary.totalSpend.toFixed(2)}
Impressões: ${currentSummary.totalImpressions.toLocaleString()}
Cliques: ${currentSummary.totalClicks.toLocaleString()}
CTR (Click-Through Rate): ${currentSummary.avgCTR.toFixed(2)}%
CPC (Custo por Clique): R$ ${currentSummary.avgCPC.toFixed(2)}
Conversões: ${currentSummary.totalConversions}
ROAS Estimado: ${currentSummary.avgROAS.toFixed(2)}x`;

    if (previousSummary) {
      const spendVar = this.calculateVariation(currentSummary.totalSpend, previousSummary.totalSpend);
      const ctrVar = this.calculateVariation(currentSummary.avgCTR, previousSummary.avgCTR);
      const convVar = this.calculateVariation(currentSummary.totalConversions, previousSummary.totalConversions);

      prompt += `

=== COMPARAÇÃO COM PERÍODO ANTERIOR ===
Gasto: ${spendVar > 0 ? '+' : ''}${spendVar}%
CTR: ${ctrVar > 0 ? '+' : ''}${ctrVar}%
Conversões: ${convVar > 0 ? '+' : ''}${convVar}%`;
    }

    prompt += `

=== TAREFA ===
Analise esta campanha e gere de 3 a 5 insights estruturados. Para cada insight, forneça:
1. Um título claro e direto
2. Uma descrição detalhada do problema/oportunidade
3. Uma ação recomendada específica e implementável
4. Um score de confiança (0-100) baseado nos dados

IMPORTANTE: Forneça APENAS um objeto JSON válido, sem texto adicional.

Exemplo de formato esperado:
{
  "insights": [
    {
      "title": "CTR Abaixo da Média",
      "description": "O CTR de 2.1% está abaixo da média do mercado (3-5% para ${request.platform}). Isso indica que o anúncio não está atraindo suficientemente o público-alvo.",
      "recommended_action": "1. Teste novo copy focado em pain points do público. 2. Experimente diferentes variações de imagem/vídeo. 3. Refine o targeting para melhorar relevância.",
      "confidence": 85
    }
  ]
}

Considere ao analisar:
- Benchmarks de mercado (CTR típico: 1-3%, CPC varia por setor)
- Padrões de performance ao longo do período
- Oportunidades de otimização específicas para ${request.platform}
- Problemas que estão impactando o ROI negativamente`;

    return prompt;
  }

  /**
   * Parse OpenAI response into insights
   */
  private parseInsights(content: string, campaignName: string): CampaignInsight[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('No JSON found in response:', content);
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const insights = parsed.insights || [];

      if (!Array.isArray(insights) || insights.length === 0) {
        throw new Error('Invalid insights array in response');
      }

      return insights.map((insight: any) => ({
        insight_type: this.categorizeInsight(insight.title),
        title: insight.title || 'Análise',
        description: insight.description || '',
        recommended_action: insight.recommended_action || '',
        confidence: Math.min(100, Math.max(0, insight.confidence || 75)),
        data: {
          campaign_name: campaignName,
          generated_at: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error parsing insights:', error);
      // Return a default insight if parsing fails
      return [
        {
          insight_type: 'performance',
          title: 'Análise Concluída',
          description: 'A análise foi processada pela IA. Se os dados estiverem incompletos, sincronize novamente.',
          recommended_action: 'Verifique se os dados das campanhas foram sincronizados corretamente.',
          confidence: 60,
          data: {
            campaign_name: campaignName,
            error: String(error),
          },
        },
      ];
    }
  }

  /**
   * Categorize insight based on title keywords
   */
  private categorizeInsight(title: string): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('ctr') || titleLower.includes('clique') || titleLower.includes('engajamento')) {
      return 'engagement';
    }
    if (titleLower.includes('cpc') || titleLower.includes('custo') || titleLower.includes('orçamento')) {
      return 'cost_efficiency';
    }
    if (titleLower.includes('conversão') || titleLower.includes('roi') || titleLower.includes('roas')) {
      return 'conversion';
    }
    if (titleLower.includes('público') || titleLower.includes('segmentação') || titleLower.includes('targeting')) {
      return 'audience';
    }
    if (titleLower.includes('trend') || titleLower.includes('padrão') || titleLower.includes('comportamento')) {
      return 'trend';
    }
    return 'performance';
  }
}
