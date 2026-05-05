import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getThreatIndicatorsPaged, type IndicatorRow } from '../services/indicatorService'

type PeriodOption = '7d' | '30d' | '90d'
const ANALYTICS_REFERENCE_NOW = Date.now()

export function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodOption>('30d')
  const [rows, setRows] = useState<IndicatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getThreatIndicatorsPaged(0, 1000)
        setRows(response.content)
      } catch {
        setError('Unable to load analytics data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const cutoff = ANALYTICS_REFERENCE_NOW - days * 24 * 60 * 60 * 1000
    return rows.filter((row) => {
      if (!row.lastSeenAt) return false
      const timestamp = new Date(row.lastSeenAt).getTime()
      return Number.isFinite(timestamp) && timestamp >= cutoff
    })
  }, [period, rows])

  const severityData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of filtered) {
      counts.set(row.severity, (counts.get(row.severity) ?? 0) + 1)
    }
    return Array.from(counts.entries()).map(([severity, count]) => ({ severity, count }))
  }, [filtered])

  const statusData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of filtered) {
      counts.set(row.status, (counts.get(row.status) ?? 0) + 1)
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
  }, [filtered])

  const confidenceByType = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>()
    for (const row of filtered) {
      if (row.confidence == null) continue
      const current = grouped.get(row.indicatorType) ?? { total: 0, count: 0 }
      current.total += row.confidence
      current.count += 1
      grouped.set(row.indicatorType, current)
    }
    return Array.from(grouped.entries()).map(([indicatorType, stats]) => ({
      indicatorType,
      avgConfidence: Number((stats.total / stats.count).toFixed(1)),
    }))
  }, [filtered])

  if (loading) {
    return <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">Loading analytics...</div>
  }
  if (error) {
    return <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-200">{error}</div>
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Analytics</h1>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodOption)}
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Link
            to="/"
            className="rounded border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
          >
            Back to List
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Indicators In Period</p>
          <p className="mt-2 text-2xl font-semibold text-white">{filtered.length}</p>
        </article>
        <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Unique Severities</p>
          <p className="mt-2 text-2xl font-semibold text-white">{severityData.length}</p>
        </article>
        <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Statuses Seen</p>
          <p className="mt-2 text-2xl font-semibold text-white">{statusData.length}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="mb-3 text-lg font-medium text-slate-100">Severity Distribution</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="severity" stroke="#cbd5e1" />
                <YAxis allowDecimals={false} stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="mb-3 text-lg font-medium text-slate-100">Status Mix</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} fill="#22d3ee" label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="mb-3 text-lg font-medium text-slate-100">Average Confidence by Indicator Type</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="indicatorType" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avgConfidence" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
