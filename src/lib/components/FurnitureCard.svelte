<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Furniture } from '$lib/types';

	export let item: Furniture;
	
	const dispatch = createEventDispatcher();

	function addToCart() {
		dispatch('add-to-cart');
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}

	function getCategoryIcon(category: string) {
		const icons: Record<string, string> = {
			'sillas': '🪑',
			'mesas': '🪑',
			'muebles': '🪑'
		};
		return icons[category] || '🪑';
	}
</script>

<div class="furniture-card">
	<div class="image-container">
		<img 
			src={item.image} 
			alt={item.name}
			on:error={(e) => {
				const target = e.target as HTMLImageElement;
				if (target) target.src = '/images/placeholder.jpg';
			}}
		/>
		<div class="image-overlay">
			<div class="category-badge">
				{getCategoryIcon(item.category)} {item.category}
			</div>
		</div>
	</div>
	
	<div class="content">
		<div class="header">
			<h3>{item.name}</h3>
			<span class="price">{formatPrice(item.price)}</span>
		</div>
		
		<p class="description">{item.description}</p>
		
		<div class="actions">
			<button class="add-to-cart-btn" on:click={addToCart}>
				🛒 Agregar al Carrito
			</button>
		</div>
	</div>
</div>

<style>
	.furniture-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		transition: all 0.3s ease;
		border: 1px solid #f0f0f0;
		position: relative;
	}

	.furniture-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
		border-color: var(--primary-color);
	}

	.image-container {
		width: 100%;
		height: 250px;
		overflow: hidden;
		background: #f8f9fa;
		position: relative;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.furniture-card:hover .image-container img {
		transform: scale(1.08);
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.1) 0%,
			transparent 30%,
			transparent 70%,
			rgba(0, 0, 0, 0.1) 100%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.furniture-card:hover .image-overlay {
		opacity: 1;
	}

	.category-badge {
		position: absolute;
		top: 12px;
		left: 12px;
		background: rgba(255, 255, 255, 0.95);
		color: var(--dark-color);
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		backdrop-filter: blur(10px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.content {
		padding: 1.5rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.8rem;
		gap: 1rem;
	}

	h3 {
		margin: 0;
		font-size: 1.3rem;
		color: var(--dark-color);
		font-weight: 700;
		line-height: 1.3;
		flex: 1;
	}

	.price {
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--success-color);
		white-space: nowrap;
	}

	.description {
		color: var(--gray-color);
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0 0 1.5rem 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.actions {
		display: flex;
		gap: 0.8rem;
	}

	.add-to-cart-btn {
		width: 100%;
		background: var(--primary-color);
		color: white;
		border: none;
		padding: 1rem;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.add-to-cart-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.add-to-cart-btn:hover::before {
		left: 100%;
	}

	.add-to-cart-btn:hover {
		background: #0081d6;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 149, 246, 0.3);
	}

	.add-to-cart-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.image-container {
			height: 200px;
		}

		.content {
			padding: 1.2rem;
		}

		h3 {
			font-size: 1.2rem;
		}

		.price {
			font-size: 1.3rem;
		}

		.add-to-cart-btn {
			padding: 0.9rem;
		}
	}
</style> 