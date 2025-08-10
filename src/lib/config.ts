// Configuración centralizada de la aplicación
export const config = {
	// Información de la tienda
	store: {
		name: 'Muebles Restaurados',
		description: 'Muebles restaurados únicos y artesanales',
		phone: '+1234567890', // Cambiar por tu número real
		email: 'info@mueblesrestaurados.com',
		address: 'Tu dirección aquí'
	},

	// Configuración de WhatsApp
	whatsapp: {
		number: '+1234567890', // Cambiar por tu número real
		message: {
			greeting: '🪑 Nuevo Pedido de Muebles Restaurados 🪑',
			products: 'Productos:',
			total: 'Total:',
			closing: '¡Hola! Me gustaría hacer este pedido. ¿Podrías confirmarme disponibilidad y opciones de entrega?'
		}
	},

	// Categorías de productos
	categories: [
		{ id: 'todos', name: 'Todos', icon: '🪑', active: true },
		{ id: 'sillas', name: 'Sillas', icon: '🪑', active: false },
		{ id: 'mesas', name: 'Mesas', icon: '🪑', active: false },
		{ id: 'muebles', name: 'Muebles', icon: '🪑', active: false }
	],

	// Configuración de la API
	api: {
		baseUrl: '/api',
		endpoints: {
			furniture: '/furniture'
		}
	},

	// Configuración de la UI
	ui: {
		itemsPerPage: 12,
		searchDebounce: 300, // ms
		animationDuration: 300, // ms
		breakpoints: {
			mobile: 768,
			tablet: 1024,
			desktop: 1200
		}
	},

	// Configuración del carrito
	cart: {
		maxItems: 50,
		maxQuantity: 10,
		persistenceKey: 'minicommerce-cart'
	}
};

// Configuración de la aplicación
export const APP_CONFIG = {
	// Número de WhatsApp para pedidos (formato internacional)
	WHATSAPP_NUMBER: '+1234567890', // Cambiar por tu número real
	
	// Nombre de la tienda
	STORE_NAME: 'Rare&Magic',
	
	// Moneda por defecto
	DEFAULT_CURRENCY: 'USD',
	
	// Configuración de la API
	API_BASE_URL: '/api',
	
	// Configuración de imágenes
	IMAGE_PLACEHOLDER: '/images/placeholder.svg'
};

// Configuración de la base de datos
export const DB_CONFIG = {
	// Variables de entorno para PostgreSQL
	POSTGRES_URL: process.env.POSTGRES_URL || '',
	POSTGRES_HOST: process.env.POSTGRES_HOST || '',
	POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || '',
	POSTGRES_USERNAME: process.env.POSTGRES_USERNAME || '',
	POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
	
	// Verificar si tenemos configuración de base de datos
	hasDatabaseConfig() {
		return !!(this.POSTGRES_URL || (this.POSTGRES_HOST && this.POSTGRES_DATABASE && this.POSTGRES_USERNAME && this.POSTGRES_PASSWORD));
	},
	
	// Verificar si estamos en desarrollo local
	isDevelopment() {
		return process.env.NODE_ENV === 'development';
	}
};

// Función helper para obtener la URL de WhatsApp
export function getWhatsAppUrl(message: string): string {
	return `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

// Función helper para formatear precios
export function formatPrice(price: number, currency = 'USD'): string {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency
	}).format(price);
}

// Función helper para validar email
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Función helper para validar teléfono
export function isValidPhone(phone: string): boolean {
	const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
	return phoneRegex.test(phone);
} 