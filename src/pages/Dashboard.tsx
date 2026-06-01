import { useCampaigns } from '@/hooks/useCampaignData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { data: campaigns, isLoading, error } = useCampaigns()

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

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as plataformas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">Em execução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meta Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaigns?.filter(c => c.platform === 'meta').length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Campanhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Google Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaigns?.filter(c => c.platform === 'google').length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Campanhas</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Recentes</CardTitle>
          <CardDescription>Visão geral das últimas campanhas sincronizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.slice(0, 5).map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-medium">{campaign.campaign_name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {campaign.platform === 'meta' ? 'Meta Ads' : 'Google Ads'} • {campaign.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      {campaign.synced_at ? new Date(campaign.synced_at).toLocaleDateString() : 'Não sincronizada'}
                    </span>
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

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
          <CardDescription>Configure suas plataformas de anúncios</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
            <li>Vá para Configurações e conecte sua conta de Meta Ads</li>
            <li>Conecte sua conta do Google Ads</li>
            <li>Suas campanhas aparecerão automaticamente aqui</li>
            <li>Receba insights automáticos sobre performance</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
