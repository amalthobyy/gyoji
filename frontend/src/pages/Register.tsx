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
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="border p-2 w-full rounded-md" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          {fe('username') && <p className="text-red-600 text-xs mt-1">{fe('username')}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="border p-2 w-full rounded-md" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          {fe('email') && <p className="text-red-600 text-xs mt-1">{fe('email')}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="border p-2 w-full rounded-md" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {fe('password') && <p className="text-red-600 text-xs mt-1">{fe('password')}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input className="border p-2 w-full rounded-md" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select className="border p-2 w-full rounded-md" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="bg-black text-white px-4 py-2 w-full rounded-md">
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <p className="text-sm mt-3">Already have an account? <Link to="/login" className="underline">Sign in</Link></p>
    </div>
  )
}
