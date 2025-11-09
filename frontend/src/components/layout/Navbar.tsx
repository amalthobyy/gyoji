import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/goals', label: 'Goals' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/calls', label: 'Calls' },
  { to: '/store', label: 'Store' },
  { to: '/calculator', label: 'Calculator' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 ${scrolled ? 'backdrop-blur-lg bg-white/95 shadow-md' : 'bg-white shadow-sm'}`}>
      <nav className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full max-w-screen-xl">
        <Link to="/" className="font-extrabold text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors">Gyoji</Link>

        <div className="hidden lg:flex items-center justify-between gap-6 flex-1 pl-8">
          <nav className="flex items-center gap-6 flex-wrap">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${isActive ? 'font-semibold text-orange-500' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.is_superuser && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center rounded-full border border-orange-300 text-orange-500 px-4 py-2 text-sm font-semibold hover:bg-orange-50 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-5 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center rounded-full bg-gray-800 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-gray-900 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-5 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-top border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-screen-xl px-4 py-3 flex flex-col gap-3">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({isActive}) => `py-1 text-gray-700 ${isActive ? 'font-semibold text-orange-500' : ''}`}>{l.label}</NavLink>
            ))}
            <div className="flex gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  {user?.is_superuser && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="inline-flex items-center rounded-full border border-orange-300 text-orange-500 px-4 py-2 text-sm font-semibold hover:bg-orange-50 transition-colors">Admin</Link>
                  )}
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl">Dashboard</Link>
                  <button onClick={() => { logout(); setOpen(false) }} className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl">Get Started</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
