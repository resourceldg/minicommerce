<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Furniture } from '$lib/types';

	export let items: Array<{ item: Furniture; quantity: number }>;
	export let isOpen: boolean;
	
	const dispatch = createEventDispatcher();

	// Función para deshabilitar scroll del body
	function disableBodyScroll() {
		document.body.style.overflow = 'hidden';
		document.body.style.paddingRight = '10px'; // Compensar el scrollbar que desaparece
	}

	// Función para habilitar scroll del body
	function enableBodyScroll() {
		document.body.style.overflow = '';
		document.body.style.paddingRight = '';
	}

	function closeCheckout() {
		enableBodyScroll();
		dispatch('close');
	}

	function updateQuantity(index: number, newQuantity: number) {
		if (newQuantity < 1) return;
		dispatch('update-quantity', { index, quantity: newQuantity });
	}

	function removeItem(index: number) {
		dispatch('remove-item', { index });
	}

	function buyNow() {
		dispatch('buy-now');
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}

	$: totalAmount = items.reduce((total, { item, quantity }) => {
		return total + (item.price * quantity);
	}, 0);

	$: itemCount = items.reduce((count, { quantity }) => count + quantity, 0);

	// Watcher para controlar el scroll del body cuando se abre/cierra el checkout
	$: if (isOpen) {
		disableBodyScroll();
	} else {
		enableBodyScroll();
	}

	// Cleanup cuando el componente se destruye
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		enableBodyScroll();
	});
</script>

