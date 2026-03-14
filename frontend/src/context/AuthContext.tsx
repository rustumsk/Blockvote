import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi, type User } from '../api/client'
import { clearPendingWallet, getPendingWallet } from '../utils/wallet'

const TOKEN_KEY = 'blockvote_token'
const USER_KEY = 'blockvote_user'

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(!!token)

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUserState(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { token: t, user: u } = await authApi.login({ email, password })
    setToken(t)
    setUser(u)
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    let finalUser = u
    const pendingWallet = getPendingWallet()
    if (pendingWallet) {
      try {
        const updated = await authApi.updateWallet(pendingWallet)
        setUser(updated)
        localStorage.setItem(USER_KEY, JSON.stringify(updated))
        finalUser = updated
      } catch (_) {
        // ignore if backend rejects (e.g. duplicate wallet)
      }
      clearPendingWallet()
    }
    return finalUser
  }, [])

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string }) => {
    await authApi.register(data)
  }, [])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((u) => {
        setUser(u)
      })
      .catch(() => {
        logout()
      })
      .finally(() => setLoading(false))
  }, [token, logout])

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
