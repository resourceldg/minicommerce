// Configuración de imágenes de Unsplash para muebles
export const furnitureImages = {
	// Sillas
	chairs: [
		'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center'
	],
	
	// Mesas
	tables: [
		'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop&crop=center'
	],
	
	// Muebles
	furniture: [
		'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop&crop=center'
	],
	
	// Iluminación
	lighting: [
		'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center'
	],
	
	// Decoración
	decor: [
		'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
		'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=400&fit=crop&crop=center'
	]
};

// Función para obtener una imagen aleatoria de una categoría
export function getRandomImage(category: string): string {
	const categoryKey = category.toLowerCase() as keyof typeof furnitureImages;
	const images = furnitureImages[categoryKey] || furnitureImages.furniture;
	return images[Math.floor(Math.random() * images.length)];
}

// Función para obtener múltiples imágenes de una categoría
export function getCategoryImages(category: string, count: number): string[] {
	const categoryKey = category.toLowerCase() as keyof typeof furnitureImages;
	const images = furnitureImages[categoryKey] || furnitureImages.furniture;
	const shuffled = [...images].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
} 