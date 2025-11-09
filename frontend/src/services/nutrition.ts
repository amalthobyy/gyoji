import { api } from './api'

export type DietGoal = 'weight_loss' | 'muscle_gain'
export type MealType = 'breakfast' | 'lunch' | 'dinner'

export interface Meal {
  id: number
  meal_type: MealType
  name: string
  calories: number
  protein: string
  carbs: string
  fat: string
  ingredients: string[]
  image_url?: string | null
}

export interface DietPlan {
  id: number
  name: string
  goal_type: DietGoal
  daily_calories: number
  meals_per_day: number
  meals: Meal[]
}

export interface DailyNutritionEntry {
  id: number
  date: string
  calories: number
  protein: string
  carbs: string
  fat: string
}

export interface LogFoodPayload {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface SuggestedSupplement {
  name: string
  subtitle: string
  timing: string
  dosage: string
}

export async function getDietPlans(goal?: DietGoal): Promise<DietPlan[]> {
  const params = goal ? { goal_type: goal } : undefined
  const { data } = await api.get<DietPlan[]>('/diet-plans/', { params })
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function getDailyNutrition(): Promise<DailyNutritionEntry[]> {
  const { data } = await api.get<DailyNutritionEntry[]>('/daily-nutrition/')
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function logDailyNutrition(payload: LogFoodPayload): Promise<DailyNutritionEntry> {
  const { data } = await api.post<DailyNutritionEntry>('/daily-nutrition/', payload)
  return data
}

export async function updateDailyNutrition(id: number, payload: Partial<LogFoodPayload>): Promise<DailyNutritionEntry> {
  const { data } = await api.patch<DailyNutritionEntry>(`/daily-nutrition/${id}/`, payload)
  return data
}

export async function deleteDailyNutrition(id: number): Promise<void> {
  await api.delete(`/daily-nutrition/${id}/`)
}

export async function getRecommendedSupplements(goal: DietGoal = 'weight_loss'): Promise<SuggestedSupplement[]> {
  const items: SuggestedSupplement[] = goal === 'muscle_gain'
    ? [
        { name: 'Whey Protein', subtitle: 'Lean Muscle', timing: 'Post-workout', dosage: '25g' },
        { name: 'Creatine Monohydrate', subtitle: 'Strength & Power', timing: 'Daily', dosage: '5g' },
        { name: 'Carb Powder', subtitle: 'Energy & Recovery', timing: 'Post-workout', dosage: '40g' },
        { name: 'BCAAs', subtitle: 'Intra-workout Support', timing: 'During workout', dosage: '7g' },
      ]
    : [
        { name: 'Whey Isolate', subtitle: 'Preserve Lean Mass', timing: 'Post-workout', dosage: '24g' },
        { name: 'Green Tea Extract', subtitle: 'Metabolic Support', timing: 'Morning', dosage: '500mg' },
        { name: 'Fiber Blend', subtitle: 'Satiety', timing: 'With meals', dosage: '10g' },
        { name: 'Multivitamin', subtitle: 'Micronutrients', timing: 'Breakfast', dosage: '1 tablet' },
      ]
  return Promise.resolve(items)
}
