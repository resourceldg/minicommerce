<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { ShoppingCart, CheckCircle, Clock, AlertCircle, Eye, MessageSquare } from 'lucide-svelte';

	export let checkouts: Array<{
		id: number;
		checkout_code: string;
		total_amount: number;
		customer_name?: string;
		customer_phone?: string;
		customer_email?: string;
		status: string;
		whatsapp_sent: boolean;
		created_at: string;
		item_count: number;
	}> = [];

	const dispatch = createEventDispatcher();

	let loading = true;
	let searchQuery = '';
	let statusFilter = '';

	onMount(() => {
		loadCheckouts();
	});

	async function loadCheckouts() {
		loading = true;
		try {
			// Aquí cargarías los checkouts desde la API
			// Por ahora usamos datos de ejemplo
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
		} catch (error) {
			console.error('Error loading checkouts:', error);
		} finally {
			loading = false;
		}
	}

	function getStatusInfo(status: string) {
		switch (status) {
			case 'pending':
				return { label: 'Pendiente', icon: Clock, class: 'status-pending' };
			case 'completed':
				return { label: 'Completado', icon: CheckCircle, class: 'status-completed' };
			case 'expired':
				return { label: 'Expirado', icon: AlertCircle, class: 'status-expired' };
			default:
				return { label: 'Desconocido', icon: AlertCircle, class: 'status-unknown' };
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS'
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getFilteredCheckouts() {
		let filtered = [...checkouts];
		
		if (searchQuery) {
			filtered = filtered.filter(c => 
				c.checkout_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(c.customer_name && c.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(c.customer_phone && c.customer_phone.includes(searchQuery))
			);
		}
		
		if (statusFilter) {
			filtered = filtered.filter(c => c.status === statusFilter);
		}
		
		return filtered;
	}

	function viewCheckout(checkout: any) {
		dispatch('view-checkout', checkout);
	}

	function sendWhatsApp(checkout: any) {
		const message = `🛒 **CHECKOUT - Rare&Magic**

Código: ${checkout.checkout_code}
Cliente: ${checkout.customer_name || 'No especificado'}
Total: ${formatCurrency(checkout.total_amount)}
Estado: ${getStatusInfo(checkout.status).label}

¿Necesitas ayuda con este pedido?`;
		
		const whatsappUrl = `https://wa.me/+542236202061?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, '_blank');
	}

	function confirmCheckout(checkout: any) {
		if (confirm('¿Confirmar que este checkout se completó?')) {
			// Aquí actualizarías el estado en la base de datos
			checkouts = checkouts.map(c => 
				c.id === checkout.id ? { ...c, status: 'completed' } : c
			);
			dispatch('checkout-updated', checkouts);
		}
	}

	$: filteredCheckouts = getFilteredCheckouts();
</script>

<div class="checkout-manager">
	<div class="manager-header">
		<div class="header-left">
			<h3>Gestión de Checkouts</h3>
			<span class="checkout-count">{filteredCheckouts.length} checkouts</span>
		</div>
	</div>

	<div class="filters-section">
		<div class="search-box">
			<ShoppingCart size={18} />
			<input 
				type="text" 
				placeholder="Buscar por código, cliente o teléfono..."
				bind:value={searchQuery}
			/>
		</div>
		
		<div class="filter-controls">
			<select bind:value={statusFilter}>
				<option value="">Todos los estados</option>
				<option value="pending">Pendientes</option>
				<option value="completed">Completados</option>
				<option value="expired">Expirados</option>
			</select>
		</div>
	</div>

	<div class="checkouts-table">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Cargando checkouts...</p>
			</div>
		{:else if filteredCheckouts.length === 0}
			<div class="empty-state">
				<ShoppingCart size={48} />
				<p>No se encontraron checkouts</p>
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Código</th>
						<th>Cliente</th>
						<th>Total</th>
						<th>Estado</th>
						<th>WhatsApp</th>
						<th>Fecha</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredCheckouts as checkout}
						<tr>
							<td class="checkout-code">
								<strong>{checkout.checkout_code}</strong>
								<span class="item-count">{checkout.item_count} items</span>
							</td>
							<td class="customer-info">
								<div>
									<strong>{checkout.customer_name || 'Sin nombre'}</strong>
									{#if checkout.customer_phone}
										<p>{checkout.customer_phone}</p>
									{/if}
									{#if checkout.customer_email}
										<p class="email">{checkout.customer_email}</p>
									{/if}
								</div>
							</td>
							<td class="total">
								{formatCurrency(checkout.total_amount)}
							</td>
							<td>
								{#if checkout.status}
									{@const statusInfo = getStatusInfo(checkout.status)}
									<div class="status-badge {statusInfo.class}">
										<svelte:component this={statusInfo.icon} size={16} />
										<span>{statusInfo.label}</span>
									</div>
								{/if}
							</td>
							<td>
								{#if checkout.whatsapp_sent}
									<span class="whatsapp-sent">✅ Enviado</span>
								{:else}
									<span class="whatsapp-pending">⏳ Pendiente</span>
								{/if}
							</td>
							<td class="date">
								{formatDate(checkout.created_at)}
							</td>
							<td class="actions">
								<button class="action-btn view" title="Ver detalles" on:click={() => viewCheckout(checkout)}>
									<Eye size={16} />
								</button>
								<button class="action-btn whatsapp" title="Enviar WhatsApp" on:click={() => sendWhatsApp(checkout)}>
									<MessageSquare size={16} />
								</button>
								{#if checkout.status === 'pending'}
									<button class="action-btn confirm" title="Confirmar" on:click={() => confirmCheckout(checkout)}>
										<CheckCircle size={16} />
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.checkout-manager {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.manager-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.header-left h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
	}

	.checkout-count {
		font-size: 0.875rem;
		color: #64748b;
	}

	.filters-section {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 1rem 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
	}

	.search-box input {
		flex: 1;
		border: none;
		background: none;
		outline: none;
		font-size: 0.875rem;
		color: #1e293b;
	}

	.filter-controls select {
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		background: white;
		font-size: 0.875rem;
		color: #1e293b;
		outline: none;
	}

	.checkouts-table {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid #f1f5f9;
	}

	th {
		background: #f8fafc;
		font-weight: 600;
		color: #475569;
		font-size: 0.875rem;
	}

	.checkout-code {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.checkout-code strong {
		font-family: monospace;
		font-size: 0.9rem;
		color: #1e293b;
	}

	.item-count {
		font-size: 0.75rem;
		color: #64748b;
	}

	.customer-info strong {
		display: block;
		margin-bottom: 0.25rem;
		color: #1e293b;
	}

	.customer-info p {
		margin: 0;
		font-size: 0.8rem;
		color: #64748b;
	}

	.customer-info .email {
		color: #3b82f6;
	}

	.total {
		font-weight: 600;
		color: #059669;
		font-size: 1.1rem;
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.status-badge.status-pending {
		background: #fef3c7;
		color: #92400e;
	}

	.status-badge.status-completed {
		background: #d1fae5;
		color: #065f46;
	}

	.status-badge.status-expired {
		background: #fee2e2;
		color: #991b1b;
	}

	.status-badge.status-unknown {
		background: #f3f4f6;
		color: #374151;
	}

	.whatsapp-sent {
		color: #059669;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.whatsapp-pending {
		color: #f59e0b;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.date {
		font-size: 0.8rem;
		color: #64748b;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-btn.view {
		background: #dbeafe;
		color: #1e40af;
	}

	.action-btn.whatsapp {
		background: #dcfce7;
		color: #059669;
	}

	.action-btn.confirm {
		background: #fef3c7;
		color: #92400e;
	}

	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #64748b;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e2e8f0;
		border-top: 3px solid #4ade80;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style> 