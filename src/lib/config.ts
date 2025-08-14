// Configuración centralizada de la aplicación
export const config = {
	// Información de la tienda
	store: {
		name: 'Muebles Restaurados',
		description: 'Muebles restaurados únicos y artesanales',
		phone: '+542236202061', // Número real de WhatsApp
		email: 'info@mueblesrestaurados.com',
		address: 'Tu dirección aquí'
	},

	// Configuración de WhatsApp
	whatsapp: {
		number: '+542236202061', // Número real de WhatsApp
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
	WHATSAPP_NUMBER: '+542236202061', // Número real para recibir pedidos
	
	// Nombre de la tienda
	STORE_NAME: 'Rare&Magic',
	
	// Moneda por defecto
	DEFAULT_CURRENCY: 'USD',
	
	// Configuración de la API
	API_BASE_URL: '/api',
	
	// Configuración de imágenes
	IMAGE_PLACEHOLDER: '/images/placeholder.svg'
};

// Configuración de la base de datos (solo para servidor)
export const DB_CONFIG = {
	// Variables de entorno para PostgreSQL
	POSTGRES_URL: getEnvVar('POSTGRES_URL'),
	POSTGRES_HOST: getEnvVar('POSTGRES_HOST'),
	POSTGRES_DATABASE: getEnvVar('POSTGRES_DATABASE'),
	POSTGRES_USERNAME: getEnvVar('POSTGRES_USERNAME'),
	POSTGRES_PASSWORD: getEnvVar('POSTGRES_PASSWORD'),
	
	// Verificar si tenemos configuración de base de datos
	hasDatabaseConfig() {
		return !!(this.POSTGRES_URL || (this.POSTGRES_HOST && this.POSTGRES_DATABASE && this.POSTGRES_USERNAME && this.POSTGRES_PASSWORD));
	},
	
	// Verificar si estamos en desarrollo local
	isDevelopment() {
		return getEnvVar('NODE_ENV') === 'development';
	}
};

// Función helper para obtener variables de entorno de forma segura
function getEnvVar(key: string): string {
	// En el navegador, usar import.meta.env (Vite)
	if (typeof window !== 'undefined') {
		return import.meta.env[key] || '';
	}
	
	// En el servidor, usar process.env
	if (typeof process !== 'undefined' && process.env) {
		return process.env[key] || '';
	}
	
	return '';
}

// Función helper para obtener la URL de WhatsApp (más confiable para WhatsApp Business)
export function getWhatsAppUrl(message: string): string {
	const phoneNumber = config.whatsapp.number.replace('+', '');
	// Usar la API de WhatsApp Business que es más confiable
	return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
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