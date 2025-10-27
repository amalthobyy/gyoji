import React from 'react'

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
	constructor(props: any) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	componentDidCatch(error: any, info: any) {
		console.error('ErrorBoundary caught:', error, info)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-[50vh] grid place-items-center p-6">
					<div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
						<h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
						<p className="text-gray-600 mb-4">Please try refreshing the page.</p>
						<button onClick={()=>location.reload()} className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Reload</button>
					</div>
				</div>
			)
		}
		return this.props.children
	}
}
