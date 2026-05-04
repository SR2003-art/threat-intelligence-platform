import type { IndicatorRow } from '../services/indicatorService'

type IndicatorTableProps = {
  rows: IndicatorRow[]
}

export function IndicatorTable({ rows }: IndicatorTableProps) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
