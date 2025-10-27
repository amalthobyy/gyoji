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
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-40 transition ${scrolled ? 'backdrop-blur bg-white/80 shadow-md' : 'bg-white shadow-md'}`}>
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl tracking-tight text-gray-900">Gyoji</Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({isActive}) => `text-sm text-gray-700 hover:text-gray-900 ${isActive ? 'font-semibold text-blue-600' : ''}`}>{l.label}</NavLink>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="ml-2 inline-flex items-center rounded-full bg-blue-600 text-white px-5 py-2 text-sm shadow hover:bg-blue-700">Dashboard</Link>
              <button onClick={logout} className="inline-flex items-center rounded-full bg-gray-800 text-white px-4 py-2 text-sm shadow hover:bg-gray-900">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="ml-2 inline-flex items-center rounded-full bg-blue-600 text-white px-5 py-2 text-sm shadow hover:bg-blue-700">Get Started</Link>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({isActive}) => `py-1 text-gray-700 ${isActive ? 'font-semibold text-blue-600' : ''}`}>{l.label}</NavLink>
            ))}
            <div className="flex gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700">Dashboard</Link>
                  <button onClick={() => { logout(); setOpen(false) }} className="inline-flex items-center rounded-full border px-4 py-2 text-sm">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700">Get Started</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
