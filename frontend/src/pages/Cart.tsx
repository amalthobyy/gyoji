import { getCart, updateCartItem, removeFromCart, cartTotals, CartItem } from '../services/store';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CartPage() {
	const [items, setItems] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchCart() {
			try {
				const data = await getCart();
				setItems(data);
			} catch (err) {
				setError('Failed to load cart');
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchCart();
	}, []);

	async function onQtyChange(itemId: string, q: number) {
		try {
			await updateCartItem(itemId, q);
			const data = await getCart();
			setItems(data);
		} catch (err) {
			alert('Failed to update quantity');
			console.error(err);
		}
	}

	async function onRemove(itemId: string) {
		try {
			await removeFromCart(itemId);
			const data = await getCart();
			setItems(data);
		} catch (err) {
			alert('Failed to remove item');
			console.error(err);
		}
	}

	if (loading) return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
	if (error) return <div className="max-w-6xl mx-auto p-6 text-red-600">{error}</div>;

	const totals = cartTotals(items);

	if (items.length === 0) return (
		<div className="max-w-6xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Your Cart</h1>
			<p className="text-gray-600">Your cart is empty.</p>
			<Link to="/store" className="inline-block mt-4 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Go shopping</Link>
		</div>
	);

	return (
		<div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div className="lg:col-span-2 bg-white rounded-xl shadow-xl p-4">
				<h1 className="text-2xl font-bold mb-4">Your Cart</h1>
				<div className="divide-y">
					{items.map((item) => (
						<div key={item.id} className="py-4 flex items-center gap-4">
							<img 
								src={item.product.images?.[0]?.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
								alt={item.product.name} 
								className="w-20 h-20 rounded-lg object-cover" 
							/>
							<div className="flex-1">
								<div className="font-medium">{item.product.name}</div>
								<div className="text-sm text-gray-500">{item.product.category}</div>
								<div className="text-sm text-gray-600">${item.price.toFixed(2)}</div>
							</div>
							<div className="flex items-center gap-2">
								<input 
									type="number" 
									min={1} 
									value={item.quantity} 
									onChange={e=>onQtyChange(item.id, parseInt(e.target.value||'1'))} 
									className="w-20 border rounded-lg px-2 py-2" 
								/>
								<button onClick={()=>onRemove(item.id)} className="text-red-600 hover:underline">Remove</button>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-xl p-4 h-fit">
				<h2 className="text-xl font-semibold mb-3">Order Summary</h2>
				<div className="space-y-2 text-sm">
					<div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
					<div className="flex justify-between"><span>Shipping</span><span>${totals.shipping.toFixed(2)}</span></div>
					<div className="flex justify-between"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
					<div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
				</div>
				<Link to="/checkout" className="block mt-4 rounded-lg bg-blue-600 text-white text-center px-4 py-2 hover:bg-blue-700">Checkout</Link>
			</div>
		</div>
	);
}
