import { useEffect, useState } from 'react'
import { DietPlan, getDietPlans } from '../../services/nutrition'
import Skeleton from '../../components/ui/Skeleton'
import { toastPush } from '../../services/toast-bridge'

const goalLabels: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
}

export default function AdminNutritionPage() {
  const [plans, setPlans] = useState<DietPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [goal, setGoal] = useState('')

  useEffect(() => {
    setLoading(true)
    getDietPlans(goal ? (goal as any) : undefined)
      .then(setPlans)
      .catch((err) => {
        console.error(err)
        toastPush('error', 'Unable to load diet plans.')
      })
      .finally(() => setLoading(false))
  }, [goal])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold">Nutrition</p>
        <h1 className="text-2xl font-bold text-slate-900">Manage diet plans</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="">All goals</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-48 rounded-2xl" />)
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No meal plans yet.
          </div>
        ) : (
          plans.map((plan) => (
            <article key={plan.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{goalLabels[plan.goal_type] || plan.goal_type}</p>
                <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
                <p className="text-sm text-slate-500">{plan.daily_calories.toLocaleString()} kcal / day • {plan.meals_per_day} meals</p>
              </div>
              <div className="space-y-3">
                {plan.meals.slice(0, 3).map((meal) => (
                  <div key={meal.id} className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">{meal.name}</span>
                      <span>{meal.calories} cal</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{meal.protein}g P</span>
                      <span>{meal.carbs}g C</span>
                      <span>{meal.fat}g F</span>
                    </div>
                  </div>
                ))}
                {plan.meals.length > 3 && (
                  <p className="text-xs text-slate-500">+ {plan.meals.length - 3} more meals</p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
