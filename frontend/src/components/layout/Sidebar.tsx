import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Dumbbell, Target, Salad, ShoppingBag, BarChart3, MessageSquare } from 'lucide-react'

const items = [
  { to: '/dashboard', label: 'Overview', icon: BarChart3 },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Salad },
  { to: '/store', label: 'Store', icon: ShoppingBag },
  { to: '/chat', label: 'Messages', icon: MessageSquare },
]

export default function Sidebar() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return null

  return (
    <aside className="hidden lg:block w-64 sticky top-16 h-[calc(100vh-4rem)] bg-white border-r z-20">
      <div className="p-4 space-y-1">
        {items.map(i => {
          const Icon = i.icon
          const active = location.pathname === i.to
          return (
            <Link key={i.to} to={i.to} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-neutral-100 ${active ? 'bg-neutral-100 font-medium text-gray-900' : ''}`}>
              <Icon size={18} /> {i.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
