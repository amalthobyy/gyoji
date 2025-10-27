type Macro = { label: string; value: number; target: number }

const macros: Macro[] = [
  { label: 'Protein', value: 45, target: 150 },
  { label: 'Carbs', value: 180, target: 200 },
  { label: 'Fat', value: 55, target: 70 },
]

export default function MacrosPanel() {
  return (
    <div className="bg-white rounded-xl shadow-xl p-5">
      <h4 className="font-semibold text-gray-900">Today's Macros</h4>
      <div className="mt-4 space-y-4">
        {macros.map(m => {
          const pct = Math.min(100, Math.round((m.value / m.target) * 100))
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{m.label}</span>
                <span className="text-gray-600">{m.value}/{m.target}{m.label === 'Protein' ? 'g' : m.label === 'Fat' ? 'g' : 'g'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div className="h-2 bg-blue-600" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <button className="mt-5 inline-flex items-center rounded-lg bg-gray-800 text-white px-4 py-2 text-sm hover:bg-gray-900">+ Log Food</button>
    </div>
  )
}