{#if isOpen}
	<div class="checkout-overlay" on:click={closeCheckout}>
		<div class="checkout-panel" on:click|stopPropagation>
			<div class="checkout-header">
				<h2>Tu Selección</h2>
				<button class="close-btn" on:click={closeCheckout}>×</button>
			</div>

			{#if items.length === 0}
				<div class="empty-cart">
					<p>No hay productos seleccionados</p>
					<button class="continue-shopping" on:click={closeCheckout}>
						Continuar explorando
					</button>
				</div>
			{:else}
				<div class="checkout-content">
					<!-- Lista de productos con scroll -->
					<div class="items-list">
						{#each items as { item, quantity }, index}
							<div class="checkout-item">
								<div class="item-image">
									<img 
										src={item.image} 
										alt={item.name}
										on:error={(e) => {
											const target = e.target as HTMLImageElement;
											if (target) target.src = '/images/placeholder.jpg';
										}}
									/>
								</div>
								
								<div class="item-details">
									<h3>{item.name}</h3>
									<p class="item-category">{item.category}</p>
									<div class="item-price">{formatPrice(item.price)}</div>
								</div>
								
								<div class="item-quantity">
									<button 
										class="qty-btn" 
										on:click={() => updateQuantity(index, quantity - 1)}
										disabled={quantity <= 1}
									>
										−
									</button>
									<span class="quantity">{quantity}</span>
									<button 
										class="qty-btn" 
										on:click={() => updateQuantity(index, quantity + 1)}
									>
										+
									</button>
								</div>
								
								<div class="item-subtotal">
									{formatPrice(item.price * quantity)}
								</div>
								
								<button 
									class="remove-btn" 
									on:click={() => removeItem(index)}
									title="Eliminar producto"
								>
									×
								</button>
							</div>
						{/each}
					</div>

					<!-- Footer fijo con resumen y acciones -->
					<div class="checkout-footer">
						<!-- Resumen simple -->
						<div class="checkout-summary">
							<div class="summary-row">
								<span>Productos ({itemCount})</span>
								<span>{formatPrice(totalAmount)}</span>
							</div>
							
							<div class="total-row">
								<span class="total-label">Total</span>
								<span class="total-amount">{formatPrice(totalAmount)}</span>
							</div>
						</div>

						<div class="checkout-actions">
							<button class="buy-now-btn" on:click={buyNow}>
								🛒 Comprar Ahora
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Variables CSS globales para consistencia */
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

	.checkout-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: flex-end;
		align-items: stretch;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	.checkout-panel {
		background: white;
		width: 100%;
		max-width: 500px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		animation: slideIn 0.3s ease;
	}

	.checkout-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.checkout-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--color-text);
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 2rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: var(--color-border);
		color: var(--color-text);
	}

	.checkout-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.items-list {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1.2rem;
		/* Scroll aparece al tercer producto en desktop */
		max-height: 45vh;
		/* Márgenes para mejor separación */
		margin: 0 0.8rem 0.8rem 0.8rem;
		/* Borde sutil para definir mejor el área */
		border: 1px solid #f0f0f0;
		border-radius: 8px;
		background: #fafafa;
		/* Asegurar que no se desborde */
		width: calc(100% - 1.6rem);
		box-sizing: border-box;
	}

	/* Scrollbar del checkout - más visible y diferenciado */
	.items-list::-webkit-scrollbar {
		width: 8px;
	}

	.items-list::-webkit-scrollbar-track {
		background: #f0f0f0;
		border-radius: 4px;
	}

	.items-list::-webkit-scrollbar-thumb {
		background: #22c55e;
		border-radius: 4px;
		border: 1px solid #16a34a;
	}

	.items-list::-webkit-scrollbar-thumb:hover {
		background: #16a34a;
	}

	/* Scrollbar para Firefox */
	.items-list {
		scrollbar-width: thin;
		scrollbar-color: #22c55e #f0f0f0;
	}

	.checkout-item {
		display: grid;
		grid-template-columns: 70px 1fr auto auto 35px;
		gap: 0.8rem;
		align-items: center;
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		margin-bottom: 1rem;
		background: white;
		transition: all 0.2s ease;
		/* Sombra sutil para mejor separación visual */
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		/* Asegurar que no se desborde */
		min-width: 0;
	}

	.checkout-item:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 8px var(--color-shadow);
	}

	.item-image {
		width: 70px;
		height: 70px;
		border-radius: 8px;
		overflow: hidden;
		background: var(--color-surface);
	}

	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-details h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: var(--color-text);
		font-weight: 600;
		line-height: 1.3;
	}

	.item-category {
		margin: 0 0 0.5rem 0;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		text-transform: capitalize;
	}

	.item-price {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-accent);
	}

	.item-quantity {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.qty-btn {
		width: 28px;
		height: 28px;
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.qty-btn:hover:not(:disabled) {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
	}

	.qty-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.quantity {
		min-width: 30px;
		text-align: center;
		font-weight: 600;
		color: var(--color-text);
	}

	.item-subtotal {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-accent);
		text-align: right;
	}

	.remove-btn {
		width: 28px;
		height: 28px;
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition: all 0.2s ease;
	}

	.remove-btn:hover {
		background: #ff4757;
		color: white;
		border-color: #ff4757;
	}

	.checkout-footer {
		/* Footer fijo en la parte inferior */
		flex-shrink: 0;
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
	}

	.checkout-summary {
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.total-label {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.total-amount {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-accent);
	}

	.checkout-actions {
		padding: 1.5rem;
		border-top: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.buy-now-btn {
		width: 100%;
		background: var(--color-accent);
		color: white;
		border: none;
		padding: 1.2rem;
		border-radius: 12px;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.buy-now-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.buy-now-btn:hover::before {
		left: 100%;
	}

	.buy-now-btn:hover {
		background: var(--color-accent-light);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px var(--color-shadow);
	}

	.buy-now-btn:active {
		transform: translateY(0);
	}

	.empty-cart {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		text-align: center;
	}

	.empty-cart p {
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
	}

	.continue-shopping {
		background: var(--color-accent);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.continue-shopping:hover {
		background: var(--color-accent-light);
		transform: translateY(-2px);
	}



	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideIn {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}

	@media (max-width: 768px) {
		.checkout-panel {
			max-width: 100%;
		}

		.checkout-content {
			/* Asegurar que el contenido se ajuste al viewport en móviles */
			min-height: 0;
			/* Forzar que el footer esté siempre visible */
			justify-content: space-between;
		}

		.items-list {
			/* Reducir altura máxima para móviles - scroll aparece al segundo producto */
			max-height: 30vh;
			/* Asegurar que no ocupe todo el espacio disponible */
			flex-shrink: 1;
			margin: 0 0.8rem 0.8rem 0.8rem;
			padding: 1rem;
		}

		.checkout-footer {
			/* Footer siempre visible en la parte inferior */
			flex-shrink: 0;
			/* Asegurar que esté en la parte inferior */
			margin-top: auto;
		}

		.checkout-item {
			grid-template-columns: 60px 1fr auto;
			gap: 0.8rem;
			padding: 0.8rem;
		}

		.item-image {
			width: 60px;
			height: 60px;
		}

		.item-quantity {
			grid-column: 2;
			justify-self: start;
			margin-top: 0.5rem;
		}

		.item-subtotal {
			grid-column: 3;
			grid-row: 1;
			justify-self: end;
		}

		.remove-btn {
			grid-column: 3;
			grid-row: 2;
			justify-self: end;
		}
	}

	/* Nota: Los estilos globales del scroll se manejan en el componente principal */
</style> 