import { Link } from 'react-router-dom'
import { Product } from '../../services/store'

export default function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
	const mainImage = product.images?.[0]?.image || 'https://via.placeholder.com/300x300?text=No+Image';

	function onImgError(e: React.SyntheticEvent<HTMLImageElement>) {
		(e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image'
	}
	
	return (
		<div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
			<Link to={`/store/${product.id}`} className="block aspect-[4/3] bg-gray-100">
				<img src={mainImage} onError={onImgError} alt={product.name} className="w-full h-full object-cover" />
			</Link>
			<div className="p-4 flex-1 flex flex-col">
				<Link to={`/store/${product.id}`} className="font-semibold text-gray-900 line-clamp-1">{product.name}</Link>
				<div className="mt-1 text-blue-600 font-bold">${product.price.toFixed(2)}</div>
				<div className="mt-1 text-sm text-gray-500">{product.category}</div>
				<button 
					onClick={() => onAdd(product)} 
					disabled={product.stock_quantity === 0}
					className={`mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 ${
						product.stock_quantity === 0 
							? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
							: 'bg-gray-800 text-white hover:bg-gray-900'
					}`}
				>
					{product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
				</button>
			</div>
		</div>
	)
}
