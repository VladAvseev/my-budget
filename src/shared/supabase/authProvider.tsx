import React, { createContext, useContext, useState, useEffect } from 'react'
import type {ReactNode} from 'react'
import { authService } from './services/auth'
import type { AuthContextType, User, Session } from './types/auth.types'

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { session } = await authService.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp: authService.signUp,
    signIn: authService.signIn,
    signOut: async () => {
      const result = await authService.signOut()
      return result
    },
    getToken: authService.getToken,
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword,
    refreshSession: authService.refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}