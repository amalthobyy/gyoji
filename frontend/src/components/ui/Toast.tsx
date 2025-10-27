import React, { createContext, useContext, useState, useCallback } from 'react'
import { registerToast } from '../../services/toast-bridge'

type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string }

type ToastContextType = {
	push: (type: Toast['type'], message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error('useToast must be used within ToastProvider')
	return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const push = useCallback((type: Toast['type'], message: string) => {
		const id = Date.now()
		setToasts((prev) => [...prev, { id, type, message }])
		setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== id)), 3500)
	}, [])

  // Register bridge for non-React modules
  React.useEffect(() => {
    registerToast(push)
  }, [push])

	return (
		<ToastContext.Provider value={{ push }}>
			{children}
			<div className="fixed top-4 right-4 z-50 space-y-2">
				{toasts.map(t => (
					<div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white ${
						t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
					}`}>{t.message}</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}
