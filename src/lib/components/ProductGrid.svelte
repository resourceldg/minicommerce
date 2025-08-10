<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Heart, ShoppingCart } from 'lucide-svelte';
	import type { Furniture } from '$lib/types';

	export let products: Furniture[];

	const dispatch = createEventDispatcher();

	function addToCart(product: Furniture) {
		dispatch('add-to-cart', product);
	}

	function toggleFavorite(product: Furniture) {
		dispatch('toggle-favorite', product);
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0
		}).format(price);
	}
</script>

<div class="product-grid">
	{#each products as product}
		<div class="product-card">
			<div class="product-image-container">
				<img
					src={product.image}
					alt={product.name}
					loading="lazy"
					class="product-image"
					on:error={(e) => {
						console.error(`Error loading image for ${product.name}:`, product.image);
						// Fallback a imagen placeholder si falla
						const target = e.target as HTMLImageElement;
						if (target) {
							target.src = '/images/placeholder.svg';
						}
					}}
					on:load={() => {
						console.log(`Image loaded successfully for ${product.name}:`, product.image);
					}}
				/>
				
				<!-- Price overlay -->
				<div class="price-overlay">
					<span class="price">{formatPrice(product.price)}</span>
				</div>

				<!-- Action buttons -->
				<div class="action-buttons">
					<button 
						class="action-btn favorite-btn"
						on:click={() => toggleFavorite(product)}
						aria-label="Agregar a favoritos"
					>
						<Heart size={18} />
					</button>
					<button 
						class="action-btn add-to-cart-btn"
						on:click={() => addToCart(product)}
						aria-label="Agregar al carrito"
					>
						<Plus size={18} />
					</button>
				</div>

				<!-- Category badge -->
				<div class="category-badge">
					{product.category}
				</div>
			</div>

			<div class="product-info">
				<h3 class="product-name">{product.name}</h3>
				<p class="product-description">{product.description}</p>
			</div>
		</div>
	{/each}
</div>

<style>
	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 64px; /* Aumentado de var(--spacing-lg) que es 48px a 64px */
		padding: var(--spacing-md);
	}

	.product-card {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.product-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	}

	.product-image-container {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: #f8f9fa;
	}

	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.product-card:hover .product-image {
		transform: scale(1.05);
	}

	/* Price overlay */
	.price-overlay {
		position: absolute;
		top: 16px;
		left: 16px;
		background: rgba(0, 0, 0, 0.85);
		color: white;
		padding: 8px 12px;
		border-radius: 20px;
		font-weight: 600;
		font-size: 14px;
		backdrop-filter: blur(10px);
	}

	/* Action buttons */
	.action-buttons {
		position: absolute;
		top: 16px;
		right: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		opacity: 0;
		transform: translateX(10px);
		transition: all 0.3s ease;
	}

	.product-card:hover .action-buttons {
		opacity: 1;
		transform: translateX(0);
	}

	.action-btn {
		width: 40px;
		height: 40px;
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	.favorite-btn {
		background: rgba(255, 255, 255, 0.9);
		color: #666;
	}

	.favorite-btn:hover {
		background: #ff6b6b;
		color: white;
		transform: scale(1.1);
	}

	.add-to-cart-btn {
		background: rgba(255, 255, 255, 0.9);
		color: #666;
	}

	.add-to-cart-btn:hover {
		background: #4ecdc4;
		color: white;
		transform: scale(1.1);
	}

	/* Category badge */
	.category-badge {
		position: absolute;
		bottom: 16px;
		left: 16px;
		background: rgba(255, 255, 255, 0.9);
		color: #333;
		padding: 6px 12px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		backdrop-filter: blur(10px);
	}

	/* Product info */
	.product-info {
		padding: 20px;
	}

	.product-name {
		margin: 0 0 8px 0;
		font-size: 16px;
		font-weight: 600;
		color: #333;
		line-height: 1.3;
	}

	.product-description {
		margin: 0;
		font-size: 14px;
		color: #666;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.product-grid {
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
			gap: 16px;
			padding: 16px;
		}

		.product-info {
			padding: 16px;
		}

		.product-name {
			font-size: 15px;
		}

		.product-description {
			font-size: 13px;
		}

		.action-buttons {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (max-width: 480px) {
		.product-grid {
			grid-template-columns: 1fr;
			gap: 12px;
			padding: 12px;
		}
	}
</style> 