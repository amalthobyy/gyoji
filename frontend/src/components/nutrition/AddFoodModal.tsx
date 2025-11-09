import { useState } from 'react'
import { logDailyNutrition, updateDailyNutrition, DailyNutritionEntry } from '../../services/nutrition'
import { toastPush } from '../../services/toast-bridge'

interface Props {
  open: boolean
  onClose: () => void
  entryForDate?: DailyNutritionEntry | null
  date: string
  onSaved: (entry: DailyNutritionEntry) => void
}

export default function AddFoodModal({ open, onClose, entryForDate, date, onSaved }: Props) {
  const [meal, setMeal] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const cals = Number(calories)
    const prot = Number(protein)
    const carb = Number(carbs)
    const fatVal = Number(fat)

    if ([calories, protein, carbs, fat].some((v) => v === '') || [cals, prot, carb, fatVal].some(Number.isNaN)) {
      toastPush('error', 'Please fill out all macro values with numbers.')
      return
    }

    try {
      setSaving(true)
      let entry: DailyNutritionEntry
      if (entryForDate) {
        entry = await updateDailyNutrition(entryForDate.id, {
          calories: Number(entryForDate.calories) + cals,
          protein: Number(entryForDate.protein) + prot,
          carbs: Number(entryForDate.carbs) + carb,
          fat: Number(entryForDate.fat) + fatVal,
        })
      } else {
        entry = await logDailyNutrition({ date, calories: cals, protein: prot, carbs: carb, fat: fatVal })
      }
      onSaved(entry)
      toastPush('success', `${meal || 'Meal'} added to your log.`)
      setMeal('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
      onClose()
    } catch (err) {
      console.error(err)
      toastPush('error', 'Unable to log food right now.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <form onSubmit={handleSave} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Log a Meal</h3>
            <p className="text-xs text-gray-500">Track macros for {new Date(date).toLocaleDateString()}</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </header>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Meal name</label>
            <input
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              placeholder="Example: Post-workout shake"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="kcal"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fat (g)</label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-teal-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Meal'}
          </button>
        </div>
      </form>
    </div>
  )
}
