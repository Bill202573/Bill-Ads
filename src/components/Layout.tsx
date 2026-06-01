import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Settings, Home } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground">Ads Manager</h1>
          <p className="text-sm text-muted-foreground">Gestão de Campanhas</p>
        </div>

        <nav className="space-y-2 px-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive('/')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            to="/campaigns"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive('/campaigns')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Campanhas
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configurações
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/campaigns' && 'Campanhas'}
              {location.pathname === '/settings' && 'Configurações'}
            </h2>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
