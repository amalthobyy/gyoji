import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { toastPush } from '../services/toast-bridge'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const googleInitialized = useRef(false)

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  function validate() {
    if (!username || !password) return 'Please fill in all fields'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const handleGoogleCredential = useCallback(
    async (credentialResponse: { credential?: string }) => {
      if (!credentialResponse?.credential) {
        toastPush('error', 'Google sign-in failed. Please try again.')
        return
      }
      try {
        setGoogleLoading(true)
        const user = await loginWithGoogle(credentialResponse.credential)
        if (user?.is_superuser) {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      } catch (err: any) {
        console.error('Google login error', err)
        const msg = err?.response?.data?.detail || 'Unable to sign in with Google right now.'
        toastPush('error', msg)
      } finally {
        setGoogleLoading(false)
      }
    },
    [loginWithGoogle, navigate]
  )

  useEffect(() => {
    if (!googleClientId) {
      setGoogleError('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your env.')
      return
    }

    if (googleInitialized.current) return

    const initialize = () => {
      if (!window.google || !googleButtonRef.current || googleInitialized.current) return
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      })
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
      })
      googleInitialized.current = true
      setGoogleReady(true)
    }

    const existingScript = document.getElementById('google-identity-services') as HTMLScriptElement | null
    if (existingScript) {
      if (window.google) {
        initialize()
      } else {
        existingScript.addEventListener('load', initialize, { once: true })
      }
      return () => existingScript.removeEventListener('load', initialize)
    }

    const script = document.createElement('script')
    script.id = 'google-identity-services'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initialize
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script')
      setGoogleError('Unable to load Google sign-in right now. Please try again later.')
    }
    document.head.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [googleClientId, handleGoogleCredential])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    if (v) { setError(v); return }
    setLoading(true)
    setError(null)
    try {
      const loggedIn = await login(username, password)
      if (loggedIn?.is_superuser) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-1">Log in to continue your fitness journey.</p>

            <form onSubmit={onSubmit} className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                <input 
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
                  placeholder="email" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
                <input 
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium">Forgot password?</Link>
              </div>
              <button 
                disabled={loading} 
                className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-4 py-3 font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center gap-2">
                <div ref={googleButtonRef} className={googleLoading ? 'opacity-60 pointer-events-none' : ''} />
                {!googleReady && !googleError && googleClientId && (
                  <p className="text-xs text-gray-500">Loading Google sign-in…</p>
                )}
                {googleError && (
                  <p className="text-xs text-red-500 text-center">{googleError}</p>
                )}
              </div>
            </div>

            <p className="text-sm mt-6 text-center text-gray-700">
              No account?{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 hover:underline font-semibold">
                Create one
              </Link>
            </p>
          </div>
          <div className="bg-gray-50 px-6 py-5 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white grid place-items-center flex-shrink-0">
                💪
              </div>
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
