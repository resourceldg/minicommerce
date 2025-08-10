export interface Furniture {
	id: number;
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
	stock?: number;
}

export interface CartItem {
	id: number;
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
	quantity: number;
}

export interface WhatsAppOrder {
	customerName: string;
	customerPhone: string;
	items: CartItem[];
	total: number;
	message: string;
}

export interface Category {
	id: string;
	name: string;
	icon: string;
	active: boolean;
} 