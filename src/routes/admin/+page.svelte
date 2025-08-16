<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AdminLayout from '$lib/components/admin/AdminLayout.svelte';
	import DashboardStats from '$lib/components/admin/DashboardStats.svelte';
	import ProductManager from '$lib/components/admin/ProductManager.svelte';
	import CheckoutManager from '$lib/components/admin/CheckoutManager.svelte';

	let currentSection = 'dashboard';
	let products: any[] = [];
	let checkouts: any[] = [];
	let stats = {
		totalProducts: 0,
		lowStockProducts: 0,
		pendingCheckouts: 0,
		totalSales: 0,
		recentOrders: 0,
		stockValue: 0
	};

	onMount(() => {
		loadData();
	});

	async function loadData() {
		try {
			// Cargar productos
			const productsResponse = await fetch('/api/furniture');
			products = await productsResponse.json();
			
			// Cargar checkouts (simulado por ahora)
			checkouts = [
				{
					id: 1,
					checkout_code: 'RM123456789',
					total_amount: 450.00,
					customer_name: 'María González',
					customer_phone: '+542236202061',
					customer_email: 'maria@email.com',
					status: 'pending',
					whatsapp_sent: true,
					created_at: '2024-01-15T10:30:00Z',
					item_count: 2
				}
			];
			
			// Calcular estadísticas
			calculateStats();
		} catch (error) {
			console.error('Error loading data:', error);
		}
	}

	function calculateStats() {
		stats = {
			totalProducts: products.length,
			lowStockProducts: products.filter(p => (p.stock || 0) <= 3).length,
			pendingCheckouts: checkouts.filter(c => c.status === 'pending').length,
			totalSales: checkouts.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.total_amount, 0),
			recentOrders: checkouts.filter(c => c.status === 'pending').length,
			stockValue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0)
		};
	}

	function handleSectionChange(event: CustomEvent) {
		currentSection = event.detail;
	}

	function handleGoHome() {
		goto('/');
	}

	function handleRefresh() {
		loadData();
	}

	function handleProductsUpdated(event: CustomEvent) {
		products = event.detail;
		calculateStats();
	}

	function handleCheckoutUpdated(event: CustomEvent) {
		checkouts = event.detail;
		calculateStats();
	}


</script>

<svelte:head>
	<title>Admin - Rare&Magic</title>
	<meta name="description" content="Panel administrativo de Rare&Magic" />
</svelte:head>

<AdminLayout 
	{currentSection}
	on:section-change={handleSectionChange}
	on:go-home={handleGoHome}
	on:refresh={handleRefresh}
>
	{#if currentSection === 'dashboard'}
		<DashboardStats {stats} />
	{:else if currentSection === 'products'}
		<ProductManager {products} on:products-updated={handleProductsUpdated} />
	{:else if currentSection === 'checkouts'}
		<CheckoutManager {checkouts} on:checkout-updated={handleCheckoutUpdated} />
	{:else if currentSection === 'stock'}
		<div class="coming-soon">
			<h3>📦 Gestión de Stock</h3>
			<p>Próximamente: Control de inventario, alertas de stock bajo, y movimientos de stock.</p>
		</div>
	{:else if currentSection === 'customers'}
		<div class="coming-soon">
			<h3>👥 Gestión de Clientes</h3>
			<p>Próximamente: Base de datos de clientes, historial de compras, y segmentación.</p>
		</div>
	{:else if currentSection === 'settings'}
		<div class="coming-soon">
			<h3>⚙️ Configuración</h3>
			<p>Próximamente: Configuración de la tienda, categorías, y preferencias.</p>
		</div>
	{:else}
		<DashboardStats {stats} />
	{/if}
</AdminLayout>

<style>
	.coming-soon {
		text-align: center;
		padding: 3rem;
		color: #64748b;
	}

	.coming-soon h3 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #1e293b;
	}

	.coming-soon p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
		max-width: 500px;
		margin: 0 auto;
	}
</style> 