type Props = {
  name: string
  category: string
  progressPercent: number
  targetLabel: string
  deadline?: string
  statusLabel: string
  statusTone?: 'success' | 'warning' | 'danger'
}

export default function GoalCard({ name, category, progressPercent, targetLabel, deadline, statusLabel, statusTone = 'success' }: Props) {
  const badgeMap = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
  } as const
  const statusColor = badgeMap[statusTone]
  const pct = Math.max(0, Math.min(100, Math.round(progressPercent)))

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{category}</p>
          <h3 className="mt-1 font-semibold text-gray-900 text-base">{name}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 to-teal-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {pct}%</span>
          <span>Target: {targetLabel}</span>
        </div>
        {deadline && <p className="text-xs text-gray-500">Deadline: {deadline}</p>}
      </div>
    </div>
  )
}
