import { useMemo, useState, type ReactNode } from 'react'
import { setAuthToken } from '../services/api'
import { AuthContext, type AuthContextValue } from './AuthContextStore'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem(USER_KEY),
  )

  const login = async (nextUsername: string, password: string) => {
    if (!nextUsername.trim() || !password.trim()) {
      throw new Error('Username and password are required')
    }
    const fakeToken = `demo-token-${Date.now()}`
    localStorage.setItem(TOKEN_KEY, fakeToken)
    localStorage.setItem(USER_KEY, nextUsername.trim())
    setAuthToken(fakeToken)
    setToken(fakeToken)
    setUsername(nextUsername.trim())
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    setToken(null)
    setUsername(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      username,
      login,
      logout,
    }),
    [token, username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
