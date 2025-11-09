import { ShoppingCart } from 'lucide-react'
import { formatCurrency } from '../../utils/format'

type Props = {
  product: {
    id: number
    name: string
    description: string
    price: number
    primary_image?: string | null
  }
  onAdd: (id: number) => void
}

export default function ProductCard({ product, onAdd }: Props) {
  return (
    <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <img src={product.primary_image || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop'} alt={product.name} className="h-56 w-full object-cover" />
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="mt-1 text-orange-600 font-bold">{formatCurrency(product.price)}</div>
        <button
          onClick={() => onAdd(product.id)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-5 py-2.5 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl"
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </article>
  )
}
