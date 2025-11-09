import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Skeleton from '../ui/Skeleton'
import { fetchTrainers, Trainer } from '../../services/trainers'
import { formatCurrency } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'

const FILTERS = [
  'Strength Training',
  'Cardio & Endurance',
  'Yoga & Flexibility',
]

export default function LandingTrainers() {
  const { user } = useAuth()
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(FILTERS[0])

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTrainers()
        const visible = data.filter(t => t.user_id !== user?.id)
        setTrainers(visible)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const trainersToDisplay = useMemo(() => {
    if (trainers.length === 0) return []

    const normalized = filter.toLowerCase()
    const matchKey = normalized.split('&')[0].trim()
    const sorted = [...trainers].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    const preferred = sorted.filter(trainer => {
      const spec = (trainer.specialization || '').toLowerCase()
      if (!spec) return false
      if (spec === normalized) return true
      if (matchKey && spec.includes(matchKey)) return true
      return false
    })

    const combined: Trainer[] = []
    const pushUnique = (items: Trainer[]) => {
      for (const item of items) {
        if (!combined.some(existing => existing.id === item.id)) {
          combined.push(item)
        }
        if (combined.length >= 3) break
      }
    }

    pushUnique(preferred)
    if (combined.length < 3) {
      pushUnique(sorted)
    }

    return combined.slice(0, 3)
  }, [trainers, filter])

  if (loading) {
    return (
      <section id="trainers" className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto rounded" />
            <Skeleton className="h-4 w-80 mx-auto mt-4 rounded" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const hasTrainers = trainers.length > 0

  return (
    <section id="trainers" className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Meet Our{' '}
            <span className="bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">
              Certified Trainers
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our network of experienced trainers specialized in different fitness disciplines.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
          {FILTERS.map(option => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                filter === option
                  ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:shadow-md'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {!hasTrainers ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center text-gray-600">
            We are onboarding trainers right now. Check back soon!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainersToDisplay.map(trainer => (
              <article
                key={trainer.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-64 bg-gradient-to-br from-orange-400 via-orange-500 to-teal-500 flex items-center justify-center">
                  {trainer.profile_picture ? (
                    <img
                      src={trainer.profile_picture}
                      alt={trainer.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white opacity-90 group-hover:scale-110 transition-transform duration-300"
                    >
                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" />
                      <path d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z" fill="currentColor" />
                    </svg>
                  )}
                  <span className="absolute top-4 left-4 text-xs font-semibold bg-white/95 text-gray-800 px-3 py-1.5 rounded-full shadow-sm">
                    {trainer.specialization || 'Expert Coach'}
                  </span>
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full shadow-sm">
                    <svg className="h-4 w-4 fill-orange-500" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-800">{Number(trainer.rating || 0) > 0 ? Number(trainer.rating).toFixed(1) : 'New'}</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-xl text-gray-900">{trainer.name}</h3>
                  <p className="text-sm text-gray-600">
                    {trainer.experience_years ? `${trainer.experience_years}+ years experience` : 'Fresh perspective'} • {trainer.specialization || 'Personalised coaching'}
                  </p>
                  <div className="text-sm font-semibold text-orange-600">
                    {trainer.hourly_rate ? `${formatCurrency(Number(trainer.hourly_rate))}/session` : 'Rate on request'}
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/trainers"
                      className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      View Trainers
                    </Link>
                    <Link
                      to="/trainers"
                      className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:border-orange-400 hover:text-orange-500 transition-colors"
                    >
                      Explore More
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}