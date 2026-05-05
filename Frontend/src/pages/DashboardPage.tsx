import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getIndicatorStats, type IndicatorStats } from '../services/indicatorService'

export function DashboardPage() {
  const [stats, setStats] = useState<IndicatorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getIndicatorStats()
        setStats(data)
      } catch {
        setError('Unable to load dashboard stats.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">Loading stats...</div>
  }
  if (error) {
    return <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-200">{error}</div>
  }
  if (!stats) return null

  const cards = [
    { label: 'Total Indicators', value: stats.totalIndicators },
    { label: 'Active Indicators', value: stats.activeIndicators },
    { label: 'High/Critical', value: stats.highSeverityIndicators },
    { label: 'Avg Confidence', value: stats.averageConfidence.toFixed(1) },
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Dashboard</h1>
        <Link
          to="/"
          className="rounded border border-slate-600 px-3 py-1 text-sm hover:bg-slate-800"
        >
          Back to List
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="mb-4 text-lg font-medium text-slate-100">Severity Breakdown</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.severityBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="severity" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
