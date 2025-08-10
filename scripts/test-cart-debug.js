#!/usr/bin/env node
/**
 * Script de prueba para debuggear exactamente qué está pasando con cartCount
 * Simula la función addToCart de +page.svelte
 */
console.log('🧪 Debugging cartCount issue...\n');

// Simular el estado como en Svelte
let cart = [];
let cartCount = 0;

// Simular la función getCartCount
function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Simular la declaración reactiva de Svelte
function simulateReactivity() {
    cartCount = getCartCount();
    console.log('🔄 Reactivity triggered - cartCount:', cartCount, 'cart.length:', cart.length, 'cart items:', cart);
}

// Simular la función addToCart exactamente como está en +page.svelte
function addToCart(item) {
    console.log('➕ Adding to cart:', item.name, 'Current cart:', cart);
    console.log('🔄 Before update - cartCount:', cartCount);
    
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
        // Si ya existe, aumentar cantidad
        cart = cart.map((cartItem, index) => {
            if (index === existingItemIndex) {
                return { ...cartItem, quantity: cartItem.quantity + 1 };
            }
            return cartItem;
        });
        console.log('✅ Updated existing item quantity. New cart:', cart);
    } else {
        // Si no existe, agregar nuevo item
        const cartItem = {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category,
            quantity: 1
        };
        cart = [...cart, cartItem];
        console.log('✅ Added new item to cart. New cart:', cart);
    }
    
    console.log('🔄 After update - cartCount should be:', getCartCount());
    
    // Simular saveCartToStorage (sin localStorage)
    console.log('💾 Simulating saveCartToStorage...');
    
    // Debug: verificar cartCount después de guardar
    console.log('🔍 After saveCartToStorage - cartCount:', cartCount, 'cart:', cart);
    
    // Simular la reactividad de Svelte
    simulateReactivity();
    
    console.log('🎯 Final cartCount:', cartCount);
    console.log('📊 Cart summary:', {
        items: cart.length,
        totalQuantity: getCartCount(),
        cartCount: cartCount
    });
}

// Producto de prueba
const testProduct = {
    id: 1,
    name: 'Silla Vintage',
    description: 'Silla de madera restaurada',
    price: 150,
    image: 'https://example.com/silla.jpg',
    category: 'sillas'
};

console.log('🚀 Iniciando prueba de addToCart...\n');

// Prueba 1: Agregar primer producto
console.log('=== PRUEBA 1: Agregar primer producto ===');
addToCart(testProduct);

console.log('\n=== PRUEBA 2: Agregar segundo producto ===');
addToCart(testProduct);

console.log('\n=== PRUEBA 3: Agregar producto diferente ===');
const testProduct2 = {
    id: 2,
    name: 'Mesa de Centro',
    description: 'Mesa restaurada',
    price: 300,
    image: 'https://example.com/mesa.jpg',
    category: 'mesas'
};
addToCart(testProduct2);

console.log('\n📊 Estado final:');
console.log('   cart.length:', cart.length);
console.log('   getCartCount():', getCartCount());
console.log('   cartCount variable:', cartCount);

if (cartCount === getCartCount()) {
    console.log('\n🎉 ¡ÉXITO! cartCount está sincronizado con getCartCount()');
} else {
    console.log('\n❌ PROBLEMA: cartCount NO está sincronizado con getCartCount()');
    console.log('   Diferencia:', Math.abs(cartCount - getCartCount()));
} 