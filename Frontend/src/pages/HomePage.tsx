import { useEffect, useState } from 'react'
import { IndicatorForm } from '../components/IndicatorForm'
import { IndicatorTable } from '../components/IndicatorTable'
import { useAuth } from '../context/AuthContext'
import {
  createThreatIndicator,
  deleteThreatIndicator,
  getThreatIndicatorsPaged,
  searchThreatIndicators,
  type IndicatorPayload,
  type IndicatorRow,
  updateThreatIndicator,
} from '../services/indicatorService'

export function HomePage() {
  const { username, logout } = useAuth()
  const [rows, setRows] = useState<IndicatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editing, setEditing] = useState<IndicatorRow | null>(null)
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const loadData = async (query?: string, nextPage = page) => {
    try {
      setLoading(true)
      setError(null)
      if (query && query.trim().length > 0) {
        const data = await searchThreatIndicators(query.trim())
        setRows(data)
        setTotalElements(data.length)
        setTotalPages(1)
        setPage(0)
      } else {
        const paged = await getThreatIndicatorsPaged(nextPage, size)
        setRows(paged.content)
        setTotalElements(paged.totalElements)
        setTotalPages(paged.totalPages)
        setPage(paged.page)
      }
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
    await loadData(searchQuery, page)
  }

  const handleDelete = async (row: IndicatorRow) => {
    await deleteThreatIndicator(row.id)
    if (editing?.id === row.id) {
      setEditing(null)
    }
    await loadData(searchQuery, page)
  }

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    await loadData(searchQuery, 0)
  }

  const clearSearch = async () => {
    setSearchQuery('')
    await loadData('', 0)
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return
    await loadData('', nextPage)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-400">
            Threat Intelligence Platform
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span>{username}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
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
          placeholder="Search by value, description, source, type..."
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Search
        </button>
        <button
          type="button"
          onClick={clearSearch}
          className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Clear
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
        <div className="space-y-3">
          <IndicatorTable rows={rows} onEdit={setEditing} onDelete={handleDelete} />
          {searchQuery.trim() === '' ? (
            <div className="flex items-center justify-between text-sm text-slate-300">
              <p>
                Showing page {page + 1} of {Math.max(totalPages, 1)} ({totalElements} total
                records)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => goToPage(page - 1)}
                  className="rounded border border-slate-600 px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="rounded border border-slate-600 px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
