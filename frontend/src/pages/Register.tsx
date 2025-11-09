import { useState } from 'react'
import { api } from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', role: 'user' })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    if (!form.username || !form.email || !form.password || !form.confirm) return 'Please fill in all fields'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Enter a valid email'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    if (v) { setError(v); return }
    setLoading(true)
    setError(null)
    setFieldErrors({})
    try {
      await api.post('/auth/register/', { username: form.username, email: form.email, password: form.password, role: form.role })
      navigate('/login')
    } catch (e: any) {
      const data = e?.response?.data
      if (data && typeof data === 'object') {
        setFieldErrors(data)
        setError(data.detail || 'Registration failed')
      } else {
        setError('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const fe = (k: string) => fieldErrors?.[k]?.join(' ')

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white via-white to-gray-50">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8 md:p-10">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
              <p className="text-gray-600">Start tracking workouts, nutrition, and connect with certified trainers.</p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Alex Carter"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                  />
                  {fe('username') && <p className="text-red-600 text-xs mt-2">{fe('username')}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                  {fe('email') && <p className="text-red-600 text-xs mt-2">{fe('email')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  {fe('password') && <p className="text-red-600 text-xs mt-2">{fe('password')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm password</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="trainer">Trainer</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm font-semibold text-center">{error}</p>}

              <button
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-teal-500 text-white px-4 py-3 font-semibold shadow-lg hover:from-orange-600 hover:via-orange-500 hover:to-teal-600 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating…' : 'Create account'}
              </button>
            </form>

            <div className="mt-8 space-y-4 text-center text-sm text-gray-600">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-orange-600 hover:text-orange-700 hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our terms of service and acknowledge our privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
