import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { UserProfile } from '../services/user'

interface AuthContextValue {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: any | null
  login: (username: string, password: string) => Promise<UserProfile>
  loginWithGoogle: (idToken: string) => Promise<UserProfile>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
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

  useEffect(() => {
    function handleTokenEvent(event: Event) {
      const detail = (event as CustomEvent<{ access?: string; refresh?: string }>).detail
      if (detail?.access) {
        setAccessToken(detail.access)
      }
      if (detail?.refresh) {
        setRefreshToken(detail.refresh)
      }
    }
    window.addEventListener('auth:token', handleTokenEvent)
    return () => window.removeEventListener('auth:token', handleTokenEvent)
  }, [])

  const applySession = (data: { access: string; refresh: string; user: UserProfile }) => {
    setAccessToken(data.access)
    setRefreshToken(data.refresh)
    setUser(data.user)
    return data.user
  }

  async function login(username: string, password: string) {
    const { data } = await api.post('/auth/login/', { username, password })
    return applySession(data)
  }

  async function loginWithGoogle(idToken: string) {
    const { data } = await api.post('/auth/google/', { id_token: idToken })
    return applySession(data)
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

  async function refreshUser() {
    if (!accessToken) return
    const { data } = await api.get('/auth/me/')
    setUser(data)
  }

  const value = useMemo(
    () => ({ isAuthenticated, accessToken, refreshToken, user, login, loginWithGoogle, logout, refreshUser }),
    [isAuthenticated, accessToken, refreshToken, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
