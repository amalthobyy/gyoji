import { useState } from 'react';
import { getCart, cartTotals, createOrder, clearCart } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function CheckoutPage() {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [city, setCity] = useState('');
	const [zip, setZip] = useState('');
	const [payment, setPayment] = useState<'card'|'cod'>('card');
	const navigate = useNavigate();

	useEffect(() => {
		async function fetchCart() {
			try {
				const data = await getCart();
				setItems(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchCart();
	}, []);

	async function placeOrder(e: React.FormEvent) {
		e.preventDefault();
		if (items.length === 0) return;
		
		setSubmitting(true);
		try {
			const totals = cartTotals(items);
			const orderData = {
				shipping_address: `${name}, ${address}, ${city}, ${zip}`,
				payment_method: payment,
			};
			
			const order = await createOrder(orderData);
			await clearCart();
			navigate('/order-confirmation', { 
				state: { 
					orderId: order.id, 
					total: totals.total 
				} 
			});
		} catch (err) {
			alert('Failed to place order');
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
	if (items.length === 0) return <div className="max-w-4xl mx-auto p-6">Your cart is empty.</div>;

	const totals = cartTotals(items);

	return (
		<div className="max-w-4xl mx-auto p-6 grid grid-cols-1 gap-8">
			<form onSubmit={placeOrder} className="bg-white rounded-xl shadow-xl p-6">
				<h1 className="text-2xl font-bold mb-4">Checkout</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="text-sm text-gray-600">Full Name</label>
						<input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" required />
					</div>
					<div>
						<label className="text-sm text-gray-600">ZIP</label>
						<input value={zip} onChange={e=>setZip(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" required />
					</div>
					<div className="md:col-span-2">
						<label className="text-sm text-gray-600">Address</label>
						<input value={address} onChange={e=>setAddress(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" required />
					</div>
					<div>
						<label className="text-sm text-gray-600">City</label>
						<input value={city} onChange={e=>setCity(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" required />
					</div>
				</div>

				<div className="mt-6">
					<div className="text-sm font-medium text-gray-700 mb-2">Payment Method</div>
					<div className="flex gap-3">
						<button type="button" onClick={()=>setPayment('card')} className={`px-3 py-2 rounded-lg border ${payment==='card'?'border-blue-600 bg-blue-50':'border-gray-300'}`}>Card</button>
						<button type="button" onClick={()=>setPayment('cod')} className={`px-3 py-2 rounded-lg border ${payment==='cod'?'border-blue-600 bg-blue-50':'border-gray-300'}`}>Cash on Delivery</button>
					</div>
				</div>

				<div className="mt-6 flex items-center justify-between">
					<div className="text-lg font-semibold">Total: ${totals.total.toFixed(2)}</div>
					<button 
						type="submit"
						disabled={submitting}
						className={`rounded-lg px-5 py-2 ${
							submitting 
								? 'bg-gray-400 cursor-not-allowed' 
								: 'bg-blue-600 hover:bg-blue-700'
						} text-white`}
					>
						{submitting ? 'Processing...' : 'Place Order'}
					</button>
				</div>
			</form>
		</div>
	);
}
