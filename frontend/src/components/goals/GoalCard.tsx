type Props = {
  name: string
  category: string
  progressPercent: number
  targetLabel: string
  deadline?: string
  status: 'On Track' | 'Behind' | 'Ahead'
}

export default function GoalCard({ name, category, progressPercent, targetLabel, deadline, status }: Props) {
  const statusColor = status === 'On Track' ? 'bg-blue-100 text-blue-700' : status === 'Ahead' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{category}</p>
          <h3 className="font-semibold text-gray-900">{name}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{status}</span>
      </div>
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 bg-blue-600" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {progressPercent}%</span>
          <span>Target: {targetLabel}</span>
        </div>
        {deadline && <p className="text-xs text-gray-500 mt-1">Deadline: {deadline}</p>}
      </div>
    </div>
  )
}
