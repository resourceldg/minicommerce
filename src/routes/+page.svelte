<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, ShoppingCart } from 'lucide-svelte';
	import type { Furniture, CartItem, Category } from '$lib/types';
	import Cart from '$lib/components/Cart.svelte';
	import CategoryScroll from '$lib/components/CategoryScroll.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';

	let furniture: Furniture[] = [];
	let cart: CartItem[] = [];
	let loading = true;
	let showCart = false;
	let selectedCategory = 'todos';
	let searchQuery = '';

	// Categorías disponibles
	const categories: Category[] = [
		{ id: 'todos', name: 'Todos', icon: '', active: true },
		{ id: 'sillas', name: 'Sillas', icon: '', active: false },
		{ id: 'mesas', name: 'Mesas', icon: '', active: false },
		{ id: 'muebles', name: 'Muebles', icon: '', active: false },
		{ id: 'iluminacion', name: 'Iluminación', icon: '', active: false },
		{ id: 'decoracion', name: 'Decoración', icon: '', active: false }
	];

	onMount(async () => {
		console.log('onMount started');
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
					image: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg',
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
					image: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg',
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
					image: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/house-1835923_1280.jpg',
					category: 'muebles'
				}
			];
		} finally {
			console.log('Setting loading to false');
			loading = false;
		}
	});

	function addToCart(item: Furniture) {
		const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
		
		if (existingItemIndex >= 0) {
			// Si ya existe, aumentar cantidad
			const updatedCart = [...cart];
			updatedCart[existingItemIndex].quantity += 1;
			cart = updatedCart;
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
		}
		showCart = true;
	}

	function removeFromCart(index: number) {
		cart = cart.filter((_, i) => i !== index);
	}

	function updateCart(updatedCart: CartItem[]) {
		cart = updatedCart;
	}

	function clearCart() {
		cart = [];
	}

	function toggleCart() {
		showCart = !showCart;
	}

	function getCartCount() {
		return cart.reduce((sum, item) => sum + item.quantity, 0);
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
		console.log('getFilteredFurniture called');
		console.log('furniture array:', furniture);
		console.log('selectedCategory:', selectedCategory);
		console.log('searchQuery:', searchQuery);
		
		let filtered = furniture;
		
		// Filtrar por categoría
		if (selectedCategory !== 'todos') {
			filtered = filtered.filter(item => item.category === selectedCategory);
			console.log('After category filter:', filtered);
		}
		
		// Filtrar por búsqueda
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(item => 
				item.name.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query) ||
				item.category.toLowerCase().includes(query)
			);
			console.log('After search filter:', filtered);
		}
		
		console.log('Final filtered result:', filtered);
		return filtered;
	}

	$: filteredFurniture = furniture.length > 0 ? getFilteredFurniture() : [];
</script>

<svelte:head>
	<title>RareandMagic - Artefactos Únicos de Diseño Consciente</title>
	<meta name="description" content="Transformamos espacios con arte y diseño consciente. Piezas únicas y sostenibles creadas con madera reutilizada y restaurada." />
