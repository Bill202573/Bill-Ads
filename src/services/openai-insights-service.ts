import { DailyMetrics, CampaignInsight } from '@/types/ads';

interface OpenAIInsightRequest {
  campaign_name: string;
  platform: string;
  metrics: DailyMetrics[];
  previous_period_metrics?: DailyMetrics[];
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

    const metrics = request.metrics[request.metrics.length - 1];
    if (!metrics) {
      throw new Error('No metrics available for analysis');
    }

    const prompt = this.buildPrompt(request, metrics);

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
              content: 'You are an expert digital marketing analyst specializing in Meta Ads and Google Ads campaigns. Provide concise, actionable insights in Portuguese.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
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
   * Build analysis prompt
   */
  private buildPrompt(request: OpenAIInsightRequest, metrics: DailyMetrics): string {
    return `
Analyze this ${request.platform} ad campaign and provide 3-5 actionable insights.

Campaign: ${request.campaign_name}
Platform: ${request.platform}

Current Metrics:
- Impressions: ${metrics.impressions}
- Clicks: ${metrics.clicks}
- Spend: $${metrics.spend}
- CTR: ${metrics.ctr}%
- CPC: $${metrics.cpc}
- Conversions: ${metrics.conversions}

Please provide insights in this JSON format:
{
  "insights": [
    {
      "title": "Insight Title",
      "description": "Detailed description",
      "recommended_action": "What to do about it",
      "confidence": 85
    }
  ]
}

Focus on:
1. Performance trends
2. Cost efficiency
3. Conversion optimization
4. Budget allocation
5. Audience targeting improvements
`;
  }

  /**
   * Parse OpenAI response into insights
   */
  private parseInsights(content: string, campaignName: string): CampaignInsight[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const insights = parsed.insights || [];

      return insights.map((insight: any) => ({
        insight_type: 'performance',
        title: insight.title || 'Analysis',
        description: insight.description || '',
        recommended_action: insight.recommended_action || '',
        confidence: insight.confidence || 75,
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
          title: 'Analysis in Progress',
          description: 'Campaign analysis is being processed',
          recommended_action: 'Check back soon for detailed insights',
          confidence: 50,
          data: {
            campaign_name: campaignName,
            error: String(error),
          },
        },
      ];
    }
  }
}
