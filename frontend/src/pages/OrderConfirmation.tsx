import { useLocation, Link } from 'react-router-dom'

export default function OrderConfirmationPage() {
	const loc = useLocation() as any
	const orderId = loc.state?.orderId || 'ORD-UNKNOWN'
	const total = loc.state?.total || 0
	return (
		<div className="max-w-3xl mx-auto p-6 text-center">
			<div className="bg-white rounded-xl shadow-xl p-10">
				<h1 className="text-3xl font-bold text-gray-900">Thank you!</h1>
				<p className="mt-2 text-gray-600">Your order has been placed successfully.</p>
				<div className="mt-6">
					<div className="text-sm text-gray-500">Order ID</div>
					<div className="text-xl font-semibold">{orderId}</div>
					<div className="mt-3 text-sm text-gray-500">Total Paid</div>
					<div className="text-xl font-semibold">${Number(total).toFixed(2)}</div>
				</div>
				<div className="mt-8 flex justify-center gap-3">
					<Link to="/store" className="rounded-lg border px-4 py-2">Continue Shopping</Link>
					<Link to="/orders" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">View Orders</Link>
				</div>
			</div>
		</div>
	)
}
