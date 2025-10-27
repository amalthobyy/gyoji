import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

interface AuthContextValue {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: any | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('access'))
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refresh'))
  const [user, setUser] = useState<any | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const isAuthenticated = !!accessToken

  useEffect(() => {
    if (accessToken) localStorage.setItem('access', accessToken); else localStorage.removeItem('access')
  }, [accessToken])
  useEffect(() => {
    if (refreshToken) localStorage.setItem('refresh', refreshToken); else localStorage.removeItem('refresh')
  }, [refreshToken])
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
  }, [user])

  async function login(username: string, password: string) {
    const { data } = await api.post('/auth/login/', { username, password })
    setAccessToken(data.access)
    setRefreshToken(data.refresh)
    setUser(data.user)
  }

  async function logout() {
    try {
      if (refreshToken) await api.post('/auth/logout/', { refresh: refreshToken })
    } finally {
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
    }
  }

  const value = useMemo(() => ({ isAuthenticated, accessToken, refreshToken, user, login, logout }), [isAuthenticated, accessToken, refreshToken, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
