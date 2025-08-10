<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		Search,
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
	export let searchOpen: boolean = false;
	export let searchQuery: string = '';
	export let onToggleSearch: () => void;
	export let onSearchInput: (query: string) => void;

	const dispatch = createEventDispatcher();

	function selectCategory(categoryId: string) {
		dispatch('select', categoryId);
	}

	function getCategoryIcon(categoryId: string) {
		const iconMap: Record<string, any> = {
			'sillas': Armchair,
			'mesas': Square,
			'muebles': Bed,
			'iluminacion': Lightbulb,
			'decoracion': Box,
			'libros': BookOpen,
			'favoritos': Star
		};
		return iconMap[categoryId] || Armchair;
	}
</script>

<div class="category-scroll-container">
	<div class="category-scroll {searchOpen ? 'search-expanded' : ''}">
		<!-- Botón de búsqueda expandible -->
		<div class="search-container {searchOpen ? 'expanded' : ''}">
			{#if !searchOpen}
				<button 
					class="search-category-item"
					on:click={onToggleSearch}
					on:keydown={(e) => e.key === 'Enter' && onToggleSearch()}
					aria-label="Abrir búsqueda"
				>
					<div class="category-icon">
						<Search size={20} />
					</div>
					<span class="category-name">Buscar</span>
				</button>
			{:else}
				<div class="search-input-wrapper">
					<Search size={20} class="search-icon" />
					<input
						type="text"
						placeholder="Buscar artefactos únicos..."
						bind:value={searchQuery}
						on:input={(e) => onSearchInput((e.target as HTMLInputElement).value)}
						class="search-input"
						autofocus
					/>
					<button 
						class="search-close-btn"
						on:click={onToggleSearch}
						aria-label="Cerrar búsqueda"
					>
						×
					</button>
				</div>
			{/if}
		</div>

		<!-- Categorías -->
		<div class="categories-wrapper {searchOpen ? 'pushed' : ''}">
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
		align-items: flex-start;
	}

	.category-scroll.search-expanded {
		justify-content: flex-start;
	}

	.category-scroll::-webkit-scrollbar {
		display: none;
	}

	.search-container {
		display: flex;
		align-items: center;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		min-width: 80px;
	}

	.search-container.expanded {
		min-width: 300px;
		width: 300px;
		padding: 12px 16px;
		border-radius: 12px;
		background: var(--color-stone);
		border: 1px solid var(--color-border);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		flex-grow: 1;
		background: transparent;
		border-radius: 8px;
		padding: 4px 8px;
		border: none;
	}

	.search-input {
		flex-grow: 1;
		border: none;
		outline: none;
		padding: 8px 12px;
		font-size: 14px;
		background: transparent;
		color: var(--color-text);
	}

	.search-input::placeholder {
		color: var(--color-text-secondary);
	}

	.search-close-btn {
		background: none;
		border: none;
		font-size: 20px;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 4px;
		border-radius: 50%;
		transition: background 0.2s ease;
		margin-left: 8px;
	}

	.search-close-btn:hover {
		background: var(--color-border);
	}

	.search-category-item {
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

	.search-category-item:hover {
		background: rgba(0, 0, 0, 0.02);
		transform: translateY(-2px);
	}

	.search-category-item.active {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 8px 25px rgba(74, 222, 128, 0.3);
	}

	.search-category-item.active .category-icon {
		color: white;
		background: rgba(255, 255, 255, 0.2);
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

	.categories-wrapper {
		display: flex;
		gap: 16px;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.categories-wrapper.pushed {
		transform: translateX(220px); /* Ajustado para empujar las categorías */
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