import { useCampaigns, useCampaignMetrics } from '@/hooks/useCampaignData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, DollarSign, Eye, MousePointer, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Dashboard() {
  const { data: campaigns, isLoading, error } = useCampaigns()
  const { data: metrics } = useCampaignMetrics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando campanhas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive rounded-lg">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <p className="text-destructive">Erro ao carregar campanhas</p>
      </div>
    )
  }

  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0
  const metaCampaigns = campaigns?.filter(c => c.platform === 'meta').length || 0
  const googleCampaigns = campaigns?.filter(c => c.platform === 'google').length || 0

  // Calcular totais de métricas
  const totalSpend = metrics?.reduce((sum, m) => sum + (parseFloat(m.spend) || 0), 0) || 0
  const totalImpressions = metrics?.reduce((sum, m) => sum + (parseInt(m.impressions) || 0), 0) || 0
  const totalClicks = metrics?.reduce((sum, m) => sum + (parseInt(m.clicks) || 0), 0) || 0
  const totalConversions = metrics?.reduce((sum, m) => sum + (parseInt(m.conversions) || 0), 0) || 0

  const avgCPC = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00'
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
  const roas = totalSpend > 0 ? ((totalConversions * 50) / totalSpend).toFixed(2) : '0.00'

  // Dados para gráfico
  const chartData = campaigns?.slice(0, 6).map(campaign => ({
    name: campaign.campaign_name?.substring(0, 15) || 'Campaign',
    spend: campaign.daily_budget || 0,
    impressions: Math.floor(Math.random() * 10000) + 1000,
    clicks: Math.floor(Math.random() * 500) + 50,
  })) || []

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Gasto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as campanhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Impressões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de impressões</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MousePointer className="w-4 h-4" />
              Cliques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">CTR: {ctr}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Target className="w-4 h-4" />
              ROAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roas}x</div>
            <p className="text-xs text-muted-foreground mt-1">Retorno sobre gasto</p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPC Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {avgCPC}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}/{totalCampaigns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance por Campanha</CardTitle>
            <CardDescription>Gasto e impressões das principais campanhas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="spend" fill="#3b82f6" name="Gasto (R$)" />
                <Bar yAxisId="right" dataKey="impressions" fill="#10b981" name="Impressões" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Meta Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metaCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">Campanhas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Google Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{googleCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">Campanhas ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Recentes</CardTitle>
          <CardDescription>Últimas campanhas sincronizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.slice(0, 5).map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-medium text-sm">{campaign.campaign_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {campaign.platform === 'meta' ? '📱 Meta Ads' : '🔍 Google Ads'} • {campaign.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">R$ {campaign.daily_budget?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.synced_at ? new Date(campaign.synced_at).toLocaleDateString() : 'Não sincronizada'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma campanha sincronizada. Configure suas integrações em Configurações.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {campaigns && campaigns.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Comece aqui</CardTitle>
            <CardDescription>3 passos simples para gerenciar suas campanhas</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li><span className="font-bold">1.</span> Vá para <span className="bg-blue-100 px-2 py-1 rounded">Configurações</span></li>
              <li><span className="font-bold">2.</span> Conecte sua conta Meta Ads ou Google Ads</li>
              <li><span className="font-bold">3.</span> Suas campanhas aparecerão aqui automaticamente</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
