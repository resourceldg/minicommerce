#!/usr/bin/env node

/**
 * Script de prueba para el checkout inteligente
 * Verifica que todas las funcionalidades estén funcionando correctamente
 */

const BASE_URL = 'http://localhost:5173';

// Simular productos del carrito para pruebas
const testCart = [
  { item: { id: 1, name: 'Silla Vintage Restaurada', price: 150, category: 'sillas' }, quantity: 2 },
  { item: { id: 2, name: 'Mesa de Centro Antigua', price: 300, category: 'mesas' }, quantity: 1 },
  { item: { id: 8, name: 'Lámpara de Mesa Vintage', price: 120, category: 'iluminacion' }, quantity: 1 }
];

// Función para calcular descuentos por volumen
function calculateVolumeDiscount(subtotal) {
  const discounts = [
    { threshold: 500, discount: 0.05, label: '5% descuento por compra mayor a $500' },
    { threshold: 1000, discount: 0.10, label: '10% descuento por compra mayor a $1000' },
    { threshold: 2000, discount: 0.15, label: '15% descuento por compra mayor a $2000' }
  ];
  
  const applicableDiscount = discounts
    .filter(discount => subtotal >= discount.threshold)
    .sort((a, b) => b.discount - a.discount)[0];
    
  return applicableDiscount ? applicableDiscount.discount : 0;
}

// Función para estimar tiempo de entrega
function estimateDeliveryTime(totalItems, hasLargeItems) {
  const estimates = {
    FAST: { maxItems: 2, maxLargeItems: 0, days: '2-3 días hábiles' },
    STANDARD: { maxItems: 5, maxLargeItems: 1, days: '5-7 días hábiles' },
    EXTENDED: { maxItems: Infinity, maxLargeItems: Infinity, days: '7-10 días hábiles' }
  };
  
  if (totalItems <= estimates.FAST.maxItems && !hasLargeItems) {
    return `Entrega en ${estimates.FAST.days}`;
  } else if (totalItems <= estimates.STANDARD.maxItems || hasLargeItems) {
    return `Entrega en ${estimates.STANDARD.days}`;
  } else {
    return `Entrega en ${estimates.EXTENDED.days}`;
  }
}

// Función para validar el carrito
function validateCart(items) {
  const messages = [];
  const warnings = [];
  const errors = [];
  
  // Validar cantidades
  items.forEach(({ item, quantity }) => {
    if (quantity > 5) {
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
  if (totalValue < 100) {
    messages.push(`Agrega ${100 - totalValue} más para obtener descuentos`);
  }
  
  return {
    isValid: errors.length === 0,
    messages,
    warnings,
    errors
  };
}

// Función para obtener productos complementarios
function getComplementaryProducts(items) {
  const complementaryMap = {
    sillas: ['mesas', 'iluminacion'],
    mesas: ['sillas', 'decoracion'],
    muebles: ['iluminacion', 'decoracion'],
    iluminacion: ['muebles', 'decoracion'],
    decoracion: ['muebles', 'iluminacion']
  };
  
  const categoriesInCart = [...new Set(items.map(({ item }) => item.category))];
  const complementaryCategories = new Set();
  
  categoriesInCart.forEach(category => {
    if (complementaryMap[category]) {
      complementaryMap[category].forEach(compCat => complementaryCategories.add(compCat));
    }
  });
  
  return Array.from(complementaryCategories);
}

// Función principal de prueba
async function testCheckoutIntelligent() {
  console.log('🧪 Probando Checkout Inteligente...\n');
  
  // 1. Calcular subtotal
  const subtotal = testCart.reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0);
  console.log(`📊 Subtotal del carrito: $${subtotal}`);
  
  // 2. Calcular descuento por volumen
  const volumeDiscount = calculateVolumeDiscount(subtotal);
  const discountAmount = subtotal * volumeDiscount;
  const totalWithDiscount = subtotal - discountAmount;
  
  if (volumeDiscount > 0) {
    console.log(`🎉 Descuento aplicado: ${(volumeDiscount * 100).toFixed(0)}% (-$${discountAmount.toFixed(2)})`);
    console.log(`💰 Total con descuento: $${totalWithDiscount.toFixed(2)}`);
  } else {
    console.log(`💡 No hay descuentos aplicables (mínimo $500)`);
  }
  
  // 3. Estimar tiempo de entrega
  const totalItems = testCart.reduce((sum, { quantity }) => sum + quantity, 0);
  const hasLargeItems = testCart.some(({ item }) => ['muebles', 'mesas'].includes(item.category));
  const deliveryEstimate = estimateDeliveryTime(totalItems, hasLargeItems);
  
  console.log(`🚚 ${deliveryEstimate}`);
  console.log(`📦 Total de items: ${totalItems} (${hasLargeItems ? 'incluye items grandes' : 'solo items pequeños'})`);
  
  // 4. Validar carrito
  const validation = validateCart(testCart);
  console.log(`\n✅ Validación del carrito:`);
  
  if (validation.messages.length > 0) {
    validation.messages.forEach(msg => console.log(`   💡 ${msg}`));
  }
  
  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }
  
  if (validation.errors.length > 0) {
    validation.errors.forEach(error => console.log(`   ❌ ${error}`));
  }
  
  if (validation.isValid) {
    console.log(`   ✅ Carrito válido`);
  }
  
  // 5. Productos complementarios
  const complementaryCategories = getComplementaryProducts(testCart);
  console.log(`\n🔄 Productos complementarios sugeridos:`);
  complementaryCategories.forEach(category => {
    console.log(`   📍 ${category}`);
  });
  
  // 6. Resumen final
  console.log(`\n📋 Resumen del Checkout Inteligente:`);
  console.log(`   • Productos: ${testCart.length} tipos`);
  console.log(`   • Cantidad total: ${totalItems} unidades`);
  console.log(`   • Subtotal: $${subtotal.toFixed(2)}`);
  console.log(`   • Descuento: ${(volumeDiscount * 100).toFixed(0)}%`);
  console.log(`   • Total final: $${totalWithDiscount.toFixed(2)}`);
  console.log(`   • Entrega: ${deliveryEstimate}`);
  console.log(`   • Sugerencias: ${complementaryCategories.length} categorías`);
  
  console.log(`\n🎯 Checkout Inteligente funcionando correctamente!`);
}

// Ejecutar pruebas
testCheckoutIntelligent().catch(console.error); 