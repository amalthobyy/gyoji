import { useCallback, useEffect, useMemo, useState } from 'react'
import WorkoutCard from '../components/workouts/WorkoutCard'
import { getWorkoutCategories, getWorkouts, Workout, WorkoutCategory } from '../services/workouts'
import Skeleton from '../components/ui/Skeleton'
import { toastPush } from '../services/toast-bridge'

const difficulties = ['Beginner', 'Intermediate', 'Advanced']

export default function WorkoutsPage() {
  const [categories, setCategories] = useState<WorkoutCategory[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [items, setItems] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    getWorkoutCategories()
      .then((data) => {
        if (!mounted) return
        setCategories(data)
        if (data.length > 0) {
          setActiveCategory((prev) => prev ?? data[0].id)
        }
      })
      .catch((err) => {
        console.error(err)
        setError('Unable to load workout categories right now.')
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(id)
  }, [query])

  const fetchWorkouts = useCallback(async () => {
    if (!activeCategory) return
    setLoading(true)
    setError(null)
    try {
      const data = await getWorkouts({
        category: activeCategory,
        difficulty: difficulty ? difficulty.toLowerCase() : undefined,
        search: debouncedQuery || undefined,
      })
      setItems(data)
      if (!data.length && debouncedQuery) {
        toastPush('info', 'No workouts matched your search. Try adjusting your filters.')
      }
    } catch (err) {
      console.error(err)
      setError('Unable to load workouts right now.')
    } finally {
      setLoading(false)
    }
  }, [activeCategory, difficulty, debouncedQuery])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const tabs = useMemo(() => categories.map((c) => ({ id: c.id, label: c.name })), [categories])

  return (
    <div className="py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Workout Library</h1>
        <p className="text-gray-600 mt-2">Access hundreds of guided workouts with detailed instructions and video demonstrations.</p>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                activeCategory === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 col-span-2"
            placeholder="Search workouts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All difficulties</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50/80 p-10 text-center text-gray-600">
            No workouts found for this combination. Try another category or difficulty level.
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((w) => (
              <WorkoutCard
                key={w.id}
                image={w.thumbnail}
                title={w.title}
                difficulty={w.difficulty_label as 'Beginner' | 'Intermediate' | 'Advanced'}
                duration={w.duration}
                calories={`${w.calories_burned} cal`}
                equipment={w.equipment_needed}
                exercises={Array.isArray(w.exercises_list) ? w.exercises_list : []}
                videoUrl={w.video_url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
