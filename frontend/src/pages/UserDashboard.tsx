import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { formatNumber, formatCurrency } from '../utils/format'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { getHirings, Hiring, createHiringCheckoutSession } from '../services/hiring'
import { openChatRoom } from '../services/chat'
import { toastPush } from '../services/toast-bridge'
import {
  MessageSquare,
  Calendar,
  Clock,
  User,
  Image,
  Upload,
  BookOpen,
  Activity,
  Sparkles,
  Share2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

type Stats = {
  goals_completed: number
  active_goals: number
  success_rate: number
  days_streak: number
}

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Hiring[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [payingId, setPayingId] = useState<number | null>(null)

  const quickActions = [
    { label: 'Update profile', description: 'Keep your bio and metrics current', icon: User, to: '/profile#profile' },
    { label: 'Upload transformation', description: 'Save progress photos & videos', icon: Upload, to: '/profile#profile' },
    { label: 'Add a memory', description: 'Journal a highlight from today', icon: Image, to: '/profile#memories' },
    { label: 'Log body measurements', description: 'Track weight, waist, strength PRs', icon: Activity, to: '/profile#metrics' },
  ]

  const memoryEntries = [
    {
      title: 'Mountain hike with Anjali',
      mood: 'Feeling unstoppable',
      date: 'Feb 4, 2025',
      tags: ['Outdoor', 'Cardio', 'Friends'],
      color: 'border-teal-400',
    },
    {
      title: 'Hit new squat PR 110kg',
      mood: 'Stronger every week',
      date: 'Jan 27, 2025',
      tags: ['Strength', 'Gym'],
      color: 'border-orange-400',
    },
    {
      title: 'Meal prep wins',
      mood: 'Macros dialed in',
      date: 'Jan 21, 2025',
      tags: ['Nutrition', 'Routine'],
      color: 'border-indigo-400',
    },
  ]

  const refreshAppointments = useCallback(async () => {
    setAppointmentsLoading(true)
    try {
      const data = await getHirings()
      setAppointments(data)
    } catch (error) {
      console.error(error)
    } finally {
      setAppointmentsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const statsResponse = await api.get<Stats>('/stats/').catch(() => ({ data: null }))
        setStats(statsResponse.data)
        await refreshAppointments()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshAppointments])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const paymentStatus = params.get('payment')
    if (!paymentStatus) {
      return
    }

    if (paymentStatus === 'success') {
      toastPush('success', 'Payment received! Your trainer will be notified.')
      refreshAppointments()
    } else if (paymentStatus === 'cancelled') {
      toastPush('info', 'Payment cancelled. You can pay anytime from your dashboard.')
    } else if (paymentStatus === 'failed') {
      toastPush('error', 'Payment failed. Please try again or contact support.')
      refreshAppointments()
    }

    setPayingId(null)
    params.delete('payment')
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : '',
      },
      { replace: true },
    )
  }, [location.pathname, location.search, navigate, refreshAppointments])
  async function handlePayNow(appointment: Hiring) {
    try {
      setPayingId(appointment.id)
      const baseUrl = window.location.origin + location.pathname
      const successUrl = `${baseUrl}?payment=success`
      const cancelUrl = `${baseUrl}?payment=cancelled`
      const { checkout_url } = await createHiringCheckoutSession(appointment.id, {
        success_url: successUrl,
        cancel_url: cancelUrl,
      })
      window.location.href = checkout_url
    } catch (error: any) {
      console.error(error)
      const detail = error?.response?.data?.detail
      toastPush('error', detail || 'Unable to start payment. Please try again in a moment.')
      setPayingId(null)
    }
  }

  function renderPaymentStatus(appointment: Hiring) {
    if (appointment.payment_status === 'paid') {
      return (
        <div className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
          <CheckCircle2 size={16} />
          <span>Paid{appointment.paid_at ? ` • ${new Date(appointment.paid_at).toLocaleDateString('en-IN')}` : ''}</span>
        </div>
      )
    }
    if (appointment.payment_status === 'failed') {
      return (
        <div className="inline-flex items-center gap-1 text-sm font-semibold text-red-600">
          <AlertCircle size={16} />
          <span>Payment failed. Retry payment to confirm your booking.</span>
        </div>
      )
    }
    if (appointment.can_pay) {
      return (
        <div className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
          <AlertCircle size={16} />
          <span>Payment required to secure this session.</span>
        </div>
      )
    }
    return null
  }


  async function handleMessageTrainer(trainerId: number) {
    try {
      const room = await openChatRoom({ trainerId })
      navigate(`/chat?room=${room.id}`)
    } catch (error: any) {
      console.error(error)
      toastPush('error', 'Unable to open chat right now.')
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      accepted: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="uppercase text-xs tracking-[0.3em] text-orange-500">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome back, {user?.first_name || user?.username}</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Track your goals, workouts and nutrition at a glance. Stay consistent to keep your streak alive!
            </p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-teal-500 text-white rounded-2xl px-6 py-4 shadow-lg text-center">
            <p className="text-sm text-white/80">Current streak</p>
            <p className="text-3xl font-semibold">{stats ? formatNumber(stats.days_streak) : '—'} days</p>
          </div>
        </div>
      </section>

      <section>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active goals" value={formatNumber(stats?.active_goals || 0)} trend="Keep pushing" />
            <StatCard label="Goals completed" value={formatNumber(stats?.goals_completed || 0)} trend="Celebrate wins" />
            <StatCard label="Success rate" value={`${Math.round(stats?.success_rate || 0)}%`} trend="Aim for 80%+" />
            <StatCard label="Consistency streak" value={`${formatNumber(stats?.days_streak || 0)} days`} trend="Don't break the chain" />
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-28 w-28 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-200 to-teal-200">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.first_name || user.username} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-orange-600">
                  {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.first_name || user?.username}</h2>
                <p className="text-sm text-gray-500">Building consistency, one session at a time.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ProfilePill label="Joined" value={user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-IN') : '—'} />
                <ProfilePill label="Role" value="Athlete" />
                <ProfilePill label="Coach" value="Yet to hire" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/trainers"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-teal-600"
            >
              <Sparkles size={16} /> Discover new plans
            </Link>
            <Link
              to="/goals"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-500"
            >
              <BookOpen size={16} /> View history
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
            <Share2 size={18} className="text-gray-400" />
          </div>
          <div className="mt-4 grid gap-3">
            {quickActions.map(action => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 transition hover:border-orange-400 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <action.icon size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
                <span className="text-xs font-semibold text-orange-500">Open</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recommended next steps</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <ActionLink to="/goals" title="Review your goals" description="Update progress and adjust targets." />
            <ActionLink to="/workouts" title="Start a workout" description="Pick a session that matches your energy level today." />
            <ActionLink to="/nutrition" title="Log a meal" description="Stay within your macro targets for steady progress." />
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">My wellness metrics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Metric label="Next workout" value="Strength | Push Day" helper="Scheduled for 7:00 PM" />
            <Metric label="Weekly calories" value="12,450 kcal" helper="You're on track" />
            <Metric label="Water intake" value="2.3 L" helper="Goal: 3.0 L" />
            <Metric label="Sleep avg" value="7h 20m" helper="Great recovery" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My memories & journal</h2>
              <p className="text-sm text-gray-600 mt-1">Capture breakthroughs, milestones and favourite sessions.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-500">
              <Image size={16} /> Add memory
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {memoryEntries.map(entry => (
              <div key={entry.title} className={`rounded-2xl border ${entry.color} bg-gray-50/80 p-4 shadow-sm`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{entry.title}</h3>
                    <p className="text-xs text-gray-500">{entry.mood}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{entry.date}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900">Resource vault</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <ActionLink to="/nutrition" title="Recipes & meal plans" description="Save favourite dishes and grocery lists." />
            <ActionLink to="/workouts" title="Workout library" description="Curate routines and instructor notes." />
            <ActionLink to="/goals" title="Body stats & measurements" description="Upload check-ins, progress photos and data." />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Appointments</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage your training sessions with trainers</p>
          </div>
          <Link
            to="/trainers"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-5 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl"
          >
            Find Trainers
          </Link>
        </div>

        {appointmentsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No appointments yet</p>
            <p className="text-sm text-gray-500 mt-1">Hire a trainer to get started with personalized training</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-orange-100 to-teal-100 flex items-center justify-center text-orange-700 font-semibold text-lg">
                      {appointment.trainer_profile_picture ? (
                        <img
                          src={appointment.trainer_profile_picture}
                          alt={appointment.trainer_name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">{appointment.trainer_name}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(appointment.start_date)}</span>
                        </div>
                        {appointment.time_slot && (
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span>{appointment.time_slot}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Session:</span>
                          <span className="font-medium">
                            {appointment.session_type === 'one-time' ? 'One-time session' : 'Monthly plan'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Fee:</span>
                          <span className="font-semibold text-gray-900">
                            {appointment.amount > 0 ? formatCurrency(appointment.amount) : 'Pending quote'}
                          </span>
                        </div>
                      </div>
                      <div>{renderPaymentStatus(appointment)}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end md:justify-start lg:justify-end">
                    {appointment.can_pay && (
                      <button
                        onClick={() => handlePayNow(appointment)}
                        disabled={payingId === appointment.id}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-orange-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {payingId === appointment.id ? 'Redirecting…' : `Pay ${formatCurrency(appointment.amount)}`}
                      </button>
                    )}
                    <button
                      onClick={() => handleMessageTrainer(appointment.trainer)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors"
                    >
                      <MessageSquare size={16} />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

type StatCardProps = { label: string; value: string; trend: string }
function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-2">
      <p className="text-sm text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-emerald-600 font-medium">{trend}</p>
    </div>
  )
}

type ActionLinkProps = { to: string; title: string; description: string }
function ActionLink({ to, title, description }: ActionLinkProps) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 hover:border-orange-400 hover:shadow-md transition">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <span className="text-orange-500 text-sm font-semibold">Open</span>
    </Link>
  )
}

type MetricProps = { label: string; value: string; helper: string }
function Metric({ label, value, helper }: MetricProps) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{helper}</p>
    </div>
  )
}

type ProfilePillProps = { label: string; value: string }
function ProfilePill({ label, value }: ProfilePillProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}
