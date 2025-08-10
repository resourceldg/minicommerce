import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { sql } from '@vercel/postgres';

export const GET: RequestHandler = async () => {
	try {
		// Intentar obtener datos desde PostgreSQL
		const { rows } = await sql`
			SELECT id, name, description, price, image, category
			FROM furniture
			ORDER BY id ASC
		`;

		console.log('✅ Datos obtenidos de PostgreSQL:', rows.length, 'elementos');
		return json(rows);
	} catch (error) {
		console.error('❌ Error de base de datos:', error);
		
		// Fallback data en caso de error
		const fallbackData = [
			{
				id: 1,
				name: 'Silla Vintage Restaurada',
				description: 'Silla de madera restaurada con estilo vintage, perfecta para comedor o escritorio',
				price: 150,
				image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'sillas'
			},
			{
				id: 2,
				name: 'Mesa de Centro Antigua',
				description: 'Mesa de centro restaurada con patas torneadas y acabado en barniz natural',
				price: 300,
				image: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'mesas'
			},
			{
				id: 3,
				name: 'Cómoda Clásica',
				description: 'Cómoda de madera maciza restaurada con cajones funcionales',
				price: 450,
				image: 'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'muebles'
			},
			{
				id: 4,
				name: 'Sofá Chesterfield',
				description: 'Sofá clásico restaurado con tapizado premium y estructura sólida',
				price: 800,
				image: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'asientos'
			},
			{
				id: 5,
				name: 'Estantería Industrial',
				description: 'Estantería de metal y madera con estilo industrial vintage',
				price: 250,
				image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'estanterías'
			},
			{
				id: 6,
				name: 'Silla de Jardín Adirondack',
				description: 'Silla de jardín clásica restaurada, perfecta para terrazas y patios',
				price: 180,
				image: 'https://images.pexels.com/photos/1571465/pexels-photo-1571465.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'sillas'
			},
			{
				id: 7,
				name: 'Mesa de Noche Artesanal',
				description: 'Mesa de noche con cajón secreto y patas talladas a mano',
				price: 250,
				image: 'https://images.pexels.com/photos/1571466/pexels-photo-1571466.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'muebles'
			},
			{
				id: 8,
				name: 'Lámpara de Mesa Vintage',
				description: 'Lámpara de mesa restaurada con pantalla de tela y base de latón',
				price: 120,
				image: 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'iluminacion'
			},
			{
				id: 9,
				name: 'Espejo Decorativo Antiguo',
				description: 'Espejo de pared restaurado con marco tallado y acabado dorado',
				price: 280,
				image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'decoracion'
			},
			{
				id: 10,
				name: 'Estantería de Libros Rústica',
				description: 'Estantería de madera maciza con diseño rústico y acabado natural',
				price: 320,
				image: 'https://images.pexels.com/photos/1571469/pexels-photo-1571469.jpeg?auto=compress&cs=tinysrgb&w=400',
				category: 'muebles'
			}
		];

		console.log('⚠️ Usando datos de fallback debido al error de DB');
		return json(fallbackData);
	}
}; 