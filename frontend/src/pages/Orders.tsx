import { useEffect, useState } from 'react';
import { getOrders, Order } from '../services/store';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchOrders() {
			try {
				const data = await getOrders();
				setOrders(data);
			} catch (err) {
				setError('Failed to load orders');
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchOrders();
	}, []);

	if (loading) return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
	if (error) return <div className="max-w-6xl mx-auto p-6 text-red-600">{error}</div>;

	return (
		<div className="max-w-6xl mx-auto p-6">
			<h1 className="text-3xl font-bold text-gray-900 mb-4">Order History</h1>
			<div className="bg-white rounded-xl shadow-xl divide-y">
				{orders.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						<p className="text-lg font-medium">No orders yet</p>
						<p className="text-sm">Start shopping to see your orders here</p>
						<Link to="/store" className="inline-block mt-4 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-6 py-3 font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl">Go Shopping</Link>
					</div>
				) : (
					orders.map(order => (
						<div key={order.id} className="p-4 flex items-center justify-between">
							<div>
								<div className="font-semibold">Order #{order.id}</div>
								<div className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</div>
								<div className="text-sm text-gray-500">{order.order_items?.length || 0} items</div>
							</div>
							<div className="text-sm">{formatCurrency(order.total_amount)}</div>
							<span className={`px-2 py-1 rounded-full text-xs ${
								order.status === 'completed' ? 'bg-green-100 text-green-800' :
								order.status === 'processing' ? 'bg-orange-100 text-orange-700' :
								order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
								order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
								'bg-gray-100 text-gray-600'
							}`}>{order.status}</span>
							<Link to="/store" className="text-blue-600 hover:underline">Shop again</Link>
						</div>
					))
				)}
			</div>
		</div>
	);
}
