import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiClient } from '@/lib/axios'
import { ApiError, setToken } from '@/lib/api'

type AuthUser = {
  id: string
  name: string
  email: string
  role: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('invyte_admin_token')
    if (!token) {
      setLoading(false)
      return
    }

    apiClient
      .get('/auth/me')
      .then(({ data }) => {
        const me = data.data as AuthUser
        if (me.role !== 'admin') {
          setToken(null)
          setUser(null)
          return
        }
        setUser(me)
      })
      .catch(() => {
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', {
      email,
      password,
      device_name: 'invyte-admin',
    })
    const payload = data.data as { user: AuthUser; access_token: string; token: string }
    if (payload.user.role !== 'admin') {
      setToken(null)
      throw new ApiError('This account does not have admin access.', 403)
    }
    setToken(payload.access_token || payload.token)
    setUser(payload.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // ignore
    }
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
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
