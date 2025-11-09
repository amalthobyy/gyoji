import { useEffect, useState } from 'react'
import { getAdminUsers } from '../../services/admin'
import { UserProfile } from '../../services/user'
import Skeleton from '../../components/ui/Skeleton'
import { toastPush } from '../../services/toast-bridge'

const roleLabels: Record<string, string> = {
  trainer: 'Trainer',
  user: 'Member',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      try {
        const data = await getAdminUsers({ search: search || undefined, role: role || undefined })
        if (!ignore) setUsers(data)
      } catch (err) {
        console.error(err)
        toastPush('error', 'Unable to load users.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    const handle = window.setTimeout(load, 250)
    return () => {
      ignore = true
      window.clearTimeout(handle)
    }
  }, [search, role])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold">Users</p>
        <h1 className="text-2xl font-bold text-slate-900">Manage members & trainers</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="flex-1 min-w-[220px] sm:max-w-sm rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="">All roles</option>
          <option value="user">Members</option>
          <option value="trainer">Trainers</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6">
                    <Skeleton className="h-14 rounded-xl" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.is_superuser ? (
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-3 py-1 text-xs font-semibold text-white">
                          Admin
                        </span>
                      ) : user.is_staff ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Staff
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
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
