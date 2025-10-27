import { useEffect, useState } from 'react';
import Skeleton from '../components/ui/Skeleton';
import ProductCard from '../components/store/ProductCard';
import { getProducts, addToCart, Product } from '../services/store';

export default function StorePage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);


	useEffect(() => {
		async function fetchProducts() {
			try {
				const data = await getProducts();
				setProducts(data);
			} catch (err) {
				setError('Failed to load products');
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchProducts();
	}, []);

	async function handleAdd(product: Product) {
		try {
			await addToCart(product.id, 1);
			alert('Added to cart');
		} catch (err) {
			alert('Failed to add to cart');
			console.error(err);
		}
	}

	if (loading) return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="mb-6">
				<div className="h-8 w-40"><Skeleton className="h-8 w-40 rounded" /></div>
				<div className="mt-2 h-4 w-64"><Skeleton className="h-4 w-64 rounded" /></div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="bg-white rounded-xl shadow-xl overflow-hidden">
						<Skeleton className="aspect-[4/3] w-full" />
						<div className="p-4 space-y-2">
							<Skeleton className="h-5 w-3/4 rounded" />
							<Skeleton className="h-4 w-1/3 rounded" />
							<Skeleton className="h-9 w-full rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
	if (error) return <div className="max-w-6xl mx-auto p-6 text-red-600">{error}</div>;

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Store</h1>
				<p className="text-gray-600">Shop apparel, gear and accessories</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{products.map(p => (
					<div key={p.id} className="[&>*]:transition-transform [&>*]:duration-200 hover:[&>*]:-translate-y-1">
						<ProductCard product={p} onAdd={handleAdd} />
					</div>
				))}
			</div>
		</div>
	);
}
