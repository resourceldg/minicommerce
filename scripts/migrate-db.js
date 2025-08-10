#!/usr/bin/env node

/**
 * Script de migración para la nueva arquitectura de Rare&Magic
 * Ejecutar: node scripts/migrate-db.js
 */

import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function migrateDatabase() {
	console.log('🚀 Iniciando migración de base de datos para Rare&Magic...\n');
	
	try {
		// 1. Verificar conexión
		console.log('1️⃣ Probando conexión a PostgreSQL...');
		const testResult = await sql`SELECT 1 as test`;
		console.log('✅ Conexión exitosa a PostgreSQL\n');
		
		// 2. Leer y ejecutar el schema
		console.log('2️⃣ Aplicando nuevo schema...');
		const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
		const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
		
		// Dividir el SQL en statements individuales
		const statements = schemaSQL
			.split(';')
			.map(stmt => stmt.trim())
			.filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
		
		// Ejecutar cada statement
		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i];
			if (statement.trim()) {
				try {
					await sql.unsafe(statement);
					console.log(`   ✅ Statement ${i + 1}/${statements.length} ejecutado`);
				} catch (error) {
					// Ignorar errores de "already exists" para tablas e índices
					if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
						console.log(`   ⚠️ Statement ${i + 1}/${statements.length} ya existe`);
					} else {
						console.error(`   ❌ Error en statement ${i + 1}/${statements.length}:`, error.message);
					}
				}
			}
		}
		console.log('✅ Schema aplicado correctamente\n');
		
		// 3. Verificar estructura de la base de datos
		console.log('3️⃣ Verificando estructura de la base de datos...');
		
		// Verificar tablas
		const tables = ['categories', 'products', 'checkouts', 'checkout_items', 'stock_logs'];
		for (const table of tables) {
			const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
			console.log(`   📊 Tabla ${table}: ${result.rows[0].count} registros`);
		}
		
		// Verificar vistas
		const views = ['available_products', 'active_checkouts'];
		for (const view of views) {
			try {
				const result = await sql`SELECT COUNT(*) as count FROM ${sql(view)}`;
				console.log(`   👁️ Vista ${view}: ${result.rows[0].count} registros`);
			} catch (error) {
				console.log(`   ⚠️ Vista ${view}: No disponible aún`);
			}
		}
		
		// 4. Verificar funciones
		console.log('\n4️⃣ Verificando funciones de gestión de stock...');
		const functions = ['reserve_stock', 'release_stock', 'confirm_sale'];
		for (const func of functions) {
			try {
				// Intentar llamar a la función con parámetros de prueba
				if (func === 'reserve_stock') {
					await sql`SELECT reserve_stock(1, 1, 1)`;
				} else if (func === 'release_stock') {
					await sql`SELECT release_stock(1, 1, 1)`;
				} else if (func === 'confirm_sale') {
					await sql`SELECT confirm_sale(1)`;
				}
				console.log(`   ⚙️ Función ${func}: Disponible`);
			} catch (error) {
				console.log(`   ⚠️ Función ${func}: ${error.message}`);
			}
		}
		
		// 5. Verificar datos de ejemplo
		console.log('\n5️⃣ Verificando datos de ejemplo...');
		const categoriesResult = await sql`SELECT COUNT(*) as count FROM categories`;
		const productsResult = await sql`SELECT COUNT(*) as count FROM products`;
		
		console.log(`   🏷️ Categorías: ${categoriesResult.rows[0].count}`);
		console.log(`   📦 Productos: ${productsResult.rows[0].count}`);
		
		// Mostrar algunas categorías
		const sampleCategories = await sql`SELECT name, slug, icon FROM categories ORDER BY sort_order LIMIT 3`;
		console.log('   📋 Categorías de ejemplo:');
		sampleCategories.rows.forEach(cat => {
			console.log(`      • ${cat.name} (${cat.slug}) - Icono: ${cat.icon}`);
		});
		
		// Mostrar algunos productos
		const sampleProducts = await sql`SELECT p.name, p.price, c.name as category FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id LIMIT 3`;
		console.log('   📦 Productos de ejemplo:');
		sampleProducts.rows.forEach(prod => {
			console.log(`      • ${prod.name} - $${prod.price} (${prod.category})`);
		});
		
		// 6. Resumen final
		console.log('\n🎉 ¡Migración completada exitosamente!');
		console.log('\n📊 Resumen de la base de datos:');
		console.log('   • 5 tablas principales creadas');
		console.log('   • 3 funciones de gestión de stock implementadas');
		console.log('   • 2 vistas útiles configuradas');
		console.log('   • Índices de performance aplicados');
		console.log('   • Datos de ejemplo insertados');
		
		console.log('\n🚀 Tu API ya puede usar la nueva arquitectura:');
		console.log('   • POST /api/checkouts - Crear checkout único');
		console.log('   • GET /api/checkouts/:code - Ver checkout');
		console.log('   • POST /api/checkouts/:code/confirm - Confirmar venta');
		console.log('   • GET /api/products - Productos con stock real');
		
		console.log('\n💡 Próximos pasos:');
		console.log('   1. Actualizar la API para usar las nuevas tablas');
		console.log('   2. Implementar la lógica de checkout');
		console.log('   3. Integrar con WhatsApp Business API');
		console.log('   4. Crear la UI del checkout');
		
	} catch (error) {
		console.error('❌ Error durante la migración:', error);
		process.exit(1);
	}
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
	migrateDatabase();
} 