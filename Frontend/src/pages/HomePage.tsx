import { useEffect, useState } from 'react'
import { api } from '../services/api'

type IndicatorRow = {
  id: number
  indicatorType: string
  indicatorValue: string
  status: string
  lastSeenAt: string | null
}

function normalizeResponse(payload: unknown): IndicatorRow[] {
  if (Array.isArray(payload)) {
    return payload as IndicatorRow[]
  }
  if (payload && typeof payload === 'object' && 'content' in payload) {
    const page = payload as { content?: unknown }
    if (Array.isArray(page.content)) {
      return page.content as IndicatorRow[]
    }
  }
  return []
}

export function HomePage() {
  const [rows, setRows] = useState<IndicatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        const response = await api.get('/threat-indicators')
        if (!active) return
        setRows(normalizeResponse(response.data))
      } catch {
        if (!active) return
        setError('Unable to load indicators right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-violet-400">
          Threat Intelligence Platform
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Indicator List
        </h1>
      </header>

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-slate-300">
          Loading indicators...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-200">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-slate-300">
          No indicators found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/60 text-slate-200">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">{row.id}</td>
                  <td className="px-4 py-3">{row.indicatorType}</td>
                  <td className="max-w-[34rem] truncate px-4 py-3">
                    {row.indicatorValue}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{row.lastSeenAt ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