</svelte:head>

	<!-- Header de RareandMagic -->
	<header class="brand-header">
		<div class="brand-content">
			<h1 class="brand-title">RareandMagic</h1>
			<p class="brand-tagline">Artefactos Únicos de Diseño Consciente</p>
			<p class="brand-mission">Transformamos espacios en hogares y empresas con arte y diseño consciente. Cada pieza cuenta una historia única.</p>
		</div>
	</header>

	<!-- Barra de búsqueda y filtros -->
	<div class="search-section">
		<!-- Header estilo Instagram -->
		<header class="header">
			<div class="header-content">
				<div class="logo">
					<h1>RareandMagic</h1>
				</div>
				
				<div class="header-actions">
					<button class="cart-button" on:click={toggleCart}>
						<ShoppingCart size={24} />
						<span class="cart-count">{getCartCount()}</span>
					</button>
				</div>
			</div>
		</header>

			<!-- Main Content -->
	<div class="main-content">
			{#if loading}
				<div class="loading-container">
					<div class="loading-spinner"></div>
					<p>Cargando artefactos únicos...</p>
				</div>
			{:else}
				<!-- Barra de búsqueda -->
				<div class="search-container">
					<div class="search-input-wrapper">
						<Search size={20} />
						<input 
							type="text" 
							placeholder="Buscar artefactos únicos..." 
							bind:value={searchQuery}
							class="search-input"
						/>
					</div>
				</div>

				<!-- Categorías con scroll horizontal -->
				<CategoryScroll 
					{categories} 
					on:select={({ detail }) => selectCategory(detail)}
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
						<button class="btn btn-outline" on:click={() => { searchQuery = ''; selectCategory('todos'); }}>
							Ver todos los artefactos
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>

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
	.brand-header {
		background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
		color: white;
		padding: 40px 20px;
		text-align: center;
		margin-bottom: 0;
	}

	.brand-content {
		max-width: 975px;
		margin: 0 auto;
	}

	.brand-title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 10px 0;
		background: linear-gradient(45deg, #f39c12, #e74c3c);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.brand-tagline {
		font-size: 1.2rem;
		font-weight: 500;
		margin: 0 0 15px 0;
		color: #ecf0f1;
	}

	.brand-mission {
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
		color: #bdc3c7;
		max-width: 600px;
		margin: 0 auto;
	}

	.header {
		position: sticky;
		top: 0;
		background: white;
		border-bottom: 1px solid var(--border-color);
		z-index: 1000;
		backdrop-filter: blur(10px);
	}

	.header-content {
		max-width: 975px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 60px;
	}

	.logo h1 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--dark-color);
		margin: 0;
	}

	.cart-button {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		position: relative;
		padding: 8px;
		border-radius: 50%;
		transition: background 0.2s ease;
	}

	.cart-button:hover {
		background: var(--light-color);
	}

	.cart-count {
		position: absolute;
		top: 0;
		right: 0;
		background: var(--danger-color);
		color: white;
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: 10px;
		min-width: 18px;
		text-align: center;
	}

	.main-content {
		max-width: 975px;
		margin: 0 auto;
		padding: 20px;
	}

	.search-container {
		margin-bottom: 20px;
	}

	.search-input-wrapper {
		position: relative;
		max-width: 400px;
		margin: 0 auto;
	}

	.search-input-wrapper::before {
		content: '🔍';
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.1rem;
		color: var(--gray-color);
		z-index: 1;
	}

	.search-input {
		width: 100%;
		padding: 12px 16px 12px 48px;
		border: 1px solid var(--border-color);
		border-radius: 25px;
		font-size: 1rem;
		background: white;
		transition: all 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(0, 149, 246, 0.1);
	}

	/* Categorías con scroll horizontal - ahora manejado por CategoryScroll.svelte */

	.search-results {
		text-align: center;
		margin-bottom: 20px;
		padding: 10px;
		background: var(--light-color);
		border-radius: 8px;
		color: var(--gray-color);
	}

	/* Grid de productos - ahora manejado por ProductGrid.svelte */

	.no-results {
		text-align: center;
		padding: 60px 20px;
		color: var(--gray-color);
	}

	.no-results p {
		margin-bottom: 20px;
		font-size: 1.1rem;
	}

	.loading-container {
		text-align: center;
		padding: 60px 20px;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--light-color);
		border-top: 3px solid var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 20px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Cart Sidebar */
	.cart-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 2000;
		cursor: pointer;
	}

	.cart-overlay:focus {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}

	.cart-sidebar {
		position: fixed;
		top: 0;
		right: 0;
		width: 100%;
		max-width: 400px;
		height: 100vh;
		background: white;
		z-index: 2001;
		box-shadow: var(--shadow-hover);
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.header-content {
			padding: 0 16px;
		}

		.main-content {
			padding: 16px;
		}

		/* Estilos responsivos manejados por componentes */

		.cart-sidebar {
			width: 100%;
			max-width: none;
		}

		.search-input-wrapper {
			max-width: 100%;
		}
	}
</style>
