import { useEffect, useMemo, useState } from 'react'
import TrainerCard from '../components/trainers/TrainerCard'
import TrainerDetailModal from '../components/trainers/TrainerDetailModal'
import BookingModal from '../components/trainers/BookingModal'
import { fetchTrainers, Trainer } from '../services/trainers'
import Skeleton from '../components/ui/Skeleton'
import { formatCurrency } from '../utils/format'
import { toastPush } from '../services/toast-bridge'
import { useAuth } from '../context/AuthContext'
import { createHiring } from '../services/hiring'
import { openChatRoom } from '../services/chat'
import { useNavigate } from 'react-router-dom'

const DEFAULT_SPECIALIZATIONS = ['Strength Training', 'Cardio & Endurance', 'Yoga & Flexibility', 'Mobility & Recovery', 'HIIT & Conditioning']

type Filters = {
  specialization: string
  rating: string
  price: number
}

export default function TrainersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({ specialization: 'all', rating: 'all', price: 1000 })
  const [maxPrice, setMaxPrice] = useState(1000)
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [bookingTrainer, setBookingTrainer] = useState<Trainer | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  const handleOpenChat = async (trainer: Trainer) => {
    try {
      const room = await openChatRoom({ trainerId: trainer.user_id })
      setSelectedTrainer(null)
      navigate(`/chat?room=${room.id}`)
    } catch (error) {
      console.error(error)
      toastPush('error', 'Unable to open chat right now.')
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTrainers()
        setTrainers(data)
        const highest = data.reduce((acc, t) => Math.max(acc, Number(t.hourly_rate || 0)), 0)
        const normalized = Math.max(highest, 2000)
        setMaxPrice(normalized)
        setFilters(prev => ({ ...prev, price: normalized }))
      } catch (err) {
        console.error(err)
        setError('Could not load trainers right now.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const specializations = useMemo(() => {
    const values = new Set<string>(['all'])
    DEFAULT_SPECIALIZATIONS.forEach(v => values.add(v))
    trainers.forEach(t => {
      if (t.specialization) values.add(t.specialization)
    })
    return Array.from(values)
  }, [trainers])

  const filtered = useMemo(() => {
    return trainers.filter(t => {
      if (t.user_id === user?.id) return false
      const rate = Number(t.hourly_rate || 0)
      if (filters.specialization !== 'all' && t.specialization?.toLowerCase() !== filters.specialization.toLowerCase()) return false
      if (filters.rating !== 'all' && Number(t.rating || 0) < Number(filters.rating)) return false
      if (rate > filters.price) return false
      return true
    })
  }, [trainers, filters, user?.id])

  if (loading) {
    return (
      <div className="py-6 space-y-8">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto rounded" />
          <Skeleton className="h-4 w-80 mx-auto rounded" />
        </div>
        <div className="bg-white rounded-3xl shadow-xl px-6 py-5 flex flex-wrap gap-6 items-end">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="py-6 text-center text-red-600">{error}</div>
  }

  return (
    <div className="py-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Find Your Trainer</h1>
        <p className="text-gray-600">Browse certified trainers and book sessions at your convenience.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl px-6 py-5 flex flex-wrap gap-6 items-end">
        <div className="min-w-[180px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={filters.specialization}
            onChange={e => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
          >
            {specializations.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All' : option}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Min Rating</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={filters.rating}
            onChange={e => setFilters(prev => ({ ...prev, rating: e.target.value }))}
          >
            <option value="all">Any</option>
            <option value="3.5">3.5+</option>
            <option value="4.0">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price per session</label>
          <div className="flex items-center gap-4">
            <input
              className="flex-1"
              type="range"
              min={0}
              max={Math.max(maxPrice, 2000)}
              step={100}
              value={filters.price}
              onChange={e => setFilters(prev => ({ ...prev, price: Number(e.target.value) }))}
            />
            <span className="text-sm font-semibold text-gray-800">Up to {formatCurrency(filters.price)}</span>
          </div>
        </div>
        <div className="ml-auto">
          <button
            className="inline-flex items-center rounded-full border-2 border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors"
            onClick={() => setFilters({ specialization: 'all', rating: 'all', price: maxPrice })}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-900">No trainers match your filters yet</h3>
          <p className="text-gray-600 mt-2">Try adjusting the filters or check back soon as new trainers join Gyoji.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(trainer => (
            <TrainerCard
              key={trainer.id}
              photo={trainer.profile_picture}
              name={trainer.name}
              specialization={trainer.specialization}
              rating={trainer.rating}
              experience={trainer.experience_years}
              rate={trainer.hourly_rate}
              onView={() => setSelectedTrainer(trainer)}
              onHire={() => setBookingTrainer(trainer)}
            />
          ))}
        </div>
      )}

      <TrainerDetailModal
        open={!!selectedTrainer}
        onClose={() => setSelectedTrainer(null)}
        onHire={() => {
          if (selectedTrainer) {
            setBookingTrainer(selectedTrainer)
          }
          setSelectedTrainer(null)
        }}
        onMessage={selectedTrainer ? () => handleOpenChat(selectedTrainer) : undefined}
        canHire={Boolean(selectedTrainer && selectedTrainer.user_id !== user?.id)}
        name={selectedTrainer?.name || ''}
        photo={selectedTrainer?.profile_picture || ''}
        bio={selectedTrainer?.bio || 'This trainer is getting their profile ready. Reach out to learn more about their approach.'}
        certifications={selectedTrainer?.certifications || 'Will update soon'}
        specialization={selectedTrainer?.specialization || undefined}
        experience={selectedTrainer?.experience_years || undefined}
        rate={selectedTrainer?.hourly_rate || undefined}
        rating={selectedTrainer?.rating || undefined}
      />

      <BookingModal
        open={!!bookingTrainer}
        onClose={() => setBookingTrainer(null)}
        loading={bookingLoading}
        onConfirm={async ({ session, date, time }: { session: 'one-time' | 'monthly'; date: string; time: string }) => {
          if (!bookingTrainer) return
          if (!user) {
            toastPush('error', 'Please log in to hire a trainer.')
            navigate('/login')
            return
          }
          try {
            setBookingLoading(true)
            await createHiring({
              trainer: bookingTrainer.user_id,
              session_type: session,
              start_date: date,
              time_slot: time,
            })
            // Chat room is already created by the backend, just try to get it or navigate to chat
            try {
              const room = await openChatRoom({ trainerId: bookingTrainer.user_id })
              navigate(`/chat?room=${room.id}`)
            } catch (chatError: any) {
              // If chat room creation fails, just navigate to chat - it might already exist
              console.warn('Chat room creation warning:', chatError)
              navigate('/chat')
            }
            toastPush('success', 'Booking request sent! You can continue the conversation in chat.')
          } catch (error: any) {
            console.error(error)
            const msg = error?.response?.data?.detail || 'Could not send booking request. Please try again.'
            toastPush('error', msg)
          } finally {
            setBookingLoading(false)
            setBookingTrainer(null)
          }
        }}
      />
    </div>
  )
}
