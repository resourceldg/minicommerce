<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CartItem } from '$lib/types';

	export let cart: CartItem[];
	
	const dispatch = createEventDispatcher();

	function removeItem(index: number) {
		dispatch('remove-item', index);
	}

	function clearCart() {
		dispatch('clear-cart');
	}

	function updateQuantity(index: number, newQuantity: number) {
		if (newQuantity <= 0) {
			removeItem(index);
		} else {
			const updatedCart = [...cart];
			updatedCart[index].quantity = newQuantity;
			dispatch('update-cart', updatedCart);
		}
	}

	function getTotal() {
		return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	}

	function getItemCount() {
		return cart.reduce((sum, item) => sum + item.quantity, 0);
	}

	function checkout() {
		if (cart.length === 0) return;

		const items = cart.map(item => `${item.name} x${item.quantity} - $${item.price * item.quantity}`);
		const total = getTotal();
		
		const message = `🪑 *Nuevo Pedido de Muebles Restaurados* 🪑\n\n` +
			`*Productos:*\n${items.join('\n')}\n\n` +
			`*Total: $${total}*\n\n` +
			`¡Hola! Me gustaría hacer este pedido. ¿Podrías confirmarme disponibilidad y opciones de entrega?`;

		const whatsappUrl = `https://wa.me/+1234567890?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, '_blank');
	}
</script>

<div class="cart">
	<div class="cart-header">
		<h3>🛒 Carrito ({getItemCount()})</h3>
		<div class="header-actions">
			{#if cart.length > 0}
				<button class="clear-btn" on:click={clearCart}>
					🗑️ Limpiar
				</button>
			{/if}
			<button class="close-btn" on:click={() => dispatch('close')}>
				✕
			</button>
		</div>
	</div>

	{#if cart.length === 0}
		<div class="empty-cart">
			<p>Tu carrito está vacío</p>
			<p class="hint">Agrega algunos muebles para comenzar</p>
		</div>
	{:else}
		<div class="cart-items">
			{#each cart as item, index}
				<div class="cart-item">
					<div class="item-image">
						<img src={item.image} alt={item.name} />
					</div>
					<div class="item-info">
						<h4>{item.name}</h4>
						<p class="item-price">${item.price}</p>
						<div class="quantity-controls">
							<button 
								class="qty-btn" 
								on:click={() => updateQuantity(index, item.quantity - 1)}
								aria-label="Reducir cantidad"
							>
								➖
							</button>
							<span class="quantity">{item.quantity}</span>
							<button 
								class="qty-btn" 
								on:click={() => updateQuantity(index, item.quantity + 1)}
								aria-label="Aumentar cantidad"
							>
								➕
							</button>
						</div>
					</div>
					<div class="item-total">
						<span class="total-price">${item.price * item.quantity}</span>
						<button 
							class="remove-btn" 
							on:click={() => removeItem(index)}
							aria-label="Eliminar item"
						>
							❌
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="cart-footer">
			<div class="total">
				<strong>Total: ${getTotal()}</strong>
			</div>
			<button class="checkout-btn" on:click={checkout}>
				💬 Comprar por WhatsApp
			</button>
		</div>
	{/if}
</div>

<style>
	.cart {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #f0f0f0;
		overflow: hidden;
	}

	.cart-header {
		background: #f8f9fa;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e9ecef;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.cart-header h3 {
		margin: 0;
		color: #2c3e50;
		font-size: 1.1rem;
	}

	.clear-btn {
		background: none;
		border: none;
		color: #e74c3c;
		cursor: pointer;
		font-size: 0.9rem;
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.clear-btn:hover {
		background: #fdf2f2;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.2rem;
		color: #888;
		padding: 0.3rem;
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.close-btn:hover {
		background: #f0f0f0;
	}

	.empty-cart {
		padding: 2rem 1.5rem;
		text-align: center;
		color: #7f8c8d;
	}

	.empty-cart p {
		margin: 0.5rem 0;
	}

	.hint {
		font-size: 0.9rem;
		color: #bdc3c7;
	}

	.cart-items {
		max-height: 400px;
		overflow-y: auto;
	}

	.cart-item {
		display: flex;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #f0f0f0;
		gap: 1rem;
	}

	.cart-item:last-child {
		border-bottom: none;
	}

	.item-image {
		width: 60px;
		height: 60px;
		border-radius: 8px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-info {
		flex: 1;
		min-width: 0;
	}

	.item-info h4 {
		margin: 0 0 0.3rem 0;
		font-size: 1rem;
		color: #2c3e50;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-price {
		margin: 0 0 0.5rem 0;
		color: #27ae60;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.qty-btn {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		color: #495057;
		cursor: pointer;
		font-size: 0.8rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		transition: all 0.2s ease;
		min-width: 28px;
	}

	.qty-btn:hover {
		background: #e9ecef;
		border-color: #adb5bd;
	}

	.quantity {
		font-weight: 600;
		color: #495057;
		min-width: 20px;
		text-align: center;
	}

	.item-total {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.total-price {
		font-weight: 700;
		color: #27ae60;
		font-size: 1rem;
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
		padding: 0.3rem;
		border-radius: 4px;
		transition: background 0.2s ease;
		color: #e74c3c;
	}

	.remove-btn:hover {
		background: #fdf2f2;
	}

	.cart-footer {
		background: #f8f9fa;
		padding: 1.5rem;
		border-top: 1px solid #e9ecef;
	}

	.total {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 1.2rem;
		color: #2c3e50;
	}

	.checkout-btn {
		width: 100%;
		background: #25d366;
		color: white;
		border: none;
		padding: 1rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.checkout-btn:hover {
		background: #128c7e;
	}

	.checkout-btn:active {
		transform: scale(0.98);
	}
</style> 