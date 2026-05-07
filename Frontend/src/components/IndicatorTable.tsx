import type { IndicatorRow } from '../services/indicatorService'
import { Link } from 'react-router-dom'

type IndicatorTableProps = {
  rows: IndicatorRow[]
  onEdit: (row: IndicatorRow) => void
  onDelete: (row: IndicatorRow) => Promise<void>
}

function statusBadge(status: string) {
  const base =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide'
  switch (status) {
    case 'ACTIVE':
      return `${base} border-emerald-900/60 bg-emerald-950/40 text-emerald-200`
    case 'EXPIRED':
      return `${base} border-amber-900/60 bg-amber-950/40 text-amber-200`
    case 'FALSE_POSITIVE':
      return `${base} border-slate-700/70 bg-slate-900/40 text-slate-200`
    case 'INACTIVE':
      return `${base} border-slate-700/70 bg-slate-900/40 text-slate-300`
    default:
      return `${base} border-slate-700/70 bg-slate-900/40 text-slate-200`
  }
}

export function IndicatorTable({ rows, onEdit, onDelete }: IndicatorTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
      <table className="min-w-full divide-y divide-slate-800/80 text-left text-sm">
        <thead className="bg-slate-900/60 text-slate-300">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">ID</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Type</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Value</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Last Seen</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70 text-slate-200">
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={[
                index % 2 === 0 ? 'bg-slate-950/30' : 'bg-slate-950/50',
                'hover:bg-slate-900/40',
              ].join(' ')}
            >
              <td className="px-4 py-3 font-mono text-xs text-slate-300">{row.id}</td>
              <td className="px-4 py-3">
                <span className="font-medium text-slate-100">{row.indicatorType}</span>
              </td>
              <td className="max-w-[34rem] truncate px-4 py-3 text-slate-100">
                {row.indicatorValue}
              </td>
              <td className="px-4 py-3">
                <span className={statusBadge(row.status)}>{row.status}</span>
              </td>
              <td className="px-4 py-3 text-slate-300">{row.lastSeenAt ?? '-'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/indicators/${row.id}`}
                    className="rounded-md border border-slate-700 bg-slate-900/30 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800/60"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="rounded-md border border-slate-700 bg-slate-900/30 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800/60"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="rounded-md border border-red-900/70 bg-red-950/20 px-2 py-1 text-xs text-red-200 hover:bg-red-950/40"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
