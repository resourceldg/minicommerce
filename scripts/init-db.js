#!/usr/bin/env node

/**
 * Script para inicializar la base de datos PostgreSQL
 * Ejecutar: node scripts/init-db.js
 */

import { sql } from '@vercel/postgres';

async function initDatabase() {
	console.log('🚀 Inicializando base de datos PostgreSQL...\n');
	
	try {
		// Verificar conexión
		console.log('1️⃣ Probando conexión...');
		const testResult = await sql`SELECT 1 as test`;
		console.log('✅ Conexión exitosa a PostgreSQL\n');
		
		// Crear tabla furniture
		console.log('2️⃣ Creando tabla furniture...');
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
		console.log('✅ Tabla furniture creada/verificada\n');
		
		// Crear índices
		console.log('3️⃣ Creando índices...');
		await sql`CREATE INDEX IF NOT EXISTS idx_furniture_category ON furniture(category)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_furniture_price ON furniture(price)`;
		console.log('✅ Índices creados/verificados\n');
		
		// Verificar si ya hay datos
		console.log('4️⃣ Verificando datos existentes...');
		const { rows } = await sql`SELECT COUNT(*) as count FROM furniture`;
		const count = parseInt(rows[0].count);
		
		if (count === 0) {
			console.log('5️⃣ Insertando datos de ejemplo...');
			await sql`
				INSERT INTO furniture (name, description, price, image, category) VALUES
				('Silla Vintage Restaurada', 'Silla de madera restaurada con estilo vintage, perfecta para comedor o escritorio', 150.00, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 'sillas'),
				('Mesa de Centro Antigua', 'Mesa de centro restaurada con patas torneadas y acabado en barniz natural', 300.00, 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=400', 'mesas'),
				('Cómoda Clásica', 'Cómoda de madera maciza restaurada con cajones funcionales', 450.00, 'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=400', 'muebles'),
				('Sofá Chesterfield', 'Sofá clásico restaurado con tapizado premium y estructura sólida', 800.00, 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=400', 'asientos'),
				('Estantería Industrial', 'Estantería de metal y madera con estilo industrial vintage', 250.00, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 'estanterías'),
				('Silla de Jardín Adirondack', 'Silla de jardín clásica restaurada, perfecta para terrazas y patios', 180.00, 'https://images.pexels.com/photos/1571465/pexels-photo-1571465.jpeg?auto=compress&cs=tinysrgb&w=400', 'sillas'),
				('Mesa de Noche Artesanal', 'Mesa de noche con cajón secreto y patas talladas a mano', 250.00, 'https://images.pexels.com/photos/1571466/pexels-photo-1571466.jpeg?auto=compress&cs=tinysrgb&w=400', 'muebles'),
				('Lámpara de Mesa Vintage', 'Lámpara de mesa restaurada con pantalla de tela y base de latón', 120.00, 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=400', 'iluminacion'),
				('Espejo Decorativo Antiguo', 'Espejo de pared restaurado con marco tallado y acabado dorado', 220.00, 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400', 'decoracion'),
				('Silla de Escritorio Vintage', 'Silla de escritorio restaurada con respaldo alto y asiento acolchado', 120.00, 'https://images.pexels.com/photos/1571469/pexels-photo-1571469.jpeg?auto=compress&cs=tinysrgb&w=400', 'sillas')
			`;
			console.log('✅ 10 productos de ejemplo insertados\n');
		} else {
			console.log(`✅ Base de datos ya contiene ${count} productos\n`);
		}
		
		// Mostrar resumen
		const finalCount = await sql`SELECT COUNT(*) as count FROM furniture`;
		console.log('🎉 ¡Base de datos inicializada exitosamente!');
		console.log(`📊 Total de productos: ${finalCount.rows[0].count}`);
		console.log('🌐 Tu API ya puede usar la base de datos PostgreSQL');
		
	} catch (error) {
		console.error('❌ Error inicializando la base de datos:', error);
		process.exit(1);
	}
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
	initDatabase();
} 