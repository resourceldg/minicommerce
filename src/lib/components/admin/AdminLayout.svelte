<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Settings, Package, ShoppingCart, BarChart3, Users, Home } from 'lucide-svelte';

	export let currentSection = 'dashboard';
	
	const dispatch = createEventDispatcher();

	const menuItems = [
		{ id: 'dashboard', label: 'Dashboard', icon: BarChart3, active: true },
		{ id: 'products', label: 'Productos', icon: Package, active: false },
		{ id: 'checkouts', label: 'Checkouts', icon: ShoppingCart, active: false },
		{ id: 'stock', label: 'Stock', icon: Package, active: false },
		{ id: 'customers', label: 'Clientes', icon: Users, active: false },
		{ id: 'settings', label: 'Configuración', icon: Settings, active: false }
	];

	function selectSection(sectionId: string) {
		currentSection = sectionId;
		menuItems.forEach(item => item.active = item.id === sectionId);
		dispatch('section-change', sectionId);
	}

	function goHome() {
		dispatch('go-home');
	}
</script>

<div class="admin-layout">
	<!-- Sidebar de navegación -->
	<aside class="admin-sidebar">
		<div class="sidebar-header">
			<button class="home-btn" on:click={goHome}>
				<Home size={20} />
			</button>
			<h2>Admin</h2>
		</div>
		
		<nav class="sidebar-nav">
			{#each menuItems as item}
				<button 
					class="nav-item {item.active ? 'active' : ''}"
					on:click={() => selectSection(item.id)}
				>
					<svelte:component this={item.icon} size={18} />
					<span>{item.label}</span>
				</button>
			{/each}
		</nav>
		
		<div class="sidebar-footer">
			<p class="store-info">Rare&Magic</p>
			<p class="store-subtitle">Panel Administrativo</p>
		</div>
	</aside>

	<!-- Área principal de contenido -->
	<main class="admin-main">
		<header class="admin-header">
			<h1>{menuItems.find(item => item.id === currentSection)?.label || 'Dashboard'}</h1>
			<div class="header-actions">
				<button class="refresh-btn" on:click={() => dispatch('refresh')}>
					🔄 Actualizar
				</button>
			</div>
		</header>
		
		<div class="admin-content">
			<slot />
		</div>
	</main>
</div>

<style>
	.admin-layout {
		display: flex;
		height: 100vh;
		background: #f8fafc;
	}

	.admin-sidebar {
		width: 280px;
		background: white;
		border-right: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.home-btn {
		background: #4ade80;
		color: white;
		border: none;
		padding: 0.5rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.home-btn:hover {
		background: #22c55e;
		transform: translateY(-1px);
	}

	.sidebar-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
	}

	.sidebar-nav {
		flex: 1;
		padding: 1rem 0;
	}

	.nav-item {
		width: 100%;
		background: none;
		border: none;
		padding: 0.75rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #64748b;
		font-size: 0.9rem;
	}

	.nav-item:hover {
		background: #f1f5f9;
		color: #334155;
	}

	.nav-item.active {
		background: #4ade80;
		color: white;
	}

	.nav-item span {
		font-weight: 500;
	}

	.sidebar-footer {
		padding: 1.5rem;
		border-top: 1px solid #e2e8f0;
		text-align: center;
	}

	.store-info {
		margin: 0 0 0.25rem 0;
		font-weight: 600;
		color: #1e293b;
		font-size: 0.9rem;
	}

	.store-subtitle {
		margin: 0;
		font-size: 0.75rem;
		color: #64748b;
	}

	.admin-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.admin-header {
		background: white;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.admin-header h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 600;
		color: #1e293b;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.refresh-btn {
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	.refresh-btn:hover {
		background: #e2e8f0;
		border-color: #cbd5e1;
	}

	.admin-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.admin-sidebar {
			width: 240px;
		}
		
		.admin-header {
			padding: 1rem 1.5rem;
		}
		
		.admin-content {
			padding: 1.5rem;
		}
	}
</style> 