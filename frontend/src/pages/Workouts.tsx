import { useEffect, useMemo, useState } from 'react'
import WorkoutCard from '../components/workouts/WorkoutCard'
import { api } from '../services/api'

const TABS = ['Strength Training', 'Cardio', 'Flexibility'] as const

type Workout = {
  id: number
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number
  calories: string
  equipment: string
  image: string
  exercises: string[]
  category: string
}

const mock: Workout[] = [
  { id: 1, title: 'Upper Body Power', difficulty: 'Intermediate', duration: 45, calories: '350-450 cal', equipment: 'Dumbbells, Bench', image: 'https://images.unsplash.com/photo-1599987316645-88eb2b1aa0eb?q=80&w=1600&auto=format&fit=crop', exercises: ['Push-ups', 'Bench Press', 'Rows', 'Shoulder Press'], category: 'Strength Training' },
  { id: 2, title: 'Lower Body Blast', difficulty: 'Beginner', duration: 40, calories: '300-400 cal', equipment: 'Bodyweight', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1600&auto=format&fit=crop', exercises: ['Squats', 'Lunges', 'Deadlifts', 'Calf Raises'], category: 'Cardio' },
]

export default function WorkoutsPage() {
  const [active, setActive] = useState<(typeof TABS)[number]>('Strength Training')
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [items, setItems] = useState<Workout[]>(mock)

  useEffect(() => {
    // Example API hook up: uncomment when backend has data
    // const params: any = {}
    // if (active) params.category = active
    // if (difficulty) params.difficulty = difficulty.toLowerCase()
    // if (query) params.search = query
    // api.get('/workouts/', { params }).then(({ data }) => setItems(data.results || data))
    const filtered = mock.filter(w => w.category === active && (!query || w.title.toLowerCase().includes(query.toLowerCase())) && (!difficulty || w.difficulty === difficulty as any))
    setItems(filtered)
  }, [active, query, difficulty])

  const difficulties = ['Beginner', 'Intermediate', 'Advanced']

  return (
    <div className="py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Workout Library</h1>
        <p className="text-gray-600 mt-2">Access hundreds of guided workouts with detailed instructions and video demonstrations.</p>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setActive(t)} className={`px-4 py-2 rounded-full ${active===t ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{t}</button>
          ))}
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <input className="border border-gray-300 rounded-lg px-3 py-2 col-span-2" placeholder="Search workouts" value={query} onChange={e=>setQuery(e.target.value)} />
          <select className="border border-gray-300 rounded-lg px-3 py-2" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
            <option value="">All difficulties</option>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(w => (
            <WorkoutCard key={w.id} image={w.image} title={w.title} difficulty={w.difficulty} duration={w.duration} calories={w.calories} equipment={w.equipment} exercises={w.exercises} />
          ))}
        </div>
      </div>
    </div>
  )
}
