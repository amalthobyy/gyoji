import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    if (!username || !password) return 'Please fill in all fields'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    if (v) { setError(v); return }
    setLoading(true)
    setError(null)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-1">Log in to continue your fitness journey.</p>

            <form onSubmit={onSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Email</label>
                <input className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">Password</label>
                <input className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
              </div>
              <button disabled={loading} className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2.5 shadow hover:bg-blue-700 transition">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p className="text-sm mt-4 text-gray-700">No account? <Link to="/register" className="text-blue-600 hover:underline">Create one</Link></p>
          </div>
          <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white grid place-items-center">💪</div>
              <div>
                <div className="font-semibold text-gray-900">Train smarter</div>
                <div>Certified trainers, personalized plans, real results.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
