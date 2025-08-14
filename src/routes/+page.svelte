<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, ShoppingCart } from 'lucide-svelte';
	import type { Furniture, CartItem, Category } from '$lib/types';
	import Cart from '$lib/components/Cart.svelte';
	import Checkout from '$lib/components/Checkout.svelte';
	import CategoryScroll from '$lib/components/CategoryScroll.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import { APP_CONFIG } from '$lib/config';
	import { CHECKOUT_CONFIG } from '$lib/checkoutConfig';

	let furniture: Furniture[] = [];
	let cart: CartItem[] = [];
	let cartCount = 0;
	let cartLoaded = false; // Controlar cuándo se debe ejecutar la reactividad
	let loading = true;
	let showCart = false;
	let showCheckout = false;
	let selectedCategory = ''; // Cambiado de 'todos' a '' para mostrar todos por defecto
	let searchQuery = '';
	let searchOpen = false;

	// Timer para cierre automático del carrito
	let cartAutoCloseTimer: ReturnType<typeof setTimeout> | null = null;
	let userActivityTimeout: ReturnType<typeof setTimeout> | null = null;
	let lastUserActivity = Date.now();

	// Categorías disponibles
	const categories: Category[] = [
		{ id: 'sillas', name: 'Sillas', icon: '', active: false },
		{ id: 'mesas', name: 'Mesas', icon: '', active: false },
		{ id: 'muebles', name: 'Muebles', icon: '', active: false },
		{ id: 'iluminacion', name: 'Iluminación', icon: '', active: false },
		{ id: 'decoracion', name: 'Decoración', icon: '', active: false }
	];

	// Función para detectar actividad del usuario
	function updateUserActivity() {
		lastUserActivity = Date.now();
		// Resetear el timer si hay actividad
		if (cartAutoCloseTimer) {
			clearTimeout(cartAutoCloseTimer);
			startCartAutoCloseTimer();
		}
	}



	// Función para iniciar el timer de cierre automático
	function startCartAutoCloseTimer() {
		if (cartAutoCloseTimer) {
			clearTimeout(cartAutoCloseTimer);
		}
		cartAutoCloseTimer = setTimeout(() => {
					// Solo cerrar si no hay actividad reciente
		const timeSinceLastActivity = Date.now() - lastUserActivity;
		if (timeSinceLastActivity >= CHECKOUT_CONFIG.UX.USER_ACTIVITY_THRESHOLD) {
			showCheckout = false;
			cartAutoCloseTimer = null;
		} else {
			// Si hubo actividad reciente, reiniciar el timer
			startCartAutoCloseTimer();
		}
	}, CHECKOUT_CONFIG.UX.AUTO_CLOSE_DELAY);
	}

	// Función para limpiar timers
	function clearCartTimers() {
		if (cartAutoCloseTimer) {
			clearTimeout(cartAutoCloseTimer);
			cartAutoCloseTimer = null;
		}
		if (userActivityTimeout) {
			clearTimeout(userActivityTimeout);
			userActivityTimeout = null;
		}
	}

	onMount(() => {
		console.log('onMount started');
		
		// Cargar carrito desde localStorage
		const savedCart = localStorage.getItem(CHECKOUT_CONFIG.STORAGE.CART_KEY);
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
		
		// Inicializar cartCount después de cargar el carrito
		cartCount = getCartCount();
		console.log('🔍 After loading cart - cartCount initialized to:', cartCount);
		
		// Verificar que cartCount se haya calculado correctamente
		console.log('🔍 After loading cart - cartCount should be:', cartCount);

		// Agregar event listeners para detectar actividad del usuario
		const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
		activityEvents.forEach(event => {
			document.addEventListener(event, updateUserActivity, { passive: true });
		});

		// Función async para cargar datos
		async function loadFurniture() {
			try {
				console.log('Fetching from API...');
				const response = await fetch('/api/furniture');
				console.log('API response:', response);
				furniture = await response.json();
				console.log('Furniture loaded:', furniture.length, 'items');
			} catch (error) {
				console.error('Error loading furniture:', error);
				// Fallback data para desarrollo con imágenes de Pixabay
				furniture = [
					{
						id: 1,
						name: 'Silla Vintage de Madera',
						description: 'Silla de madera restaurada con estilo vintage, perfecta para comedor o escritorio',
						price: 150,
						image: 'https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg',
						category: 'sillas'
					},
					{
						id: 2,
						name: 'Mesa de Centro Rústica',
						description: 'Mesa de centro restaurada con patas torneadas y acabado en barniz natural',
						price: 300,
						image: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/house-1835923_1280.jpg',
						category: 'mesas'
					},
					{
						id: 3,
						name: 'Cómoda Clásica de Roble',
						description: 'Cómoda de madera maciza restaurada con cajones funcionales y tiradores de latón',
						price: 450,
						image: 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg',
						category: 'muebles'
					},
					{
						id: 4,
						name: 'Silla de Escritorio Ergonómica',
						description: 'Silla de oficina restaurada con respaldo alto y asiento acolchado',
						price: 200,
						image: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg',
						category: 'sillas'
					},
					{
						id: 5,
						name: 'Mesa de Comedor Extensible',
						description: 'Mesa de comedor de 6-8 personas con sistema extensible oculto',
						price: 600,
						image: 'https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg',
						category: 'mesas'
					},
					{
						id: 6,
						name: 'Armario de Pared Antiguo',
						description: 'Armario empotrado restaurado con puertas correderas y estantes ajustables',
						price: 800,
						image: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/house-1835923_1280.jpg',
						category: 'muebles'
					},
					{
						id: 7,
						name: 'Silla de Jardín Adirondack',
						description: 'Silla de jardín clásica restaurada, perfecta para terrazas y patios',
						price: 180,
						image: 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg',
						category: 'sillas'
					},
					{
						id: 8,
						name: 'Mesa de Noche Artesanal',
						description: 'Mesa de noche con cajón secreto y patas talladas a mano',
						price: 250,
						image: 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg',
						category: 'muebles'
					},
					{
						id: 9,
						name: 'Silla de Lectura Chesterfield',
						description: 'Silla de lectura restaurada con tapizado en cuero genuino y botones decorativos',
						price: 350,
						image: 'https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg',
						category: 'sillas'
					},
					{
						id: 10,
						name: 'Lámpara de Mesa Vintage',
						description: 'Lámpara de mesa restaurada con pantalla de tela y base de latón',
						price: 120,
						image: 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg',
						category: 'iluminacion'
					},
					{
						id: 11,
						name: 'Espejo Decorativo Antiguo',
						description: 'Espejo de pared restaurado con marco tallado y acabado dorado',
						price: 280,
						image: 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg',
						category: 'decoracion'
					},
					{
						id: 12,
						name: 'Estantería de Libros Rústica',
						description: 'Estantería de madera maciza con diseño rústico y acabado natural',
						price: 320,
						image: 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg',
						category: 'muebles'
					}
				];
			} finally {
				console.log('Setting loading to false');
				loading = false;
				cartLoaded = true; // Marcar que el carrito está cargado
			}
		}

		// Ejecutar la carga de datos
		loadFurniture();

		// Cleanup function
		return () => {
			clearCartTimers();
			activityEvents.forEach(event => {
				document.removeEventListener(event, updateUserActivity);
			});
		};
	});

	function addToCart(item: Furniture) {
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
			const cartItem: CartItem = {
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
		

		
		// Guardar en localStorage
		saveCartToStorage();
		
		// Debug: verificar cartCount después de guardar
		console.log('🔍 After saveCartToStorage - cartCount:', cartCount, 'cart:', cart);
		
		// Forzar actualización inmediata de cartCount
		cartCount = getCartCount();
		console.log('🔧 Forced cartCount update:', cartCount);
		
		// Abrir checkout y iniciar timer de cierre automático
		showCheckout = true;
		startCartAutoCloseTimer();
	}



	function saveCartToStorage() {
		try {
			localStorage.setItem(CHECKOUT_CONFIG.STORAGE.CART_KEY, JSON.stringify(cart));
		} catch (error) {
			console.error('Error saving cart to storage:', error);
		}
	}

	function removeFromCart(index: number) {
		const removedItem = cart[index];
		if (removedItem) {
			
		}
		cart = cart.filter((_, i) => i !== index);
		saveCartToStorage();
		
		// Forzar actualización inmediata de cartCount
		cartCount = getCartCount();
		console.log('🔧 After removeFromCart - cartCount updated:', cartCount);
	}

	function updateCart(updatedCart: CartItem[]) {
		cart = updatedCart;
		saveCartToStorage();
	}

	function clearCart() {
		cart = [];
		saveCartToStorage();
		
		// Forzar actualización inmediata de cartCount
		cartCount = getCartCount();
		console.log('🔧 After clearCart - cartCount updated:', cartCount);
	}

	function toggleCart() {
		showCart = !showCart;
	}

	function toggleCheckout() {
		showCheckout = !showCheckout;
		if (showCheckout) {
			// Si se abre manualmente desde el icono del carrito, NO iniciar timer
			// El timer solo se activa cuando se abre desde addToCart
		} else {
			// Si se cierra manualmente, limpiar timer
			clearCartTimers();
		}
	}

	function closeCheckout() {
		showCheckout = false;
		clearCartTimers();
	}

	function updateQuantity(index: number, newQuantity: number) {
		if (newQuantity < 1) return;
		cart = cart.map((cartItem, i) => {
			if (i === index) {
				return { ...cartItem, quantity: newQuantity };
			}
			return cartItem;
		});
		saveCartToStorage();
		
		// Forzar actualización inmediata de cartCount
		cartCount = getCartCount();
		console.log('🔧 After updateQuantity - cartCount updated:', cartCount);
	}

	function removeItemFromCheckout(index: number) {
		cart = cart.filter((_, i) => i !== index);
		saveCartToStorage();
		
		// Forzar actualización inmediata de cartCount
		cartCount = getCartCount();
		console.log('🔧 After removeItemFromCheckout - cartCount updated:', cartCount);
	}

	function buyNow() {
		// Crear mensaje de WhatsApp con los productos del carrito
		const message = createWhatsAppMessage();
		
		// Intentar múltiples métodos para abrir WhatsApp
		const phoneNumber = APP_CONFIG.WHATSAPP_NUMBER.replace('+', '');
		
		// Método 1: API de WhatsApp Business (más confiable)
		const whatsappBusinessUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
		
		// Método 2: whatsapp:// (protocolo directo para móviles)
		const whatsappDirectUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
		
		// Método 3: wa.me (fallback)
		const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
		
		// Detectar si es móvil
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		
		try {
			if (isMobile) {
				// En móviles, intentar primero el protocolo directo
				window.location.href = whatsappDirectUrl;
			} else {
				// En desktop, usar la API de WhatsApp Business (más confiable)
				window.open(whatsappBusinessUrl, '_blank');
			}
			
			// Mostrar mensaje de éxito
			alert('✅ Pedido enviado a WhatsApp. Si no se abre automáticamente, copia este mensaje:\n\n' + message);
			
		} catch (error) {
			// Fallback a wa.me si fallan los otros métodos
			console.warn('Error abriendo WhatsApp, usando fallback:', error);
			window.open(whatsappUrl, '_blank');
		}
		
		// Limpiar carrito después de enviar
		cart = [];
		showCheckout = false;
		saveCartToStorage();
	}

	function createWhatsAppMessage(): string {
		const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
		const formattedTotal = new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: APP_CONFIG.DEFAULT_CURRENCY
		}).format(total);

		let message = `🛍️ *Nuevo Pedido - ${APP_CONFIG.STORE_NAME}*\n\n`;
		message += `Hola! Me gustaría hacer un pedido:\n\n`;
		
		cart.forEach((item, index) => {
			message += `${index + 1}. ${item.name}\n`;
			message += `   Cantidad: ${item.quantity}\n`;
			message += `   Precio: $${item.price}\n`;
			message += `   Subtotal: $${item.price * item.quantity}\n\n`;
		});
		
		message += `💰 *Total: ${formattedTotal}*\n\n`;
		message += `Por favor, confirma disponibilidad y opciones de pago. ¡Gracias!`;

		return message;
	}

	function getCartCount() {
		return cart.reduce((sum, item) => sum + item.quantity, 0);
	}

	// Hacer que getCartCount sea reactiva solo cuando el carrito esté cargado
	$: if (cartLoaded) {
		cartCount = getCartCount();
		console.log('🔄 Reactivity triggered - cartCount:', cartCount, 'cart.length:', cart.length, 'cart items:', cart);
	}

	function selectCategory(categoryId: string) {
		selectedCategory = categoryId;
		// Actualizar estado activo de las categorías
		categories.forEach(cat => {
			cat.active = cat.id === categoryId;
		});
	}

	function toggleFavorite(product: Furniture) {
		// TODO: Implementar sistema de favoritos
		console.log('Toggle favorite:', product.name);
	}

	function getFilteredFurniture() {
		// Si no hay muebles, retornar array vacío
		if (!furniture || furniture.length === 0) {
			return [];
		}
		
		let filtered = [...furniture]; // Crear una copia
		
		// Filtrar por categoría (solo si hay una seleccionada)
		if (selectedCategory && selectedCategory !== '') {
			filtered = filtered.filter(item => item.category === selectedCategory);
		}
		
		// Filtrar por búsqueda
		if (searchQuery && searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(item => 
				item.name.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query) ||
				item.category.toLowerCase().includes(query)
			);
		}
		
		return filtered;
	}

	$: filteredFurniture = furniture.length > 0 ? getFilteredFurniture() : [];
