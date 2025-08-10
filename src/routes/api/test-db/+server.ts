import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export async function GET() {
	try {
		console.log('🧪 Probando conexión a la base de datos...');
		
		// Probar conexión usando el nuevo sistema híbrido
		const connectionTest = await db.testConnection();
		
		if (!connectionTest.success) {
			return json({ 
				success: false, 
				error: 'No se pudo conectar a la base de datos',
				mode: connectionTest.mode
			}, { status: 500 });
		}

		// Inicializar base de datos
		const initResult = await db.initDatabase();
		
		if (!initResult.success) {
			return json({ 
				success: false, 
				error: 'Error inicializando la base de datos',
				mode: initResult.mode
			}, { status: 500 });
		}

		// Obtener datos para confirmar
		let sampleData = [];
		if (connectionTest.mode === 'postgres') {
			// Si estamos en PostgreSQL, obtener datos reales
			sampleData = await db.getFurniture();
		} else {
			// Si estamos en modo local, usar los datos de fallback
			sampleData = connectionTest.data || [];
		}
		
		return json({
			success: true,
			message: initResult.message || 'Base de datos funcionando correctamente',
			connection: 'OK',
			initialization: 'OK',
			mode: initResult.mode || connectionTest.mode,
			sampleData: sampleData.slice(0, 5), // Solo mostrar 5 elementos
			totalCount: sampleData.length,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Error en test-db:', error);
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Error desconocido',
			mode: 'error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
} 