import { json } from '@sveltejs/kit';
import { sql } from '@vercel/postgres';

export async function POST() {
	try {
		console.log('🚀 Iniciando inicialización de la base de datos...');

		// Crear tabla furniture si no existe
		await sql`
			CREATE TABLE IF NOT EXISTS furniture (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				description TEXT,
				price DECIMAL(10,2) NOT NULL,
				image VARCHAR(500),
				category VARCHAR(100),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`;
		console.log('✅ Tabla furniture creada/verificada');

		// Crear índices
		await sql`CREATE INDEX IF NOT EXISTS idx_furniture_category ON furniture(category)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_furniture_price ON furniture(price)`;
		console.log('✅ Índices creados/verificados');

		// Verificar si ya hay datos
		const { rows: existingData } = await sql`SELECT COUNT(*) as count FROM furniture`;
		const count = parseInt(existingData[0].count);
		
		if (count === 0) {
			console.log('📝 Insertando datos de ejemplo...');
			
			// Insertar datos de ejemplo
			await sql`
				INSERT INTO furniture (name, description, price, image, category) VALUES
				('Silla Vintage de Madera', 'Silla de madera restaurada con estilo vintage, perfecta para comedor o escritorio', 150.00, 'https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg', 'sillas'),
				('Mesa de Centro Rústica', 'Mesa de centro restaurada con patas torneadas y acabado en barniz natural', 300.00, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/house-1835923_1280.jpg', 'mesas'),
				('Cómoda Clásica de Roble', 'Cómoda de madera maciza restaurada con cajones funcionales y tiradores de latón', 450.00, 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg', 'muebles'),
				('Silla de Escritorio Ergonómica', 'Silla de oficina restaurada con respaldo alto y asiento acolchado', 200.00, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg', 'sillas'),
				('Mesa de Comedor Extensible', 'Mesa de comedor de 6-8 personas con sistema extensible oculto', 600.00, 'https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg', 'mesas'),
				('Armario de Pared Antiguo', 'Armario empotrado restaurado con puertas correderas y estantes ajustables', 800.00, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/house-1835923_1280.jpg', 'muebles'),
				('Silla de Jardín Adirondack', 'Silla de jardín clásica restaurada, perfecta para terrazas y patios', 180.00, 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg', 'sillas'),
				('Mesa de Noche Artesanal', 'Mesa de noche con cajón secreto y patas talladas a mano', 250.00, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg', 'muebles'),
				('Silla de Lectura Chesterfield', 'Silla de lectura restaurada con tapizado en cuero genuino y botones decorativos', 350.00, 'https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg', 'sillas'),
				('Lámpara de Mesa Vintage', 'Lámpara de mesa restaurada con pantalla de tela y base de latón', 120.00, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg', 'iluminacion'),
				('Espejo Decorativo Antiguo', 'Espejo de pared restaurado con marco tallado y acabado dorado', 280.00, 'https://cdn.pixabay.com/photo/2017/03/28/12/11/chairs-2181947_1280.jpg', 'decoracion'),
				('Estantería de Libros Rústica', 'Estantería de madera maciza con diseño rústico y acabado natural', 320.00, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/house-1835923_1280.jpg', 'muebles')
			`;
			
			console.log('✅ Datos de ejemplo insertados en la base de datos');
		} else {
			console.log(`✅ Base de datos ya contiene ${count} elementos`);
		}

		// Crear tabla de checkouts si no existe
		await sql`
			CREATE TABLE IF NOT EXISTS checkouts (
				id SERIAL PRIMARY KEY,
				items JSONB NOT NULL,
				total_amount DECIMAL(10,2) NOT NULL,
				status VARCHAR(50) DEFAULT 'pending',
				whatsapp_sent BOOLEAN DEFAULT FALSE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`;
		console.log('✅ Tabla checkouts creada/verificada');

		// Obtener datos finales para confirmar
		const { rows: finalData } = await sql`SELECT COUNT(*) as count FROM furniture`;
		const finalCount = parseInt(finalData[0].count);

		return json({
			success: true,
			message: 'Base de datos inicializada correctamente',
			furnitureCount: finalCount,
			tables: ['furniture', 'checkouts'],
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Error inicializando la base de datos:', error);
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Error desconocido',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
} 