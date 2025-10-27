type Stat = { label: string; value: string | number }

const stats: Stat[] = [
  { label: 'Goals Completed', value: 12 },
  { label: 'Active Goals', value: 3 },
  { label: 'Success Rate', value: '78%' },
  { label: 'Days Streak', value: 156 },
]

export default function GoalStats() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-xl shadow-xl p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          <p className="text-sm text-gray-600 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
