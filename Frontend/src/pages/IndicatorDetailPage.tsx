import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteThreatIndicator,
  getThreatIndicatorById,
  type IndicatorRow,
} from '../services/indicatorService'

function getScore(indicator: IndicatorRow): number {
  const confidence = indicator.confidence ?? 0
  const severityWeight: Record<string, number> = {
    LOW: 10,
    MEDIUM: 25,
    HIGH: 40,
    CRITICAL: 55,
  }
  return Math.min(100, confidence + (severityWeight[indicator.severity] ?? 0))
}

function scoreClass(score: number) {
  if (score >= 80) return 'bg-red-900/40 text-red-200 border-red-800'
  if (score >= 50) return 'bg-amber-900/40 text-amber-200 border-amber-800'
  return 'bg-emerald-900/40 text-emerald-200 border-emerald-800'
}

export function IndicatorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [indicator, setIndicator] = useState<IndicatorRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!id) throw new Error('Missing indicator id')
        const data = await getThreatIndicatorById(Number(id))
        setIndicator(data)
      } catch {
        setError('Unable to load indicator details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!indicator) return
    await deleteThreatIndicator(indicator.id)
    navigate('/')
  }

  if (loading) return <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">Loading details...</div>
  if (error || !indicator) {
    return <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-200">{error ?? 'Indicator not found.'}</div>
  }

  const score = getScore(indicator)

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Indicator Detail</h1>
        <Link to="/" className="rounded border border-slate-600 px-3 py-1 text-sm hover:bg-slate-800">
          Back to List
        </Link>
      </header>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-100">#{indicator.id}</h2>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreClass(score)}`}>
            Score {score}
          </span>
        </div>
        <dl className="grid gap-2 text-sm text-slate-200">
          <div><dt className="text-slate-400">Type</dt><dd>{indicator.indicatorType}</dd></div>
          <div><dt className="text-slate-400">Value</dt><dd className="break-all">{indicator.indicatorValue}</dd></div>
          <div><dt className="text-slate-400">Status</dt><dd>{indicator.status}</dd></div>
          <div><dt className="text-slate-400">Severity</dt><dd>{indicator.severity}</dd></div>
          <div><dt className="text-slate-400">Confidence</dt><dd>{indicator.confidence ?? '-'}</dd></div>
          <div><dt className="text-slate-400">Description</dt><dd>{indicator.description ?? '-'}</dd></div>
        </dl>

        <div className="mt-5 flex gap-2">
          <Link
            to={`/?edit=${indicator.id}`}
            className="rounded border border-slate-600 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-red-900 px-3 py-1 text-sm text-red-200 hover:bg-red-950/40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
