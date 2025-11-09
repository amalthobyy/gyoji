import { useEffect, useMemo, useState } from 'react'
import { DailyNutritionEntry, getDailyNutrition } from '../../services/nutrition'
import { toastPush } from '../../services/toast-bridge'
import AddFoodModal from './AddFoodModal'

type MacroBreakdown = {
  label: string
  value: number
  target: number
  key: 'protein' | 'carbs' | 'fat'
}

export default function MacrosPanel() {
  const [entries, setEntries] = useState<DailyNutritionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    getDailyNutrition()
      .then((data) => setEntries(data))
      .catch((err) => {
        console.error(err)
        toastPush('error', 'Unable to load today’s macros.')
      })
      .finally(() => setLoading(false))
  }, [])

  const todayEntry = entries.find((entry) => entry.date === today)

  const macros: MacroBreakdown[] = [
    { label: 'Protein', value: Number(todayEntry?.protein ?? 0), target: 150, key: 'protein' },
    { label: 'Carbs', value: Number(todayEntry?.carbs ?? 0), target: 200, key: 'carbs' },
    { label: 'Fat', value: Number(todayEntry?.fat ?? 0), target: 70, key: 'fat' },
  ]
  const calories = Number(todayEntry?.calories ?? 0)

  function handleLogFood() {
    setModalOpen(true)
  }

  function handleSaved(entry: DailyNutritionEntry) {
    setEntries((prev) => {
      const filtered = prev.filter((item) => item.id !== entry.id)
      return [entry, ...filtered]
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-5">
      <h4 className="font-semibold text-gray-900">Today's Macros</h4>
      <div className="mt-4 space-y-4">
        {macros.map((m) => {
          const pct = m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{m.label}</span>
                <span className="text-gray-600">{m.value}/{m.target}g</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-teal-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-sm text-gray-600">Total calories: <span className="font-semibold text-gray-900">{calories} kcal</span></p>
      <button
        onClick={handleLogFood}
        disabled={loading}
        className="mt-5 inline-flex items-center rounded-lg bg-gray-800 text-white px-4 py-2 text-sm hover:bg-gray-900 disabled:opacity-60"
      >
        + Log Food
      </button>
      <AddFoodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        entryForDate={todayEntry ?? null}
        date={today}
        onSaved={handleSaved}
      />
    </div>
  )
}
