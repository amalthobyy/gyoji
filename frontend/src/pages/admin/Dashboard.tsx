import { useEffect, useState } from 'react'
import { getAdminStats, AdminStats } from '../../services/admin'
import Skeleton from '../../components/ui/Skeleton'
import { toastPush } from '../../services/toast-bridge'

const totalLabels: Record<keyof AdminStats['totals'], string> = {
  users: 'Total Users',
  trainers: 'Trainers',
  workouts: 'Workouts',
  diet_plans: 'Diet Plans',
  hirings: 'Hiring Requests',
  pending_hirings: 'Pending Approvals',
  chat_rooms: 'Chat Rooms',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => {
        console.error(err)
        toastPush('error', 'Unable to load admin dashboard data.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold">Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">Track platform activity and content at a glance.</p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : stats ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(stats.totals) as Array<keyof AdminStats['totals']>).map((key) => (
            <article key={key} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{totalLabels[key]}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totals[key].toLocaleString()}</p>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Unable to load totals right now.
        </div>
      )}

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Newest Members</h2>
          <p className="text-sm text-slate-500">Latest sign ups across all roles.</p>
          {loading ? (
            <Skeleton className="h-40 rounded-xl mt-4" />
          ) : stats && stats.recent_users.length ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {stats.recent_users.map((user) => (
                <li key={user.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="font-semibold text-orange-500 uppercase tracking-wide">{user.role}</p>
                    <p>{new Date(user.date_joined).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No users found.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent Trainer Requests</h2>
          <p className="text-sm text-slate-500">Latest hiring activity awaiting action.</p>
          {loading ? (
            <Skeleton className="h-40 rounded-xl mt-4" />
          ) : stats && stats.recent_hirings.length ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {stats.recent_hirings.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.user_name}</p>
                    <p className="text-xs text-slate-500">Trainer: {item.trainer_name}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 uppercase tracking-wide">{item.status}</p>
                    {item.start_date && <p>{new Date(item.start_date).toLocaleDateString()}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No hiring requests yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
