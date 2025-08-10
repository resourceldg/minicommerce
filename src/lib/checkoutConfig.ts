// Configuración para el checkout inteligente
export const CHECKOUT_CONFIG = {
	// Descuentos por volumen
	VOLUME_DISCOUNTS: [
		{ threshold: 500, discount: 0.05, label: '5% descuento por compra mayor a $500' },
		{ threshold: 1000, discount: 0.10, label: '10% descuento por compra mayor a $1000' },
		{ threshold: 2000, discount: 0.15, label: '15% descuento por compra mayor a $2000' }
	],

	// Productos complementarios por categoría
	COMPLEMENTARY_PRODUCTS: {
		sillas: ['mesas', 'iluminacion'],
		mesas: ['sillas', 'decoracion'],
		muebles: ['iluminacion', 'decoracion'],
		iluminacion: ['muebles', 'decoracion'],
		decoracion: ['muebles', 'iluminacion']
	} as Record<string, string[]>,

	// Configuración de entrega
	DELIVERY_ESTIMATES: {
		FAST: { maxItems: 2, maxLargeItems: 0, days: '2-3 días hábiles' },
		STANDARD: { maxItems: 5, maxLargeItems: 1, days: '5-7 días hábiles' },
		EXTENDED: { maxItems: Infinity, maxLargeItems: Infinity, days: '7-10 días hábiles' }
	},

	// Categorías consideradas como "grandes" para entrega
	LARGE_ITEM_CATEGORIES: ['muebles', 'mesas'],

	// Configuración de validaciones
	VALIDATIONS: {
		MAX_QUANTITY_PER_ITEM: 5,
		RECOMMENDATIONS_LIMIT: 3,
		MIN_CART_VALUE_FOR_DISCOUNTS: 100
	},

	// Configuración de persistencia
	STORAGE: {
		CART_KEY: 'minicommerce-cart',
		USER_PREFERENCES_KEY: 'minicommerce-preferences'
	},

	// Configuración de UX
	UX: {
		AUTO_CLOSE_DELAY: 7000, // 7 segundos - tiempo suficiente para agregar productos
		USER_ACTIVITY_THRESHOLD: 5000, // 5 segundos - umbral de actividad del usuario
		ANIMATION_DURATION: 300 // 300ms
	}
};

// Tipos para el checkout inteligente
export interface VolumeDiscount {
	threshold: number;
	discount: number;
	label: string;
}

export interface DeliveryEstimate {
	maxItems: number;
	maxLargeItems: number;
	days: string;
}

export interface CartValidation {
	isValid: boolean;
	messages: string[];
	warnings: string[];
	errors: string[];
}

export interface CheckoutRecommendation {
	product: any;
	reason: string;
	priority: number;
}

// Funciones de utilidad para el checkout
export function calculateVolumeDiscount(subtotal: number, discounts: VolumeDiscount[]): number {
	const applicableDiscount = discounts
		.filter(discount => subtotal >= discount.threshold)
		.sort((a, b) => b.discount - a.discount)[0];
	
	return applicableDiscount ? applicableDiscount.discount : 0;
}

export function estimateDeliveryTime(
	totalItems: number, 
	hasLargeItems: boolean, 
	estimates: Record<string, DeliveryEstimate>
): string {
	if (totalItems <= estimates.FAST.maxItems && !hasLargeItems) {
		return `Entrega en ${estimates.FAST.days}`;
	} else if (totalItems <= estimates.STANDARD.maxItems || hasLargeItems) {
		return `Entrega en ${estimates.STANDARD.days}`;
	} else {
		return `Entrega en ${estimates.EXTENDED.days}`;
	}
}

export function validateCart(
	items: Array<{ item: any; quantity: number }>,
	config: typeof CHECKOUT_CONFIG
): CartValidation {
	const messages: string[] = [];
	const warnings: string[] = [];
	const errors: string[] = [];

	// Validar cantidades
	items.forEach(({ item, quantity }) => {
		if (quantity > config.VALIDATIONS.MAX_QUANTITY_PER_ITEM) {
			warnings.push(`Cantidad alta para ${item.name} - verificar disponibilidad`);
		}
		if (quantity <= 0) {
			errors.push(`Cantidad inválida para ${item.name}`);
		}
	});

	// Validar combinaciones de productos
	const hasChairs = items.some(({ item }) => item.category === 'sillas');
	const hasTables = items.some(({ item }) => item.category === 'mesas');
	
	if (hasChairs && !hasTables) {
		messages.push('💡 Considera agregar una mesa para complementar las sillas');
	}

	if (hasTables && !hasChairs) {
		messages.push('💡 Considera agregar sillas para complementar la mesa');
	}

	// Validar valor mínimo del carrito
	const totalValue = items.reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0);
	if (totalValue < config.VALIDATIONS.MIN_CART_VALUE_FOR_DISCOUNTS) {
		messages.push(`Agrega ${config.VALIDATIONS.MIN_CART_VALUE_FOR_DISCOUNTS - totalValue} más para obtener descuentos`);
	}

	return {
		isValid: errors.length === 0,
		messages,
		warnings,
		errors
	};
} 