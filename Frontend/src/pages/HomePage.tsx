import { useEffect, useState } from 'react'
import { IndicatorTable } from '../components/IndicatorTable'
import {
  getThreatIndicators,
  type IndicatorRow,
} from '../services/indicatorService'

export function HomePage() {
  const [rows, setRows] = useState<IndicatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        const data = await getThreatIndicators()
        if (!active) return
        setRows(data)
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
        <IndicatorTable rows={rows} />
      )}
    </div>
  )
}
