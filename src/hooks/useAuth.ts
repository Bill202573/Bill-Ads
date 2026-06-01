import { useState, useEffect } from 'react'
import { supabase } from '@/services/supabase-service'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {
        setError('Erro ao verificar autenticação')
        console.error('Auth error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      setError('Erro ao fazer logout')
      console.error('Logout error:', err)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
  }
}
