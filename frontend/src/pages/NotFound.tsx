import { Link } from 'react-router-dom'

export default function NotFoundPage() {
	return (
		<div className="min-h-[60vh] grid place-items-center p-6">
			<div className="text-center">
				<h1 className="text-5xl font-extrabold text-gray-900">404</h1>
				<p className="mt-2 text-gray-600">We couldn't find that page.</p>
				<Link to="/" className="mt-4 inline-block rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-6 py-3 font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl">Go Home</Link>
			</div>
		</div>
	)
}
