import { useEffect, useState } from 'react'
import { IndicatorForm } from '../components/IndicatorForm'
import { IndicatorTable } from '../components/IndicatorTable'
import {
  createThreatIndicator,
  deleteThreatIndicator,
  getThreatIndicators,
  searchThreatIndicators,
  type IndicatorPayload,
  type IndicatorRow,
  updateThreatIndicator,
} from '../services/indicatorService'

export function HomePage() {
  const [rows, setRows] = useState<IndicatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editing, setEditing] = useState<IndicatorRow | null>(null)

  const loadData = async (query?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data =
        query && query.trim().length > 0
          ? await searchThreatIndicators(query.trim())
          : await getThreatIndicators()
      setRows(data)
    } catch {
      setError('Unable to load indicators right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      // loadData handles local error state; this catch avoids unhandled warnings.
    })
  }, [])

  const handleSubmit = async (payload: IndicatorPayload, id?: number) => {
    if (id) {
      await updateThreatIndicator(id, payload)
      setEditing(null)
    } else {
      await createThreatIndicator(payload)
    }
    await loadData(searchQuery)
  }

  const handleDelete = async (row: IndicatorRow) => {
    await deleteThreatIndicator(row.id)
    if (editing?.id === row.id) {
      setEditing(null)
    }
    await loadData(searchQuery)
  }

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    await loadData(searchQuery)
  }

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

      <IndicatorForm
        editing={editing}
        onCancelEdit={() => setEditing(null)}
        onSubmit={handleSubmit}
      />

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by value, title, description, source..."
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Search
        </button>
      </form>

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
        <IndicatorTable rows={rows} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  )
}
