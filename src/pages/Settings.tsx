import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Info, LogOut } from 'lucide-react'
import IntegrationConnect from '@/components/auth/IntegrationConnect'
import { useAuth } from '@/hooks/useAuth'

export default function Settings() {
  const { logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <IntegrationConnect />

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da API</CardTitle>
          <CardDescription>Informações sobre as variáveis de ambiente necessárias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Variáveis de Ambiente</p>
                <p className="text-muted-foreground">
                  Certifique-se de que todas as variáveis de ambiente estão configuradas no arquivo .env.local
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">Variáveis Necessárias:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>REACT_APP_SUPABASE_URL</li>
              <li>REACT_APP_SUPABASE_ANON_KEY</li>
              <li>REACT_APP_CLAUDE_API_KEY</li>
              <li>REACT_APP_META_APP_ID</li>
              <li>REACT_APP_GOOGLE_ADS_DEVELOPER_TOKEN</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Gerenciar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Fazer Logout
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Tem certeza que deseja fazer logout?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
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
