import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative mx-auto flex min-h-[78vh] w-full max-w-5xl items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-700/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-sky-600/20 blur-3xl" />

      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950/45 shadow-[0_30px_120px_-45px_rgba(17,24,39,0.95)] backdrop-blur md:grid-cols-2">
        <section className="hidden flex-col justify-between border-r border-slate-800/90 bg-gradient-to-br from-violet-700/20 via-slate-950 to-slate-900 p-8 md:flex">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-violet-500/40 bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200">
              Secure Portal
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white">
              Threat Intelligence Platform
            </h1>
            <p className="text-sm leading-6 text-slate-300">
              Analyze indicators quickly, monitor risks in real time, and keep your response
              workflow reliable.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4">
            <p className="text-sm text-slate-300">
              Team access is protected with authenticated sessions and encrypted API traffic.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
              Welcome back
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Sign in to continue</h2>
            <p className="text-sm text-slate-300">
              Enter your account details to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-200">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter username"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 outline-none ring-violet-400/30 placeholder:text-slate-500 focus:border-violet-600 focus:ring-4"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-200">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 py-2.5 pl-3 pr-10 outline-none ring-violet-400/30 placeholder:text-slate-500 focus:border-violet-600 focus:ring-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M10.733 5.076A10.744 10.744 0 0 1 12 5c7 0 10 7 10 7a18.39 18.39 0 0 1-3.233 4.349" />
                      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                      <path d="M17.479 17.499A10.75 10.75 0 0 1 12 19c-7 0-10-7-10-7a18.396 18.396 0 0 1 4.273-5.176" />
                      <path d="M2 2l20 20" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.423 8.046 6.92 5 12 5c5.079 0 8.577 3.046 9.938 6.652a1 1 0 0 1 0 .696C20.577 15.954 17.08 19 12 19c-5.079 0-8.577-3.046-9.938-6.652Z" />
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
            {error ? (
              <div className="rounded-lg border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full rounded-lg border border-violet-700/70 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-[0_12px_30px_-16px_rgba(124,58,237,0.8)] transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
