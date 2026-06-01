import { useState } from 'react'
import { supabase } from '@/services/supabase-service'
import { MetaAdsService } from '@/services/meta-ads-service'
import { GoogleAdsService } from '@/services/google-ads-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface Integration {
  id: string
  platform: 'meta' | 'google'
  platform_account_name: string
  status: string
  last_sync: string | null
}

interface IntegrationConnectProps {
  onConnected?: () => void
}

export default function IntegrationConnect({ onConnected }: IntegrationConnectProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMetaForm, setShowMetaForm] = useState(false)
  const [showGoogleForm, setShowGoogleForm] = useState(false)
  const [metaToken, setMetaToken] = useState('')
  const [googleToken, setGoogleToken] = useState('')
  const [googleCustomerId, setGoogleCustomerId] = useState('')

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)

      setIntegrations(data || [])
    } catch (err) {
      console.error('Error loading integrations:', err)
    }
  }

  const connectMeta = async () => {
    setLoading(true)
    setError('')

    try {
      const metaService = new MetaAdsService(metaToken)
      const validation = await metaService.validateToken()

      if (!validation.success) {
        setError('Token Meta inválido')
        return
      }

      const accounts = await metaService.getAdAccounts()
      if (!accounts.success || !accounts.data || accounts.data.length === 0) {
        setError('Nenhuma conta Meta encontrada')
        return
      }

      const account = accounts.data[0]
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      await supabase.from('integrations').insert({
        user_id: user.id,
        platform: 'meta',
        platform_account_id: account.id,
        platform_account_name: account.name || 'Meta Account',
        access_token: metaToken,
        status: 'active',
        last_sync: new Date().toISOString(),
      })

      setMetaToken('')
      setShowMetaForm(false)
      await loadIntegrations()
      onConnected?.()
    } catch (err) {
      setError('Erro ao conectar Meta: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  const connectGoogle = async () => {
    setLoading(true)
    setError('')

    try {
      const googleService = new GoogleAdsService(googleToken, googleCustomerId)
      const validation = await googleService.validateToken()

      if (!validation.success) {
        setError('Token Google inválido')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      await supabase.from('integrations').insert({
        user_id: user.id,
        platform: 'google',
        platform_account_id: googleCustomerId,
        platform_account_name: 'Google Ads Account',
        access_token: googleToken,
        status: 'active',
        last_sync: new Date().toISOString(),
      })

      setGoogleToken('')
      setGoogleCustomerId('')
      setShowGoogleForm(false)
      await loadIntegrations()
      onConnected?.()
    } catch (err) {
      setError('Erro ao conectar Google: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrações Conectadas</CardTitle>
          <CardDescription>
            Suas contas de Meta Ads e Google Ads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations.length > 0 ? (
            <div className="space-y-3">
              {integrations.map(integration => (
                <div key={integration.id} className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        {integration.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
                      </p>
                      <p className="text-sm text-gray-600">{integration.platform_account_name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {integration.last_sync ? new Date(integration.last_sync).toLocaleDateString() : 'Nunca'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhuma integração conectada</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conectar Nova Integração</CardTitle>
          <CardDescription>
            Adicione suas contas de Meta Ads ou Google Ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Meta Ads Form */}
          {!showMetaForm ? (
            <button
              onClick={() => setShowMetaForm(true)}
              className="w-full px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              + Conectar Meta Ads
            </button>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Token de Acesso Meta</label>
                <input
                  type="password"
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  placeholder="Cole seu access token do Meta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha em: Meta App &gt; Marketing API &gt; Tools
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={connectMeta}
                  disabled={loading || !metaToken}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Conectar
                </button>
                <button
                  onClick={() => setShowMetaForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Google Ads Form */}
          {!showGoogleForm ? (
            <button
              onClick={() => setShowGoogleForm(true)}
              className="w-full px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              + Conectar Google Ads
            </button>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Token de Acesso Google</label>
                <input
                  type="password"
                  value={googleToken}
                  onChange={(e) => setGoogleToken(e.target.value)}
                  placeholder="Cole seu access token do Google"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha em: Google Cloud Console &gt; OAuth 2.0
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer ID</label>
                <input
                  type="text"
                  value={googleCustomerId}
                  onChange={(e) => setGoogleCustomerId(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID da sua conta Google Ads (sem hífen)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={connectGoogle}
                  disabled={loading || !googleToken || !googleCustomerId}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Conectar
                </button>
                <button
                  onClick={() => setShowGoogleForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
