<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { Plus, Edit, Trash2, Package, Search } from 'lucide-svelte';

	export let products: Array<{
		id: number;
		name: string;
		description: string;
		price: number;
		image: string;
		category: string;
		stock?: number;
	}> = [];

	const dispatch = createEventDispatcher();

	let loading = true;
	let searchQuery = '';
	let showAddModal = false;
	let editingProduct: any = {};

	const categories = [
		{ id: 'sillas', name: 'Sillas' },
		{ id: 'mesas', name: 'Mesas' },
		{ id: 'muebles', name: 'Muebles' },
		{ id: 'iluminacion', name: 'Iluminación' },
		{ id: 'decoracion', name: 'Decoración' }
	];

	onMount(() => {
		loadProducts();
	});

	async function loadProducts() {
		loading = true;
		try {
			const response = await fetch('/api/furniture');
			products = await response.json();
		} catch (error) {
			console.error('Error loading products:', error);
		} finally {
			loading = false;
		}
	}

	function openAddModal() {
		editingProduct = {
			name: '',
			description: '',
			price: 0,
			image: '',
			category: 'sillas',
			stock: 0
		};
		showAddModal = true;
	}

	function closeModals() {
		showAddModal = false;
		editingProduct = {};
	}

	async function saveProduct() {
		try {
			const newProduct = {
				id: Date.now(),
				...editingProduct
			};
			products = [...products, newProduct];
			closeModals();
			dispatch('products-updated', products);
		} catch (error) {
			console.error('Error saving product:', error);
		}
	}

	function deleteProduct(productId: number) {
		if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
			products = products.filter(p => p.id !== productId);
			dispatch('products-updated', products);
		}
	}

	function getFilteredProducts() {
		if (!searchQuery) return products;
		return products.filter(p => 
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.description.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}

	function formatCurrency(price: number): string {
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS'
		}).format(price);
	}

	function getStockStatus(stock: number) {
		if (stock === 0) return { label: 'Sin Stock', class: 'stock-out' };
		if (stock <= 3) return { label: 'Stock Bajo', class: 'stock-low' };
		return { label: 'En Stock', class: 'stock-ok' };
	}

	$: filteredProducts = getFilteredProducts();
</script>

<div class="product-manager">
	<div class="manager-header">
		<div class="header-left">
			<h3>Gestión de Productos</h3>
			<span class="product-count">{filteredProducts.length} productos</span>
		</div>
		<div class="header-actions">
			<button class="btn btn-primary" on:click={openAddModal}>
				<Plus size={16} />
				Nuevo Producto
			</button>
		</div>
	</div>

	<div class="filters-section">
		<div class="search-box">
			<Search size={18} />
			<input 
				type="text" 
				placeholder="Buscar productos..."
				bind:value={searchQuery}
			/>
		</div>
	</div>

	<div class="products-table">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Cargando productos...</p>
			</div>
		{:else if filteredProducts.length === 0}
			<div class="empty-state">
				<Package size={48} />
				<p>No se encontraron productos</p>
				<button class="btn btn-outline" on:click={openAddModal}>
					Agregar primer producto
				</button>
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Producto</th>
						<th>Categoría</th>
						<th>Precio</th>
						<th>Stock</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredProducts as product}
						<tr>
							<td class="product-info">
								<img src={product.image} alt={product.name} class="product-thumb" />
								<div>
									<h4>{product.name}</h4>
									<p>{product.description}</p>
								</div>
							</td>
							<td>
								<span class="category-badge">{product.category}</span>
							</td>
							<td class="price">
								{formatCurrency(product.price)}
							</td>
							<td>
								{#if product.stock !== undefined}
									{@const stockStatus = getStockStatus(product.stock)}
									<span class="stock-badge {stockStatus.class}">
										{stockStatus.label}
									</span>
								{/if}
							</td>
							<td class="actions">
								<button class="action-btn edit" title="Editar" on:click={() => openAddModal()}>
									<Edit size={16} />
								</button>
								<button class="action-btn delete" title="Eliminar" on:click={() => deleteProduct(product.id)}>
									<Trash2 size={16} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	{#if showAddModal}
		<div class="modal-overlay" on:click={closeModals}>
			<div class="modal" on:click|stopPropagation>
				<div class="modal-header">
					<h3>Nuevo Producto</h3>
					<button class="close-btn" on:click={closeModals}>×</button>
				</div>
				
				<div class="modal-body">
					<div class="form-group">
						<label>Nombre del producto</label>
						<input type="text" bind:value={editingProduct.name} placeholder="Ej: Silla Vintage" />
					</div>
					
					<div class="form-group">
						<label>Descripción</label>
						<textarea bind:value={editingProduct.description} placeholder="Descripción del producto"></textarea>
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label>Precio</label>
							<input type="number" bind:value={editingProduct.price} min="0" step="0.01" />
						</div>
						
						<div class="form-group">
							<label>Stock</label>
							<input type="number" bind:value={editingProduct.stock} min="0" />
						</div>
					</div>
					
					<div class="form-group">
						<label>Categoría</label>
						<select bind:value={editingProduct.category}>
							{#each categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
					
					<div class="form-group">
						<label>URL de imagen</label>
						<input type="url" bind:value={editingProduct.image} placeholder="https://..." />
					</div>
				</div>
				
				<div class="modal-footer">
					<button class="btn btn-outline" on:click={closeModals}>Cancelar</button>
					<button class="btn btn-primary" on:click={saveProduct}>Crear</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.product-manager {
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

	.product-count {
		font-size: 0.875rem;
		color: #64748b;
	}

	.filters-section {
		padding: 1rem 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.search-box {
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

	.products-table {
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

	.product-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.product-thumb {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		object-fit: cover;
	}

	.product-info h4 {
		margin: 0 0 0.25rem 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: #1e293b;
	}

	.product-info p {
		margin: 0;
		font-size: 0.8rem;
		color: #64748b;
	}

	.category-badge {
		background: #e0e7ff;
		color: #3730a3;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.price {
		font-weight: 600;
		color: #059669;
	}

	.stock-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.stock-badge.stock-ok {
		background: #d1fae5;
		color: #065f46;
	}

	.stock-badge.stock-low {
		background: #fef3c7;
		color: #92400e;
	}

	.stock-badge.stock-out {
		background: #fee2e2;
		color: #991b1b;
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

	.action-btn.edit {
		background: #fef3c7;
		color: #92400e;
	}

	.action-btn.delete {
		background: #fee2e2;
		color: #991b1b;
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

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 12px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #64748b;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #1f2937;
		background: white;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid #e2e8f0;
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-primary {
		background: #4ade80;
		color: white;
	}

	.btn-outline {
		background: white;
		color: #64748b;
		border: 1px solid #e2e8f0;
	}
</style> 