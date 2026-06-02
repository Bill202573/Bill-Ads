import { useState, useEffect } from 'react'
import { useCampaigns } from '@/hooks/useCampaignData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Zap, TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react'
import { OpenAIInsightsService } from '@/services/openai-insights-service'
import { SupabaseService } from '@/services/supabase-service'

interface CampaignWithAccount {
  campaign: any
  accountName: string
}

interface CampaignAnalysis {
  campaignId: string
  campaignName: string
  accountName: string
  platform: string
  insights: any[]
  score: number
  status: 'analyzing' | 'completed' | 'error'
  error?: string
}

export default function Insights() {
  const { data: campaigns, isLoading } = useCampaigns()
  const [integrations, setIntegrations] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<CampaignAnalysis[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set())

  // Carregar integrações para saber nomes das contas
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const { data: { user } } = await SupabaseService.supabase.auth.getUser()
        if (user) {
          const { data } = await SupabaseService.supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
          setIntegrations(data || [])
        }
      } catch (error) {
        console.error('Error loading integrations:', error)
      }
    }
    loadIntegrations()
  }, [])

  const getAccountName = (platform: string, campaignId: string) => {
    const integration = integrations.find(i => i.platform === platform)
    return integration?.platform_account_name || 'Conta Desconhecida'
  }

  const toggleCampaignSelection = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns)
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId)
    } else {
      newSelected.add(campaignId)
    }
    setSelectedCampaigns(newSelected)
  }

  const toggleSelectAll = () => {
    if (!campaigns) return
    if (selectedCampaigns.size === campaigns.length) {
      setSelectedCampaigns(new Set())
    } else {
      setSelectedCampaigns(new Set(campaigns.map(c => c.id)))
    }
  }

  const analyzeSelectedCampaigns = async () => {
    if (selectedCampaigns.size === 0 || !campaigns) return

    setAnalyzing(true)
    const openaiService = new OpenAIInsightsService()

    const campaignsToAnalyze = campaigns.filter(c => selectedCampaigns.has(c.id))
    const newAnalyses: CampaignAnalysis[] = campaignsToAnalyze.map(campaign => ({
      campaignId: campaign.id,
      campaignName: campaign.campaign_name,
      accountName: getAccountName(campaign.platform, campaign.id),
      platform: campaign.platform,
      insights: [],
      score: 0,
      status: 'analyzing',
    }))

    setAnalyses(newAnalyses)

    // Analisar cada campanha selecionada
    for (let i = 0; i < campaignsToAnalyze.length; i++) {
      const campaign = campaignsToAnalyze[i]
      const analysisIndex = newAnalyses.findIndex(a => a.campaignId === campaign.id)

      try {
        // Buscar métricas da campanha
        const metrics = await SupabaseService.getCampaignMetrics(campaign.id)

        if (metrics.length === 0) {
          newAnalyses[analysisIndex].status = 'completed'
          newAnalyses[analysisIndex].insights = [
            {
              title: 'Sem dados ainda',
              description: 'Esta campanha ainda não possui métricas registradas.',
              recommended_action: 'Aguarde a sincronização de dados',
              confidence: 0,
            },
          ]
          newAnalyses[analysisIndex].score = 50
          setAnalyses([...newAnalyses])
          continue
        }

        // Analisar com OpenAI
        const insights = await openaiService.analyzePerformance({
          campaign_name: campaign.campaign_name,
          platform: campaign.platform,
          metrics: metrics,
        })

        // Salvar insights no banco
        for (const insight of insights) {
          await SupabaseService.saveInsight(campaign.id, insight)
        }

        // Calcular score (0-100)
        const avgConfidence = insights.reduce((sum, i) => sum + (i.confidence || 0), 0) / insights.length
        const score = Math.round(avgConfidence)

        newAnalyses[analysisIndex].insights = insights
        newAnalyses[analysisIndex].score = score
        newAnalyses[analysisIndex].status = 'completed'
      } catch (error) {
        console.error(`Erro ao analisar ${campaign.campaign_name}:`, error)
        newAnalyses[analysisIndex].status = 'error'
        newAnalyses[analysisIndex].error = String(error)
        newAnalyses[analysisIndex].score = 0
      }

      setAnalyses([...newAnalyses])
    }

    setAnalyzing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando campanhas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Insights & Análises</h1>
        <p className="text-muted-foreground mt-1">IA analisando performance de suas campanhas</p>
      </div>

      {/* Seleção de Campanhas */}
      {!analyzing && campaigns && campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecione Campanhas para Analisar</CardTitle>
            <CardDescription>Escolha quais campanhas deseja analisar com IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selecionar Todas */}
            <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedCampaigns.size === campaigns.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="select-all" className="flex-1 cursor-pointer font-medium">
                Selecionar Todas as Campanhas ({campaigns.length})
              </label>
              <span className="text-sm text-muted-foreground">
                {selectedCampaigns.size} selecionadas
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleCampaignSelection(campaign.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.has(campaign.id)}
                    onChange={() => {}}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{campaign.campaign_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getAccountName(campaign.platform, campaign.id)} • {campaign.platform === 'meta' ? '📱 Meta Ads' : '🔍 Google Ads'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    campaign.status === 'active'
                      ? 'bg-green-500/20 text-green-700'
                      : 'bg-gray-500/20 text-gray-700'
                  }`}>
                    {campaign.status === 'active' ? 'Ativa' : campaign.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão Analisar */}
            <button
              onClick={analyzeSelectedCampaigns}
              disabled={selectedCampaigns.size === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 font-medium"
            >
              {selectedCampaigns.size === 0 ? (
                <>Selecione campanhas para analisar</>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Analisar {selectedCampaigns.size} Campanha{selectedCampaigns.size > 1 ? 's' : ''}
                </>
              )}
            </button>
          </CardContent>
        </Card>
      )}

      {analyzing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-sm text-blue-700 font-medium">Analisando {selectedCampaigns.size} campanha(s) com IA...</p>
          </CardContent>
        </Card>
      )}

      {/* Resumo geral */}
      {analyses.length > 0 && !analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Campanhas Analisadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analyses.filter(a => a.status === 'completed').length}/{analyses.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Score Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(
                  analyses.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.score, 0) /
                    Math.max(1, analyses.filter(a => a.status === 'completed').length)
                )}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {analyses.reduce((sum, a) => sum + (a.insights.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de campanhas com insights */}
      <div className="space-y-4">
        {analyses.map(analysis => (
          <Card key={analysis.campaignId} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">{analysis.campaignName}</CardTitle>
                    <CardDescription>
                      {analysis.accountName} • {analysis.platform === 'meta' ? '📱 Meta Ads' : '🔍 Google Ads'}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{analysis.score}%</div>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
                <div className="text-right">
                  {analysis.status === 'analyzing' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analisando...</span>
                    </div>
                  )}
                  {analysis.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      <span className="text-sm">Análise concluída</span>
                    </div>
                  )}
                  {analysis.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Erro na análise</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            {analysis.insights.length > 0 && (
              <CardContent className="space-y-4">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        {insight.confidence > 75 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : insight.confidence > 50 ? (
                          <Target className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        {insight.title}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {Math.round(insight.confidence)}% confiança
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">{insight.description}</p>

                    {insight.recommended_action && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        <p className="font-medium text-blue-900">💡 Ação recomendada:</p>
                        <p className="text-blue-800 mt-1">{insight.recommended_action}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}

            {analysis.error && (
              <CardContent>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Erro: {analysis.error}</p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {analyses.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <Zap className="w-16 h-16 mx-auto text-blue-600 opacity-50" />
                <h3 className="text-lg font-semibold">Comece a Análise</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Clique no botão acima para analisar suas campanhas com inteligência artificial. O sistema vai gerar insights automáticos e recomendações.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
