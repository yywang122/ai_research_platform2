import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi, me as meApi, register as registerApi } from '../services/authService'

const TOKEN_KEY = 'airp_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }
    setLoading(true)
    meApi(token)
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken('')
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const register = async (payload) => {
    const res = await registerApi(payload)
    return res.data
  }

  const login = async (payload) => {
    const res = await loginApi(payload)
    setToken(res.data.access_token)
    localStorage.setItem(TOKEN_KEY, res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      register,
      login,
      logout,
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

