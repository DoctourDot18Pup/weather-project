import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/weatherApi'

const AuthContext = createContext(null)

const TOKEN_KEY = 'wdash_token'
const API_BASE  = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://127.0.0.1:8000'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  // Al montar: capturar token de URL (callback OAuth) o leer de localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const error  = params.get('auth_error')

    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      // Limpiar token de la URL sin recargar
      const clean = new URL(window.location.href)
      clean.searchParams.delete('token')
      window.history.replaceState(null, '', clean.toString())
    }

    if (error) {
      const clean = new URL(window.location.href)
      clean.searchParams.delete('auth_error')
      window.history.replaceState(null, '', clean.toString())
      setLoading(false)
      return
    }

    fetchMe()
  }, [fetchMe])

  const login = (provider) => {
    window.location.href = `${API_BASE}/auth/${provider}/redirect`
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch { /* silencioso */ }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { TOKEN_KEY }
