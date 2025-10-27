import { useParams } from 'react-router-dom';
import { getProductById, addToCart } from '../services/store';
import { useEffect, useState } from 'react';
import Skeleton from '../components/ui/Skeleton';

export default function ProductDetailPage() {
	const { id } = useParams();
	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [active, setActive] = useState(0);
	const [qty, setQty] = useState(1);


	useEffect(() => {
		async function fetchProduct() {
			if (!id) return;
			try {
				const data = await getProductById(id);
				setProduct(data);
			} catch (err) {
				setError('Failed to load product');
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchProduct();
	}, [id]);

	async function add() {
		if (!product) return;
		try {
			await addToCart(product.id, qty);
			alert('Added to cart');
		} catch (err) {
			alert('Failed to add to cart');
			console.error(err);
		}
	}

	if (loading) return (
		<div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
			<div>
				<Skeleton className="aspect-square w-full rounded-xl" />
				<div className="mt-3 grid grid-cols-4 gap-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="aspect-square w-full rounded-lg" />
					))}
				</div>
			</div>
			<div className="space-y-3">
				<Skeleton className="h-8 w-2/3 rounded" />
				<Skeleton className="h-6 w-1/3 rounded" />
				<Skeleton className="h-20 w-full rounded" />
				<Skeleton className="h-10 w-48 rounded" />
			</div>
		</div>
	);
	if (error || !product) return <div className="max-w-6xl mx-auto p-6 text-red-600">{error || 'Product not found'}</div>;

	const images = product.images || [];
const mainImage = images[active]?.image || 'https://via.placeholder.com/600x600?text=No+Image';

function onImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image'
}

return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Gallery */}
			<div>
				<div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img src={mainImage} onError={onImgError} alt={product.name} className="w-full h-full object-cover" />
				</div>
				{images.length > 1 && (
					<div className="mt-3 grid grid-cols-4 gap-3">
						{images.map((img: any, i: number) => (
							<button key={i} onClick={() => setActive(i)} className={`aspect-square rounded-lg overflow-hidden border ${active===i?'border-blue-600':'border-transparent'}`}>
                            <img src={img.image} onError={(e)=>{(e.currentTarget as HTMLImageElement).src='https://via.placeholder.com/120x120?text=No+Image'}} alt="thumb" className="w-full h-full object-cover" />
							</button>
						))}
					</div>
				)}
			</div>

			{/* Info */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
				<div className="mt-2 text-blue-600 text-2xl font-bold">${product.price.toFixed(2)}</div>
				<div className="mt-2 text-sm text-gray-500">{product.category}</div>
				<p className="mt-4 text-gray-700">{product.description}</p>

				{/* Stock Status */}
				<div className="mt-4">
					<div className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
						{product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
					</div>
				</div>

				{/* Quantity */}
				<div className="mt-6 flex items-center gap-3">
					<input 
						type="number" 
						min={1} 
						max={product.stock_quantity} 
						value={qty} 
						onChange={e=>setQty(parseInt(e.target.value||'1'))} 
						className="w-20 border rounded-lg px-2 py-2" 
						disabled={product.stock_quantity === 0}
					/>
					<button 
						onClick={add} 
						disabled={product.stock_quantity === 0}
						className={`inline-flex items-center rounded-lg px-5 py-2.5 ${
							product.stock_quantity === 0 
								? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
								: 'bg-gray-800 text-white hover:bg-gray-900'
						}`}
					>
						{product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
					</button>
				</div>
			</div>
		</div>
	);
}