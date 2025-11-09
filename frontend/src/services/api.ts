import axios from 'axios'
import { toastPush } from './toast-bridge'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: false,
})

// Public client (no auth header), for AllowAny endpoints
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access')
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token))
  pendingRequests = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const skipErrorToast = original?.skipErrorToast || false
    
    // Network errors
    if (!error.response) {
      if (!skipErrorToast) {
        toastPush('error', 'Network error. Check your connection.')
      }
      return Promise.reject(error)
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh')
      if (!refresh) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true
      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, { refresh })
        localStorage.setItem('access', data.access)
        if (data.refresh) {
          localStorage.setItem('refresh', data.refresh)
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:token', { detail: { access: data.access, refresh: data.refresh } }))
        }
        onRefreshed(data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch (e) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        if (!skipErrorToast) {
          toastPush('error', 'Session expired. Please log in again.')
        }
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    // Generic API error - only show toast if not skipped
    if (!skipErrorToast) {
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Something went wrong.'
      toastPush('error', msg)
    }
    return Promise.reject(error)
  }
)
