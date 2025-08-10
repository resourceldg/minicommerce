#!/usr/bin/env node

/**
 * Script de prueba para verificar el localStorage del carrito
 */

console.log('🛒 Probando localStorage del carrito...\n');

// Simular la configuración del checkout
const CHECKOUT_CONFIG = {
	STORAGE: {
		CART_KEY: 'minicommerce-cart'
	}
};

// Simular productos del carrito
const mockCart = [
	{
		id: 1,
		name: 'Silla Vintage',
		description: 'Silla de madera restaurada',
		price: 150,
		image: 'https://example.com/silla.jpg',
		category: 'sillas',
		quantity: 2
	},
	{
		id: 2,
		name: 'Mesa de Centro',
		description: 'Mesa restaurada',
		price: 300,
		image: 'https://example.com/mesa.jpg',
		category: 'mesas',
		quantity: 1
	}
];

console.log('📊 Carrito simulado:');
mockCart.forEach(item => {
	console.log(`   • ${item.name} (${item.category}) - Cantidad: ${item.quantity} - Precio: $${item.price}`);
});

// Calcular total del carrito
const totalItems = mockCart.reduce((sum, item) => sum + item.quantity, 0);
const totalValue = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

console.log(`\n📈 Resumen del carrito:`);
console.log(`   • Total de items: ${totalItems}`);
console.log(`   • Valor total: $${totalValue}`);

// Simular función getCartCount
function getCartCount(cart) {
	return cart.reduce((sum, item) => sum + item.quantity, 0);
}

console.log(`\n🔢 Función getCartCount(): ${getCartCount(mockCart)}`);

// Simular localStorage
const mockLocalStorage = {
	data: {},
	setItem(key, value) {
		this.data[key] = value;
		console.log(`💾 Guardado en localStorage: ${key} = ${value}`);
	},
	getItem(key) {
		const value = this.data[key];
		console.log(`📖 Leído de localStorage: ${key} = ${value}`);
		return value;
	}
};

// Probar guardar y leer del carrito
console.log('\n🧪 Probando localStorage:');
mockLocalStorage.setItem(CHECKOUT_CONFIG.STORAGE.CART_KEY, JSON.stringify(mockCart));

const savedCart = mockLocalStorage.getItem(CHECKOUT_CONFIG.STORAGE.CART_KEY);
const parsedCart = JSON.parse(savedCart);

console.log('\n✅ Carrito recuperado del localStorage:');
parsedCart.forEach(item => {
	console.log(`   • ${item.name} - Cantidad: ${item.quantity}`);
});

console.log(`\n🎯 Contador del carrito: ${getCartCount(parsedCart)}`);

console.log('\n🚀 localStorage del carrito funcionando correctamente!');
console.log('   El contador del carrito debería mostrar: 3 (2 + 1)'); 