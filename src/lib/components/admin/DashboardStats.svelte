<script lang="ts">
	import { onMount } from 'svelte';
	import { TrendingUp, Package, ShoppingCart, Users, DollarSign, AlertTriangle } from 'lucide-svelte';

	export let stats: {
		totalProducts: number;
		lowStockProducts: number;
		pendingCheckouts: number;
		totalSales: number;
		recentOrders: number;
		stockValue: number;
	} = {
		totalProducts: 0,
		lowStockProducts: 0,
		pendingCheckouts: 0,
		totalSales: 0,
		recentOrders: 0,
		stockValue: 0
	};

	let loading = true;

	onMount(() => {
		// Simular carga de datos
		setTimeout(() => {
			loading = false;
		}, 1000);
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS'
		}).format(amount);
	}
</script>

<div class="dashboard-stats">
	<!-- Métricas principales -->
	<div class="stats-grid">
		<div class="stat-card primary">
			<div class="stat-icon">
				<Package size={24} />
			</div>
			<div class="stat-content">
				<h3 class="stat-value">{loading ? '...' : stats.totalProducts}</h3>
				<p class="stat-label">Total Productos</p>
			</div>
		</div>

		<div class="stat-card warning">
			<div class="stat-icon">
				<AlertTriangle size={24} />
			</div>
			<div class="stat-content">
				<h3 class="stat-value">{loading ? '...' : stats.lowStockProducts}</h3>
				<p class="stat-label">Stock Bajo</p>
			</div>
		</div>

		<div class="stat-card info">
			<div class="stat-icon">
				<ShoppingCart size={24} />
			</div>
			<div class="stat-content">
				<h3 class="stat-value">{loading ? '...' : stats.pendingCheckouts}</h3>
				<p class="stat-label">Checkouts Pendientes</p>
			</div>
		</div>

		<div class="stat-card success">
			<div class="stat-icon">
				<DollarSign size={24} />
			</div>
			<div class="stat-content">
				<h3 class="stat-value">{loading ? '...' : formatCurrency(stats.totalSales)}</h3>
				<p class="stat-label">Ventas Totales</p>
			</div>
		</div>
	</div>

	<!-- Resumen rápido -->
	<div class="quick-summary">
		<div class="summary-card">
			<h4>📈 Resumen del Día</h4>
			<div class="summary-items">
				<div class="summary-item">
					<span class="item-label">Nuevos Pedidos:</span>
					<span class="item-value">{loading ? '...' : stats.recentOrders}</span>
				</div>
				<div class="summary-item">
					<span class="item-label">Valor en Stock:</span>
					<span class="item-value">{loading ? '...' : formatCurrency(stats.stockValue)}</span>
				</div>
			</div>
		</div>

		<div class="summary-card">
			<h4>🚨 Acciones Requeridas</h4>
			<div class="action-items">
				{#if stats.lowStockProducts > 0}
					<div class="action-item warning">
						<AlertTriangle size={16} />
						<span>Reabastecer {stats.lowStockProducts} productos</span>
					</div>
				{/if}
				{#if stats.pendingCheckouts > 0}
					<div class="action-item info">
						<ShoppingCart size={16} />
						<span>Gestionar {stats.pendingCheckouts} checkouts</span>
					</div>
				{/if}
				{#if stats.lowStockProducts === 0 && stats.pendingCheckouts === 0}
					<div class="action-item success">
						<TrendingUp size={16} />
						<span>¡Todo bajo control!</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.dashboard-stats {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		transition: all 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.stat-card.primary {
		border-left: 4px solid #3b82f6;
	}

	.stat-card.warning {
		border-left: 4px solid #f59e0b;
	}

	.stat-card.info {
		border-left: 4px solid #06b6d4;
	}

	.stat-card.success {
		border-left: 4px solid #10b981;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-card.primary .stat-icon {
		background: #dbeafe;
		color: #3b82f6;
	}

	.stat-card.warning .stat-icon {
		background: #fef3c7;
		color: #f59e0b;
	}

	.stat-card.info .stat-icon {
		background: #cffafe;
		color: #06b6d4;
	}

	.stat-card.success .stat-icon {
		background: #d1fae5;
		color: #10b981;
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		margin: 0 0 0.25rem 0;
		font-size: 2rem;
		font-weight: 700;
		color: #1e293b;
		line-height: 1;
	}

	.stat-label {
		margin: 0;
		font-size: 0.875rem;
		color: #64748b;
		font-weight: 500;
	}

	.quick-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.summary-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
	}

	.summary-card h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
	}

	.summary-items {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f1f5f9;
	}

	.summary-item:last-child {
		border-bottom: none;
	}

	.item-label {
		font-size: 0.875rem;
		color: #64748b;
	}

	.item-value {
		font-weight: 600;
		color: #1e293b;
	}

	.action-items {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.action-item.warning {
		background: #fef3c7;
		color: #92400e;
		border: 1px solid #fde68a;
	}

	.action-item.info {
		background: #dbeafe;
		color: #1e40af;
		border: 1px solid #93c5fd;
	}

	.action-item.success {
		background: #d1fae5;
		color: #065f46;
		border: 1px solid #6ee7b7;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
		
		.quick-summary {
			grid-template-columns: 1fr;
		}
		
		.stat-value {
			font-size: 1.5rem;
		}
	}
</style> 