type ToastType = 'success' | 'error' | 'info'

let handler: ((type: ToastType, message: string) => void) | null = null

export function registerToast(fn: (type: ToastType, message: string) => void) {
	handler = fn
}

export function toastPush(type: ToastType, message: string) {
	if (handler) handler(type, message)
	else if (type !== 'info') console[type === 'error' ? 'error' : 'log'](message)
}
