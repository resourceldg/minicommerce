<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Furniture } from '$lib/types';
	import { CHECKOUT_CONFIG, calculateVolumeDiscount, estimateDeliveryTime, validateCart } from '$lib/checkoutConfig';
import { recommendationEngine, type IntelligentRecommendation } from '$lib/recommendationEngine';

	export let items: Array<{ item: Furniture; quantity: number }>;
	export let isOpen: boolean;
	
	// Event dispatcher para notificar actividad del usuario
	const dispatch = createEventDispatcher();

	// Estado para funcionalidades inteligentes
	let recommendations: IntelligentRecommendation[] = [];
	let volumeDiscount = 0;
	let estimatedDelivery = '';
	let cartValidation: { isValid: boolean; messages: string[] } = { isValid: true, messages: [] };
	let showRecommendations = false;

	// Usar configuración centralizada

	onMount(() => {
		// Cargar recomendaciones al abrir
		if (isOpen && items.length > 0) {
			loadRecommendations();
			calculateLocalVolumeDiscount();
			estimateLocalDelivery();
			validateLocalCart();
		}
	});

	// Función para cargar recomendaciones inteligentes
	async function loadRecommendations() {
		try {
			// Cargar todos los productos disponibles
			const response = await fetch('/api/furniture');
			if (response.ok) {
				const allFurniture: Furniture[] = await response.json();
				
				// Generar recomendaciones inteligentes usando el motor
				recommendations = await recommendationEngine.generateRecommendations(
					items,
					allFurniture,
					CHECKOUT_CONFIG.VALIDATIONS.RECOMMENDATIONS_LIMIT
				);
			}
		} catch (error) {
			console.log('No se pudieron cargar recomendaciones:', error);
		}
	}

	// Función para calcular descuento por volumen
	function calculateLocalVolumeDiscount() {
		const subtotal = items.reduce((total, { item, quantity }) => {
			return total + (item.price * quantity);
		}, 0);

		volumeDiscount = calculateVolumeDiscount(subtotal, CHECKOUT_CONFIG.VOLUME_DISCOUNTS);
	}

	// Función para estimar tiempo de entrega
	function estimateLocalDelivery() {
		const totalItems = items.reduce((sum, { quantity }) => sum + quantity, 0);
		const hasLargeItems = items.some(({ item }) => 
			CHECKOUT_CONFIG.LARGE_ITEM_CATEGORIES.includes(item.category)
		);

		estimatedDelivery = estimateDeliveryTime(totalItems, hasLargeItems, CHECKOUT_CONFIG.DELIVERY_ESTIMATES);
	}

	// Función para validar el carrito
	function validateLocalCart() {
		const validation = validateCart(items, CHECKOUT_CONFIG);
		cartValidation = {
			isValid: validation.isValid,
			messages: [...validation.messages, ...validation.warnings]
		};
	}

	function closeCheckout() {
		dispatch('close');
	}

	function updateQuantity(index: number, newQuantity: number) {
		if (newQuantity < 1) return;
		dispatch('update-quantity', { index, quantity: newQuantity });
		dispatch('user-activity'); // Notificar actividad del usuario
		
		// Recalcular descuentos y validaciones
		setTimeout(() => {
			calculateLocalVolumeDiscount();
			estimateLocalDelivery();
			validateLocalCart();
		}, 100);
	}

	function removeItem(index: number) {
		dispatch('remove-item', { index });
		dispatch('user-activity'); // Notificar actividad del usuario
		
		// Recalcular descuentos y validaciones
		setTimeout(() => {
			calculateLocalVolumeDiscount();
			estimateLocalDelivery();
			validateLocalCart();
			loadRecommendations();
		}, 100);
	}

	function addRecommendation(product: Furniture) {
		dispatch('add-recommendation', product);
		dispatch('user-activity');
	}

	function buyNow() {
		dispatch('buy-now');
		dispatch('user-activity'); // Notificar actividad del usuario
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

	$: discountedAmount = totalAmount * (1 - volumeDiscount);
	$: discountAmount = totalAmount - discountedAmount;
	$: itemCount = items.reduce((count, { quantity }) => count + quantity, 0);

	// Observar cambios en items para recalcular
	$: if (items.length > 0) {
		calculateLocalVolumeDiscount();
		estimateLocalDelivery();
		validateLocalCart();
	}
</script>

{#if isOpen}
	<div class="checkout-overlay" on:click={closeCheckout}>
		<div class="checkout-panel" on:click|stopPropagation>
			<div class="checkout-header">
				<h2>Tu Selección Inteligente</h2>
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
					<!-- Validaciones del carrito -->
					{#if cartValidation.messages.length > 0}
						<div class="cart-validation">
							{#each cartValidation.messages as message}
								<div class="validation-message">
									<span class="validation-icon">💡</span>
									{message}
								</div>
							{/each}
						</div>
					{/if}

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

					<!-- Resumen inteligente -->
					<div class="checkout-summary">
						<div class="summary-row">
							<span>Productos ({itemCount})</span>
							<span>{formatPrice(totalAmount)}</span>
						</div>
						
						{#if volumeDiscount > 0}
							<div class="discount-row">
								<span>Descuento por volumen</span>
								<span class="discount-amount">-{formatPrice(discountAmount)}</span>
							</div>
							<div class="discount-info">
								{formatPrice(totalAmount)} → {formatPrice(discountedAmount)}
							</div>
						{/if}
						
						<div class="total-row">
							<span class="total-label">Total</span>
							<span class="total-amount">
								{formatPrice(volumeDiscount > 0 ? discountedAmount : totalAmount)}
							</span>
						</div>

						<!-- Información de entrega -->
						<div class="delivery-info">
							<span class="delivery-icon">🚚</span>
							<span>{estimatedDelivery}</span>
						</div>
					</div>

					<!-- Recomendaciones inteligentes -->
					{#if recommendations.length > 0}
						<div class="recommendations-section">
							<button 
								class="recommendations-toggle"
								on:click={() => showRecommendations = !showRecommendations}
							>
								🎯 Productos que te pueden gustar
								<span class="toggle-icon">{showRecommendations ? '−' : '+'}</span>
							</button>
							
							{#if showRecommendations}
								<div class="recommendations-list">
									{#each recommendations as recommendation}
										<div class="recommendation-item">
											<img src={recommendation.product.image} alt={recommendation.product.name} />
											<div class="recommendation-details">
												<h4>{recommendation.product.name}</h4>
												<p class="recommendation-price">{formatPrice(recommendation.product.price)}</p>
												<p class="recommendation-reason">{recommendation.reason}</p>
												<div class="recommendation-meta">
													<span class="score">Score: {recommendation.score}</span>
													<span class="type">{recommendation.type}</span>
												</div>
											</div>
											<button 
												class="add-recommendation-btn"
												on:click={() => addRecommendation(recommendation.product)}
											>
												+
											</button>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					<div class="checkout-actions">
						<button class="buy-now-btn" on:click={buyNow}>
							🛒 Comprar Ahora
						</button>
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
		padding: 1rem;
	}

	.checkout-item {
		display: grid;
		grid-template-columns: 80px 1fr auto auto 40px;
		gap: 1rem;
		align-items: center;
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		margin-bottom: 1rem;
		background: white;
		transition: all 0.2s ease;
	}

	.checkout-item:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 8px var(--color-shadow);
	}

	.item-image {
		width: 80px;
		height: 80px;
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
		width: 32px;
		height: 32px;
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.2rem;
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
		width: 32px;
		height: 32px;
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition: all 0.2s ease;
	}

	.remove-btn:hover {
		background: #ff4757;
		color: white;
		border-color: #ff4757;
	}

	.checkout-summary {
		padding: 1.5rem;
		border-top: 1px solid var(--color-border);
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

	.cart-validation {
		padding: 1rem;
		background: var(--color-stone);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.validation-message {
		display: flex;
		align-items: center;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.validation-icon {
		margin-right: 0.5rem;
		font-size: 1.1rem;
	}

	.recommendations-section {
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.recommendations-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.8rem 1rem;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.recommendations-toggle::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.recommendations-toggle:hover::before {
		left: 100%;
	}

	.recommendations-toggle:hover {
		background: var(--color-accent-light);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px var(--color-shadow);
	}

	.recommendations-toggle:active {
		transform: translateY(0);
	}

	.toggle-icon {
		font-size: 1.2rem;
		transition: transform 0.3s ease;
	}

	.recommendations-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		padding-top: 1rem;
	}

	.recommendation-item {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.8rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.recommendation-item:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 8px var(--color-shadow);
	}

	.recommendation-item img {
		width: 50px;
		height: 50px;
		border-radius: 6px;
		object-fit: cover;
	}

	.recommendation-details h4 {
		margin: 0 0 0.3rem 0;
		font-size: 0.9rem;
		color: var(--color-text);
		font-weight: 600;
	}

	.recommendation-price {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}

	.recommendation-reason {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		margin: 4px 0;
		font-style: italic;
	}

	.recommendation-meta {
		display: flex;
		gap: var(--spacing-xs);
		margin-top: 4px;
	}

	.recommendation-meta .score {
		font-size: 0.75rem;
		color: var(--color-accent);
		font-weight: 600;
	}

	.recommendation-meta .type {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		text-transform: capitalize;
		padding: 2px 6px;
		background: var(--color-stone);
		border-radius: 3px;
	}

	.add-recommendation-btn {
		background: var(--color-accent);
		color: white;
		border: none;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.add-recommendation-btn:hover {
		background: var(--color-accent-light);
		transform: translateY(-2px);
	}

	.discount-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.discount-amount {
		font-weight: 600;
		color: var(--color-accent);
	}

	.discount-info {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin-top: 0.3rem;
	}

	.delivery-info {
		display: flex;
		align-items: center;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		margin-top: 1rem;
	}

	.delivery-icon {
		margin-right: 0.5rem;
		font-size: 1.1rem;
	}

	/* Estilos para el resumen con descuentos */
	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.discount-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.discount-amount {
		font-weight: 600;
		color: var(--color-accent);
	}

	.discount-info {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin-top: 0.3rem;
		padding: 0.5rem;
		background: var(--color-stone);
		border-radius: 6px;
		text-align: center;
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
</style> 