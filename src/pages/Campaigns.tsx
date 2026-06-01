import { useState } from 'react'
import { useCampaigns } from '@/hooks/useCampaignData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { SyncService } from '@/services/sync-service'

export default function Campaigns() {
  const { data: campaigns, isLoading, error, refetch } = useCampaigns()
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [syncSuccess, setSyncSuccess] = useState('')

  const handleSync = async () => {
    setSyncing(true)
    setSyncError('')
    setSyncSuccess('')

    try {
      const result = await SyncService.syncAllCampaigns()
      if (result.success) {
        setSyncSuccess(result.message || 'Campanhas sincronizadas com sucesso!')
        refetch()
      } else {
        setSyncError(result.error || 'Erro ao sincronizar')
      }
    } catch (err) {
      setSyncError(String(err))
    } finally {
      setSyncing(false)
    }
  }

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

  return (
    <div className="space-y-6">
      {syncError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{syncError}</p>
        </div>
      )}

      {syncSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">✅ {syncSuccess}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todas as Campanhas</CardTitle>
              <CardDescription>Gerencie e acompanhe suas campanhas de Meta Ads e Google Ads</CardDescription>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar Campanhas
                </>
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Nome</th>
                    <th className="text-left py-3 px-4 font-medium">Plataforma</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Orçamento</th>
                    <th className="text-left py-3 px-4 font-medium">Última Sincronização</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(campaign => (
                    <tr key={campaign.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{campaign.campaign_name}</td>
                      <td className="py-3 px-4 capitalize">
                        {campaign.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active'
                            ? 'bg-green-500/20 text-green-700'
                            : campaign.status === 'paused'
                            ? 'bg-yellow-500/20 text-yellow-700'
                            : 'bg-gray-500/20 text-gray-700'
                        }`}>
                          {campaign.status === 'active' ? 'Ativa' : campaign.status === 'paused' ? 'Pausada' : campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {campaign.daily_budget ? `$${campaign.daily_budget.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {campaign.synced_at ? new Date(campaign.synced_at).toLocaleDateString() : 'Nunca'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma campanha encontrada. Configure suas integrações em Configurações.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
