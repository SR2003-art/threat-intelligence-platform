import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await login(username, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
      <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/30 p-6 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8">
        <div className="mb-6 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
            Threat Intelligence Platform
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
          <p className="text-sm text-slate-300">Use any username/password (demo auth).</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span className="text-slate-200">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 outline-none ring-violet-400/30 placeholder:text-slate-500 focus:border-violet-600 focus:ring-4"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-200">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 outline-none ring-violet-400/30 placeholder:text-slate-500 focus:border-violet-600 focus:ring-4"
          />
        </label>
        {error ? (
          <div className="rounded-lg border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-violet-700/70 bg-violet-700/70 px-4 py-2 font-medium text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      </div>
    </div>
  )
}
