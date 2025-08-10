#!/usr/bin/env node
/**
 * Script de prueba para verificar la carga del carrito desde localStorage
 * y el cálculo correcto del cartCount
 */
console.log('🧪 Probando carga del carrito desde localStorage...\n');

// Simular la configuración del checkout
const CHECKOUT_CONFIG = {
    STORAGE: {
        CART_KEY: 'minicommerce-cart'
    }
};

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

// Simular el estado del carrito como en Svelte
let cart = [];
let cartCount = 0;

// Función getCartCount como en la aplicación
function getCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Cart count updated:', count, 'Items:', cart);
    return count;
}

// Función para cargar desde localStorage (como en onMount)
function loadCartFromStorage() {
    console.log('\n🔄 Simulando onMount - cargando carrito desde localStorage...');
    
    const savedCart = mockLocalStorage.getItem(CHECKOUT_CONFIG.STORAGE.CART_KEY);
    if (savedCart) {
        try {
            const parsedCart = JSON.parse(savedCart);
            // Forzar reactividad de Svelte usando spread operator
            cart = [...parsedCart];
            console.log('✅ Cart loaded from localStorage:', cart);
        } catch (error) {
            console.error('Error parsing saved cart:', error);
            cart = [];
        }
    } else {
        console.log('📭 No saved cart found in localStorage');
    }
    
    // Verificar que cartCount se haya calculado correctamente
    console.log('🔍 After loading cart - cartCount should be:', getCartCount());
}

// Función para agregar al carrito
function addToCart(id, name, price) {
    console.log(`\n➕ Adding to cart: ${name}`);
    console.log('🔄 Before update - cartCount:', cartCount);
    
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex >= 0) {
        // Si ya existe, aumentar cantidad
        cart = cart.map((item, index) => {
            if (index === existingItemIndex) {
                return { ...item, quantity: item.quantity + 1 };
            }
            return item;
        });
        console.log('✅ Updated existing item quantity');
    } else {
        // Si no existe, agregar nuevo item
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
        console.log('✅ Added new item to cart');
    }
    
    console.log('🔄 After update - cartCount should be:', getCartCount());
    console.log('Current cart:', cart);
    
    // Guardar en localStorage
    saveCartToStorage();
    
    // Actualizar cartCount
    cartCount = getCartCount();
}

// Función para guardar en localStorage
function saveCartToStorage() {
    try {
        mockLocalStorage.setItem(CHECKOUT_CONFIG.STORAGE.CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

// Función para limpiar carrito
function clearCart() {
    console.log('\n🗑️ Clearing cart');
    cart = [];
    cartCount = 0;
    saveCartToStorage();
}

// Productos de prueba
const testProducts = [
    {
        id: 1,
        name: 'Silla Vintage',
        description: 'Silla de madera restaurada',
        price: 150,
        image: 'https://example.com/silla.jpg',
        category: 'sillas'
    },
    {
        id: 2,
        name: 'Mesa de Centro',
        description: 'Mesa restaurada',
        price: 300,
        image: 'https://example.com/mesa.jpg',
        category: 'mesas'
    }
];

console.log('📦 Productos de prueba disponibles:');
testProducts.forEach(product => {
    console.log(`   • ${product.name} (ID: ${product.id})`);
});

console.log('\n🚀 Iniciando pruebas de localStorage...\n');

// Prueba 1: Agregar productos al carrito
console.log('=== PRUEBA 1: Agregar productos ===');
addToCart(testProducts[0].id, testProducts[0].name, testProducts[0].price);
addToCart(testProducts[1].id, testProducts[1].name, testProducts[1].price);
addToCart(testProducts[0].id, testProducts[0].name, testProducts[0].price); // Duplicar el primero

console.log('\n=== PRUEBA 2: Verificar localStorage ===');
console.log('Estado actual del localStorage:', mockLocalStorage.data);

console.log('\n=== PRUEBA 3: Simular recarga de página ===');
// Simular que se recarga la página (cart se resetea)
cart = [];
cartCount = 0;
console.log('🔄 Página recargada - cart vacío:', cart);

// Cargar desde localStorage
loadCartFromStorage();

console.log('\n=== PRUEBA 4: Verificar cartCount después de recarga ===');
cartCount = getCartCount();
console.log('🎯 cartCount final después de recarga:', cartCount);

console.log('\n📊 Resumen de las pruebas:');
console.log('   ✅ Productos agregados al carrito');
console.log('   ✅ Carrito guardado en localStorage');
console.log('   ✅ Carrito cargado desde localStorage después de recarga');
console.log('   ✅ cartCount calculado correctamente:', cartCount);

if (cartCount === 3) {
    console.log('\n🎉 ¡ÉXITO! El contador del carrito se está cargando correctamente desde localStorage');
} else {
    console.log('\n❌ PROBLEMA: El contador no se está cargando correctamente desde localStorage');
    console.log('   Esperado: 3, Obtenido:', cartCount);
} 