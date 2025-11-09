import { useEffect, useMemo, useState } from 'react'
import MacrosPanel from '../components/nutrition/MacrosPanel'
import MealCard from '../components/nutrition/MealCard'
import Supplements from '../components/nutrition/Supplements'
import { DietGoal, DietPlan, getDietPlans } from '../services/nutrition'
import Skeleton from '../components/ui/Skeleton'
import { toastPush } from '../services/toast-bridge'

const tabs: { label: string; value: DietGoal }[] = [
  { label: 'Weight Loss', value: 'weight_loss' },
  { label: 'Muscle Gain', value: 'muscle_gain' },
]

export default function NutritionPage() {
  const [active, setActive] = useState<DietGoal>('weight_loss')
  const [plans, setPlans] = useState<DietPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDietPlans(active)
      .then((data) => setPlans(data))
      .catch((err) => {
        console.error(err)
        setError('Unable to load diet plans right now.')
        toastPush('error', 'Unable to load diet plans right now.')
      })
      .finally(() => setLoading(false))
  }, [active])

  const activePlan = useMemo(() => plans[0], [plans])

  function handleCustomize() {
    toastPush('info', 'Customization coming soon. Share your preferences with your trainer to adjust macros.')
  }

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Nutrition & Diet Plans</h1>
        <p className="text-gray-600 mt-2">Personalized meal plans and nutrition tracking to fuel your fitness journey.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1"><MacrosPanel /></div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActive(tab.value)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    active === tab.value
                      ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-sm bg-white rounded-full shadow px-3 py-1 text-gray-700">
              {activePlan ? `${activePlan.daily_calories.toLocaleString()} kcal/day` : '—'}
            </span>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {loading ? (
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : !activePlan ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-10 text-center text-gray-600">
              No meal plan found for this goal yet. Check back soon or talk to your coach.
            </div>
          ) : (
            <>
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                {activePlan.meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    title={meal.name}
                    calories={meal.calories}
                    image={meal.image_url || getMealFallbackImage(meal.meal_type)}
                    ingredients={Array.isArray(meal.ingredients) ? meal.ingredients : []}
                    macros={{
                      protein: Number(meal.protein) || 0,
                      carbs: Number(meal.carbs) || 0,
                      fat: Number(meal.fat) || 0,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleCustomize}
                className="mt-4 inline-flex items-center rounded-lg bg-gray-800 text-white px-4 py-2 text-sm hover:bg-gray-900"
              >
                Customize This Plan
              </button>

              <Supplements goal={active} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function getMealFallbackImage(type: string) {
  switch (type) {
    case 'breakfast':
      return 'https://images.unsplash.com/photo-1543339308-43fba6f1d079?q=80&w=1200&auto=format&fit=crop'
    case 'lunch':
      return 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop'
    case 'dinner':
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop'
    default:
      return 'https://images.unsplash.com/photo-1546069901-eacef0df6022?q=80&w=1200&auto=format&fit=crop'
  }
}
