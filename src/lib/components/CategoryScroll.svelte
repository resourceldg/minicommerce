<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		Home, 
		Armchair, 
		Square, 
		Bed, 
		Lightbulb, 
		Box, 
		BookOpen,
		Star
	} from 'lucide-svelte';
	import type { Category } from '$lib/types';

	export let categories: Category[];

	const dispatch = createEventDispatcher();

	function selectCategory(categoryId: string) {
		dispatch('select', categoryId);
	}

	function getCategoryIcon(categoryId: string) {
		const iconMap: Record<string, any> = {
			'todos': Home,
			'sillas': Armchair,
			'mesas': Square,
			'muebles': Bed,
			'iluminacion': Lightbulb,
			'decoracion': Box,
			'libros': BookOpen,
			'favoritos': Star
		};
		return iconMap[categoryId] || Home;
	}
</script>

<div class="category-scroll-container">
	<div class="category-scroll">
		{#each categories as category}
			{@const Icon = getCategoryIcon(category.id)}
			<button 
				class="category-item {category.active ? 'active' : ''}"
				on:click={() => selectCategory(category.id)}
				on:keydown={(e) => e.key === 'Enter' && selectCategory(category.id)}
				aria-label="Filtrar por categoría {category.name}"
				aria-pressed={category.active}
			>
				<div class="category-icon">
					<svelte:component this={Icon} size={20} />
				</div>
				<span class="category-name">{category.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.category-scroll-container {
		width: 100%;
		overflow: hidden;
		position: relative;
	}

	.category-scroll {
		display: flex;
		gap: 16px;
		padding: 16px 20px;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-behavior: smooth;
	}

	.category-scroll::-webkit-scrollbar {
		display: none;
	}

	.category-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		min-width: 80px;
		padding: 12px 8px;
		border: none;
		background: none;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 12px;
		position: relative;
	}

	.category-item:hover {
		background: rgba(0, 0, 0, 0.02);
		transform: translateY(-2px);
	}

	.category-item.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
	}

	.category-item.active .category-icon {
		color: white;
	}

	.category-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.04);
		transition: all 0.3s ease;
		color: #666;
	}

	.category-item.active .category-icon {
		background: rgba(255, 255, 255, 0.2);
	}

	.category-name {
		font-size: 12px;
		font-weight: 500;
		text-align: center;
		white-space: nowrap;
	}

	/* Scroll indicators */
	.category-scroll-container::before,
	.category-scroll-container::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 40px;
		pointer-events: none;
		z-index: 1;
	}

	.category-scroll-container::before {
		left: 0;
		background: linear-gradient(to right, white 0%, transparent 100%);
	}

	.category-scroll-container::after {
		right: 0;
		background: linear-gradient(to left, white 0%, transparent 100%);
	}

	@media (max-width: 768px) {
		.category-scroll {
			padding: 12px 16px;
			gap: 12px;
		}

		.category-item {
			min-width: 70px;
			padding: 10px 6px;
		}

		.category-icon {
			width: 40px;
			height: 40px;
		}

		.category-name {
			font-size: 11px;
		}
	}
</style> 