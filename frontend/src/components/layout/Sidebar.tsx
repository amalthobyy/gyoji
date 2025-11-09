import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Dumbbell, Target, Salad, ShoppingBag, BarChart3, MessageSquare, Users, CalendarCheck2 } from 'lucide-react'

export default function Sidebar() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return null

  const userItems = [
    { to: '/dashboard', label: 'Overview', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: Users },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell },
    { to: '/nutrition', label: 'Nutrition', icon: Salad },
    { to: '/store', label: 'Store', icon: ShoppingBag },
    { to: '/chat', label: 'Messages', icon: MessageSquare },
  ]

  const trainerItems = [
    { to: '/dashboard', label: 'Trainer Hub', icon: BarChart3 },
    { to: '/trainers', label: 'Your Profile', icon: Users },
    { to: '/chat', label: 'Messages', icon: MessageSquare },
    { to: '/calls', label: 'Calls', icon: CalendarCheck2 },
    { to: '/store', label: 'Store', icon: ShoppingBag },
  ]

  const items = user?.role === 'trainer' ? trainerItems : userItems

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-white border-r z-20 overflow-y-auto">
      <div className="p-4 space-y-1">
        {items.map(i => {
          const Icon = i.icon
          const active = location.pathname === i.to
          return (
            <Link
              key={i.to}
              to={i.to}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-gradient-to-r from-orange-500/10 to-teal-500/10 text-gray-900'
                  : 'text-gray-600 hover:bg-neutral-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} /> {i.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
