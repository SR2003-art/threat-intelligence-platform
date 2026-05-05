import type { IndicatorRow } from '../services/indicatorService'

type IndicatorTableProps = {
  rows: IndicatorRow[]
  onEdit: (row: IndicatorRow) => void
  onDelete: (row: IndicatorRow) => Promise<void>
}

export function IndicatorTable({ rows, onEdit, onDelete }: IndicatorTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Value</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last Seen</th>
            <th className="px-4 py-3 font-medium">Actions</th>
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
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="rounded border border-slate-600 px-2 py-1 text-xs hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="rounded border border-red-900 px-2 py-1 text-xs text-red-200 hover:bg-red-950/40"
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
