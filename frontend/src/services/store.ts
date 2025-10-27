import { api, publicApi } from './api';

// Types
export type Product = {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	stock_quantity: number;
	images: ProductImage[];
};

export type ProductImage = {
	id: string;
	image: string;
};

export type CartItem = {
	id: string;
	product: Product;
	quantity: number;
	price: number;
};

export type Order = {
	id: string;
	total_amount: number;
	status: string;
	created_at: string;
	order_items: OrderItem[];
};

export type OrderItem = {
	id: string;
	product: Product;
	quantity: number;
	price: number;
};

// API functions
export async function getProducts(): Promise<Product[]> {
	const response = await publicApi.get('/products/');
	return response.data.results || response.data;
}

export async function getProductById(id: string): Promise<Product> {
	const response = await publicApi.get(`/products/${id}/`);
	return response.data;
}

export async function getCart(): Promise<CartItem[]> {
	const response = await api.get('/cart/');
	return response.data.items || [];
}

export async function addToCart(productId: string, quantity: number = 1): Promise<void> {
	await api.post('/cart/items/', {
		product: productId,
		quantity,
	});
}

export async function updateCartItem(itemId: string, quantity: number): Promise<void> {
	await api.patch(`/cart/items/${itemId}/`, { quantity });
}

export async function removeFromCart(itemId: string): Promise<void> {
	await api.delete(`/cart/items/${itemId}/`);
}

export async function clearCart(): Promise<void> {
	await api.delete('/cart/');
}

export async function createOrder(orderData: {
	shipping_address: string;
	payment_method: string;
}): Promise<Order> {
	const response = await api.post('/orders/', orderData);
	return response.data;
}

export async function getOrders(): Promise<Order[]> {
	const response = await api.get('/orders/');
	return response.data.results || response.data;
}

export async function getOrderById(id: string): Promise<Order> {
	const response = await api.get(`/orders/${id}/`);
	return response.data;
}

// Utility functions
export function cartTotals(items: CartItem[]) {
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const shipping = subtotal > 50 ? 0 : 4.99;
	const tax = subtotal * 0.07;
	const total = subtotal + shipping + tax;
	return { subtotal, shipping, tax, total };
}
