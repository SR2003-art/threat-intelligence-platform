import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AiPanel } from '../components/AiPanel'
import { IndicatorForm } from '../components/IndicatorForm'
import { IndicatorTable } from '../components/IndicatorTable'
import { useAuth } from '../context/useAuth'
import {
  createThreatIndicator,
  deleteThreatIndicator,
  getThreatIndicatorById,
  getThreatIndicatorsPaged,
  type IndicatorPayload,
  type IndicatorRow,
  updateThreatIndicator,
} from '../services/indicatorService'

export function HomePage() {
  const { username, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [rows, setRows] = useState<IndicatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [editing, setEditing] = useState<IndicatorRow | null>(null)
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const loadData = useCallback(
    async (nextPage = page) => {
      try {
        setLoading(true)
        setError(null)
        const paged = await getThreatIndicatorsPaged(nextPage, size, {
          q: debouncedQuery.trim(),
          status: statusFilter,
          fromDate,
          toDate,
        })
        setRows(paged.content)
        setTotalElements(paged.totalElements)
        setTotalPages(paged.totalPages)
        setPage(paged.page)
      } catch {
        setError('Unable to load indicators right now.')
      } finally {
        setLoading(false)
      }
    },
    [debouncedQuery, fromDate, page, size, statusFilter, toDate],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(0).catch(() => {
        // loadData handles local error state; this catch avoids unhandled warnings.
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [loadData])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId) return
    getThreatIndicatorById(Number(editId))
      .then((row) => setEditing(row))
      .catch(() => {
        setError('Unable to load selected indicator for editing.')
      })
  }, [searchParams])

  const handleSubmit = async (payload: IndicatorPayload, id?: number) => {
    if (id) {
      await updateThreatIndicator(id, payload)
      setEditing(null)
      const next = new URLSearchParams(searchParams)
      next.delete('edit')
      setSearchParams(next)
    } else {
      await createThreatIndicator(payload)
    }
    await loadData(page)
  }

  const handleDelete = async (row: IndicatorRow) => {
    await deleteThreatIndicator(row.id)
    if (editing?.id === row.id) {
      setEditing(null)
      const next = new URLSearchParams(searchParams)
      next.delete('edit')
      setSearchParams(next)
    }
    await loadData(page)
  }

  const clearSearch = async () => {
    setSearchQuery('')
    setStatusFilter('')
    setFromDate('')
    setToDate('')
    await loadData(0)
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return
    await loadData(nextPage)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-400">
            Threat Intelligence Platform
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Link
              to="/dashboard"
              className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-800"
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-800"
            >
              Analytics
            </Link>
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
        key={editing?.id ?? 'create'}
        editing={editing}
        onCancelEdit={() => {
          setEditing(null)
          const next = new URLSearchParams(searchParams)
          next.delete('edit')
          setSearchParams(next)
        }}
        onSubmit={handleSubmit}
      />
      <AiPanel />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by value, description, source, type (debounced)"
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
        <div className="flex gap-2 sm:justify-start lg:justify-end">
          <button
            type="button"
            onClick={clearSearch}
            className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => loadData(0)}
          className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800 md:w-fit"
        >
          Apply
        </button>
      </div>

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
          <div className="flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing page {page + 1} of {Math.max(totalPages, 1)} ({totalElements} total
              records)
            </p>
            <div className="flex gap-2 self-start sm:self-auto">
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
        </div>
      )}
    </div>
  )
}
