import { useLocation, Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'

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
					<div className="text-xl font-semibold">{formatCurrency(Number(total))}</div>
				</div>
				<div className="mt-8 flex justify-center gap-3">
					<Link to="/store" className="rounded-full border px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">Continue Shopping</Link>
					<Link to="/orders" className="rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-6 py-3 font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl">View Orders</Link>
				</div>
			</div>
		</div>
	)
}
