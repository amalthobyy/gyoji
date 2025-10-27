import { Link } from 'react-router-dom'

export default function NotFoundPage() {
	return (
		<div className="min-h-[60vh] grid place-items-center p-6">
			<div className="text-center">
				<h1 className="text-5xl font-extrabold text-gray-900">404</h1>
				<p className="mt-2 text-gray-600">We couldn't find that page.</p>
				<Link to="/" className="mt-4 inline-block rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Go Home</Link>
			</div>
		</div>
	)
}
