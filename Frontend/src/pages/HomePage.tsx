import axios from 'axios'
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
      } catch (e) {
        if (import.meta.env.DEV && axios.isAxiosError(e) && !e.response) {
          setError(
            'Cannot reach the API. Start the Backend on port 8080 (with MySQL running), keep this Frontend dev server running, then refresh.',
          )
        } else {
          setError('Unable to load indicators right now.')
        }
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
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
            Threat Intelligence Platform
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Link
              to="/dashboard"
              className="rounded-md border border-slate-700 bg-slate-900/30 px-2.5 py-1 hover:bg-slate-800/60"
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className="rounded-md border border-slate-700 bg-slate-900/30 px-2.5 py-1 hover:bg-slate-800/60"
            >
              Analytics
            </Link>
            <span className="hidden sm:inline text-slate-400">Signed in as</span>
            <span className="rounded-md border border-slate-800 bg-slate-950/50 px-2 py-1 text-slate-200">
              {username}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-700 bg-slate-900/30 px-2.5 py-1 hover:bg-slate-800/60"
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

      <section className="rounded-2xl border border-slate-800/80 bg-slate-950/30 p-4 backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-12">
          <label className="space-y-1 lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Value, description, source, type…"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-violet-400/30 placeholder:text-slate-500 focus:border-violet-600 focus:ring-4"
            />
          </label>

          <label className="space-y-1 lg:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-violet-600"
            >
              <option value="">All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>

          <label className="space-y-1 lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              From
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-violet-600"
            />
          </label>

          <label className="space-y-1 lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              To
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-violet-600"
            />
          </label>

          <div className="flex flex-wrap gap-2 lg:col-span-12">
            <button
              type="button"
              onClick={() => loadData(0)}
              className="rounded-lg border border-violet-700/70 bg-violet-700/60 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-lg border border-slate-700 bg-slate-900/30 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800/60"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

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