</script>

<svelte:head>
	<title>Rare&Magic - Artefactos Únicos de Diseño Consciente</title>
	<meta name="description" content="Artefactos mágicos, piezas únicas. Legado consciente" />
</svelte:head>

	<!-- Header con título y carrito -->
	<header class="main-header">
		<div class="header-content">
			<h1 class="brand-title">Rare&Magic</h1>
			<button class="cart-button" on:click={toggleCheckout}>
				<ShoppingCart size={20} />
				<!-- Debug: cartCount = {cartCount}, cart.length = {cart.length} -->
				{#if cartCount > 0}
					<span class="cart-count">{cartCount}</span>
					<!-- Debug info -->
					<!-- cartCount: {cartCount}, cart.length: {cart.length} -->
				{/if}
			</button>
		</div>
	</header>

	<!-- Descripción zen -->
	<div class="zen-description">
		<div class="description-container">
			<p class="brand-mission">Muebles únicos, legado consciente</p>
		</div>
	</div>

	<!-- Main Content -->
	<div class="main-content">
		{#if loading}
			<div class="loading-container">
				<div class="loading-spinner"></div>
				<p>Cargando artefactos únicos...</p>
			</div>
		{:else}
			<!-- Categorías con scroll horizontal -->
			<CategoryScroll 
				{categories} 
				{searchOpen}
				{searchQuery}
				on:select={({ detail }) => selectCategory(detail)}
				onToggleSearch={() => searchOpen = !searchOpen}
				onSearchInput={(query) => searchQuery = query}
			/>

			<!-- Resultados de búsqueda -->
			{#if searchQuery.trim()}
				<div class="search-results">
					<p>Resultados para "{searchQuery}" ({filteredFurniture.length} artefactos)</p>
				</div>
			{/if}

			<!-- Grid de productos estilo Instagram -->
			{#if filteredFurniture.length > 0}
				<ProductGrid 
					products={filteredFurniture}
					on:add-to-cart={({ detail }) => addToCart(detail)}
					on:toggle-favorite={({ detail }) => toggleFavorite(detail)}
				/>
			{:else}
				<div class="no-results">
					<p>No se encontraron artefactos que coincidan con tu búsqueda.</p>
					<button class="btn btn-outline" on:click={() => { searchQuery = ''; selectedCategory = ''; }}>
						Ver todos los artefactos
					</button>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Checkout Panel -->
	{#if showCheckout}
		<Checkout 
			items={cart.map(item => ({ item, quantity: item.quantity }))}
			isOpen={showCheckout}
			on:close={closeCheckout}
			on:update-quantity={({ detail }) => updateQuantity(detail.index, detail.quantity)}
			on:remove-item={({ detail }) => removeItemFromCheckout(detail.index)}
			on:buy-now={buyNow}

		/>
	{/if}

	<!-- Cart Sidebar -->
		{#if showCart}
			<div 
				class="cart-overlay" 
				on:click={toggleCart}
				on:keydown={(e) => e.key === 'Escape' && toggleCart()}
				role="button"
				tabindex="0"
				aria-label="Cerrar carrito"
			></div>
			<div class="cart-sidebar slide-in">
				<Cart 
					{cart} 
					on:remove-item={({ detail }) => removeFromCart(detail)}
					on:update-cart={({ detail }) => updateCart(detail)}
					on:clear-cart={clearCart}
					on:close={toggleCart}
				/>
			</div>
		{/if}

<style>
	/* Variables CSS zen y minimalistas con verde bio */
	:global(:root) {
		--color-bg: #fefefe;
		--color-surface: #fafafa;
		--color-text: #2c2c2c;
		--color-text-secondary: #8a8a8a;
		--color-accent: #4ade80;
		--color-accent-light: #22c55e;
		--color-border: #e8e8e8;
		--color-shadow: rgba(74, 222, 128, 0.08);
		--color-earth: #bbf7d0;
		--color-stone: #f0fdf4;
		--spacing-xs: 12px;
		--spacing-sm: 20px;
		--spacing-md: 32px;
		--spacing-lg: 48px;
		--spacing-xl: 64px;
		--radius: 4px;
		--shadow: 0 1px 3px var(--color-shadow);
		--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	/* Header principal con título y carrito */
	.main-header {
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		padding: var(--spacing-md) var(--spacing-md);
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(20px);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 800px;
		margin: 0 auto;
	}

	.brand-title {
		font-size: 1.8rem;
		font-weight: 400;
		color: var(--color-text);
		letter-spacing: 0.05em;
	}

	.cart-button {
		background: none;
		border: none;
		padding: var(--spacing-xs);
		border-radius: var(--radius);
		color: var(--color-text);
		cursor: pointer;
		position: relative;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cart-button:hover {
		background: var(--color-stone);
		color: var(--color-accent);
	}

	.cart-count {
		position: absolute;
		top: -6px;
		right: -6px;
		background: var(--color-accent);
		color: white;
		font-size: 0.7rem;
		font-weight: 400;
		padding: 3px 8px;
		border-radius: 12px;
		min-width: 20px;
		text-align: center;
	}

	/* Descripción zen */
	.zen-description {
		padding: var(--spacing-lg) var(--spacing-md);
		background: var(--color-stone);
		border-bottom: 1px solid var(--color-border);
		text-align: center;
	}

	.description-container {
		max-width: 800px;
		margin: 0 auto;
	}

	.brand-tagline {
		font-size: 1.1rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
		font-weight: 300;
		letter-spacing: 0.02em;
	}

	.brand-mission {
		font-size: 1.2rem;
		color: var(--color-text);
		font-weight: 400;
		line-height: 1.4;
		letter-spacing: 0.03em;
		max-width: 600px;
		margin: 0 auto;
	}

	/* Contenido principal */
	.main-content {
		max-width: 800px;
		margin: 0 auto;
	}

	/* Resultados de búsqueda */
	.search-results {
		margin: var(--spacing-md) var(--spacing-md) var(--spacing-md);
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid var(--color-border);
	}

	.search-results p {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		font-weight: 300;
	}

	/* Sin resultados */
	.no-results {
		text-align: center;
		padding: var(--spacing-xl) var(--spacing-md);
		color: var(--color-text-secondary);
	}

	.btn {
		background: var(--color-accent);
		color: white;
		border: none;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius);
		font-size: 0.9rem;
		font-weight: 300;
		cursor: pointer;
		margin-top: var(--spacing-sm);
		transition: all 0.3s ease;
	}

	.btn:hover {
		background: var(--color-accent-light);
		transform: translateY(-1px);
	}

	.btn-outline {
		background: transparent;
		color: var(--color-accent);
		border: 1px solid var(--color-accent);
	}

	.btn-outline:hover {
		background: var(--color-accent);
		color: white;
	}

	/* Loading zen */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		color: var(--color-text-secondary);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 2px solid var(--color-earth);
		border-top: 2px solid var(--color-accent);
		border-radius: 50%;
		animation: spin 2s linear infinite;
		margin-bottom: var(--spacing-sm);
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Responsive */
	@media (max-width: 768px) {
		.brand-title {
			font-size: 1.5rem;
		}

		.brand-tagline {
			font-size: 1rem;
		}

		.brand-mission {
			font-size: 1.1rem;
		}

		.main-header,
		.zen-description,
		.search-toggle-section,
		.search-panel,
		.main-content {
			padding-left: var(--spacing-sm);
			padding-right: var(--spacing-sm);
		}
	}

	@media (max-width: 480px) {
		.brand-title {
			font-size: 1.3rem;
		}

		.brand-mission {
			font-size: 1rem;
		}

		.search-toggle-btn {
			max-width: 100%;
		}
	}

	/* Estilos globales para el scroll de la página principal (10px) - diferenciado del checkout */
	:global(html) {
		scrollbar-width: thin;
		scrollbar-color: #6b7280 #f3f4f6;
	}

	:global(html::-webkit-scrollbar) {
		width: 10px;
	}

	:global(html::-webkit-scrollbar-track) {
		background: #f3f4f6;
		border-radius: 5px;
	}

	:global(html::-webkit-scrollbar-thumb) {
		background: #6b7280;
		border-radius: 5px;
		border: 1px solid #4b5563;
	}

	:global(html::-webkit-scrollbar-thumb:hover) {
		background: #4b5563;
	}

	/* Asegurar que el body tenga scroll global */
	:global(body) {
		scrollbar-width: thin;
		scrollbar-color: #6b7280 #f3f4f6;
	}

	:global(body::-webkit-scrollbar) {
		width: 10px;
	}

	:global(body::-webkit-scrollbar-track) {
		background: #f3f4f6;
		border-radius: 5px;
	}

	:global(body::-webkit-scrollbar-thumb) {
		background: #6b7280;
		border-radius: 5px;
		border: 1px solid #4b5563;
	}

	:global(body::-webkit-scrollbar-thumb:hover) {
		background: #4b5563;
	}
</style>
