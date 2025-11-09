type Stat = { label: string; value: string | number }

type Props = {
  stats: Stat[]
}

export default function GoalStats({ stats }: Props) {
  if (!stats.length) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-lg">
        No goal stats yet. Start by adding a goal.
      </div>
    )
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl shadow-xl p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          <p className="text-sm text-gray-600 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
