import React, { createContext, useState, useEffect } from 'react'

interface AuthContextType {
  user: any | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ requiresProfileSetup?: boolean }>
  signup: (email: string) => Promise<{ debugOtp?: string }>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      setUser({ authenticated: true })
    }
    setLoading(false)
  }, [])

  const saveToken = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const clearAuth = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        saveToken(data.data.token)
        setUser({ email, authenticated: true })
        return { requiresProfileSetup: data.data.requiresProfileSetup }
      }
      throw new Error(data.error)
    } catch (error) {
      throw error
    }
  }

  const signup = async (email: string) => {
    try {
      const response = await fetch('/api/auth/signup/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data as { debugOtp?: string }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        })
      }
    } finally {
      clearAuth()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
