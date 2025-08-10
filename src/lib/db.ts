import { sql } from '@vercel/postgres';
import { DB_CONFIG } from './config';

// Datos de ejemplo para desarrollo local
const FALLBACK_DATA = [
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

// Configuración de la base de datos
export const db = {
	// Función para ejecutar queries SQL
	query: sql,
	
	// Función para verificar la conexión
	async testConnection() {
		try {
			// Si no tenemos configuración de BD, usar datos locales
			if (!DB_CONFIG.hasDatabaseConfig()) {
				console.log('⚠️ No hay configuración de base de datos, usando datos locales');
				return { success: true, mode: 'local', data: FALLBACK_DATA };
			}

			// Intentar conectar a PostgreSQL
			const result = await sql`SELECT 1 as test`;
			console.log('✅ Conexión a PostgreSQL exitosa');
			return { success: true, mode: 'postgres' };
		} catch (error) {
			console.error('❌ Error de conexión a PostgreSQL:', error);
			
			// En desarrollo, usar datos locales como fallback
			if (DB_CONFIG.isDevelopment()) {
				console.log('🔄 Usando datos locales como fallback en desarrollo');
				return { success: true, mode: 'local', data: FALLBACK_DATA };
			}
			
			return { success: false, error, mode: 'error' };
		}
	},
	
	// Función para obtener datos de furniture
	async getFurniture() {
		try {
			// Si no hay configuración de BD, usar datos locales
			if (!DB_CONFIG.hasDatabaseConfig()) {
				console.log('📦 Usando datos locales de furniture');
				return FALLBACK_DATA;
			}

			// Intentar obtener desde PostgreSQL
			const { rows } = await sql`
				SELECT id, name, description, price, image, category
				FROM furniture
				ORDER BY id ASC
			`;

			console.log('✅ Datos obtenidos de PostgreSQL:', rows.length, 'elementos');
			return rows;
		} catch (error) {
			console.error('❌ Error obteniendo datos de PostgreSQL:', error);
			
			// En desarrollo, usar datos locales como fallback
			if (DB_CONFIG.isDevelopment()) {
				console.log('🔄 Usando datos locales como fallback en desarrollo');
				return FALLBACK_DATA;
			}
			
			throw error;
		}
	},
	
	// Función para inicializar la base de datos
	async initDatabase() {
		try {
			// Si no hay configuración de BD, no hacer nada
			if (!DB_CONFIG.hasDatabaseConfig()) {
				console.log('⚠️ No hay configuración de base de datos, saltando inicialización');
				return { success: true, mode: 'local' };
			}

			console.log('🚀 Iniciando inicialización de PostgreSQL...');

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
				console.log('📝 Insertando datos de ejemplo en PostgreSQL...');
				
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
				
				console.log('✅ Datos de ejemplo insertados en PostgreSQL');
			} else {
				console.log(`✅ PostgreSQL ya contiene ${count} elementos`);
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

			return {
				success: true,
				mode: 'postgres',
				message: 'Base de datos PostgreSQL inicializada correctamente',
				furnitureCount: finalCount,
				tables: ['furniture', 'checkouts']
			};

		} catch (error) {
			console.error('❌ Error inicializando PostgreSQL:', error);
			
			// En desarrollo, usar datos locales como fallback
			if (DB_CONFIG.isDevelopment()) {
				console.log('🔄 Usando datos locales como fallback en desarrollo');
				return { 
					success: true, 
					mode: 'local',
					message: 'Usando datos locales en desarrollo',
					furnitureCount: FALLBACK_DATA.length
				};
			}
			
			return { 
				success: false, 
				error: error instanceof Error ? error.message : 'Error desconocido',
				mode: 'error'
			};
		}
	}
}; 