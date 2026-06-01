import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import LoginForm from './components/auth/LoginForm'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
