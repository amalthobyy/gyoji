import { useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
	const ref = useRef<T | null>(null)
	const [inView, setInView] = useState(false)

	useEffect(() => {
		if (!ref.current) return
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setInView(true)
				observer.disconnect()
			}
		}, options || { threshold: 0.15 })
		observer.observe(ref.current)
		return () => observer.disconnect()
	}, [options])

	return { ref, inView }
}
