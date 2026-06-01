import { useState, useMemo } from 'react'
import { useCampaigns } from '@/hooks/useCampaignData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Loader2, Search } from 'lucide-react'
import { SyncService } from '@/services/sync-service'

export default function Campaigns() {
  const { data: campaigns, isLoading, error, refetch } = useCampaigns()
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [syncSuccess, setSyncSuccess] = useState('')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'meta' | 'google'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'archived'>('all')

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

  // Filtrar campanhas
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return []

    return campaigns.filter(campaign => {
      // Filtro de plataforma
      if (filterPlatform !== 'all' && campaign.platform !== filterPlatform) {
        return false
      }

      // Filtro de status
      if (filterStatus !== 'all' && campaign.status !== filterStatus) {
        return false
      }

      // Filtro de busca
      if (searchTerm && !campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      return true
    })
  }, [campaigns, filterPlatform, filterStatus, searchTerm])

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

        {/* Filtros */}
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome da campanha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro de Plataforma */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value as any)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as plataformas</option>
              <option value="meta">Meta Ads</option>
              <option value="google">Google Ads</option>
            </select>

            {/* Filtro de Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="archived">Arquivada</option>
            </select>
          </div>

          {/* Resultado dos filtros */}
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium">{filteredCampaigns.length}</span> de <span className="font-medium">{campaigns?.length || 0}</span> campanhas
          </p>

          {/* Tabela */}
          {filteredCampaigns && filteredCampaigns.length > 0 ? (
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
                  {filteredCampaigns.map(campaign => (
                    <tr key={campaign.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{campaign.campaign_name}</td>
                      <td className="py-3 px-4 capitalize">
                        {campaign.platform === 'meta' ? '📱 Meta Ads' : '🔍 Google Ads'}
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
                        {campaign.daily_budget ? `R$ ${campaign.daily_budget.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {campaign.synced_at ? new Date(campaign.synced_at).toLocaleDateString('pt-BR') : 'Nunca'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              {campaigns && campaigns.length > 0
                ? 'Nenhuma campanha encontrada com os filtros selecionados.'
                : 'Nenhuma campanha sincronizada. Configure suas integrações em Configurações.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
