import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, Users, Dumbbell, Salad, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin', label: 'Overview', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/admin/nutrition', label: 'Nutrition', icon: Salad },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-200 bg-white">
        <div className="px-6 py-6 border-b border-slate-200">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Gyoji</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Admin Center</h1>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-slate-200 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{user?.first_name || user?.username}</p>
          <p className="text-xs text-slate-500">Super Admin</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="lg:hidden font-semibold text-lg">Gyoji Admin</span>
            <span className="hidden sm:inline text-sm text-slate-500">Monitor trainers, workouts, and nutrition content</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
