import { useEffect, useState } from 'react'
import { getWorkouts, Workout } from '../../services/workouts'
import Skeleton from '../../components/ui/Skeleton'
import { toastPush } from '../../services/toast-bridge'

const difficulties = ['beginner', 'intermediate', 'advanced']

export default function AdminWorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      try {
        const data = await getWorkouts({ difficulty: difficulty || undefined, search: search || undefined })
        if (!ignore) setWorkouts(data)
      } catch (err) {
        console.error(err)
        toastPush('error', 'Unable to load workouts.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    const handle = window.setTimeout(load, 250)
    return () => {
      ignore = true
      window.clearTimeout(handle)
    }
  }, [difficulty, search])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold">Workouts</p>
        <h1 className="text-2xl font-bold text-slate-900">Manage workout library</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workouts"
          className="flex-1 min-w-[220px] sm:max-w-sm rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="">All difficulties</option>
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-center">Difficulty</th>
                <th className="px-4 py-3 text-center">Duration</th>
                <th className="px-4 py-3 text-center">Calories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6">
                    <Skeleton className="h-14 rounded-xl" />
                  </td>
                </tr>
              ) : workouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 text-sm">
                    No workouts found.
                  </td>
                </tr>
              ) : (
                workouts.map((workout) => (
                  <tr key={workout.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{workout.title}</td>
                    <td className="px-4 py-3 text-slate-600">{workout.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {workout.difficulty_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{workout.duration} min</td>
                    <td className="px-4 py-3 text-center text-slate-600">{workout.calories_burned} cal</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
