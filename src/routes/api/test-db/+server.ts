import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export async function GET() {
	try {
		// Probar conexión
		const connectionTest = await db.testConnection();
		
		if (!connectionTest) {
			return json({ 
				success: false, 
				error: 'No se pudo conectar a la base de datos' 
			}, { status: 500 });
		}

		// Inicializar base de datos
		const initResult = await db.initDatabase();
		
		if (!initResult) {
			return json({ 
				success: false, 
				error: 'Error inicializando la base de datos' 
			}, { status: 500 });
		}

		// Obtener algunos muebles de ejemplo
		const { rows } = await db.query`SELECT * FROM furniture LIMIT 5`;
		
		return json({
			success: true,
			message: 'Base de datos conectada y inicializada correctamente',
			connection: 'OK',
			initialization: 'OK',
			sampleData: rows
		});

	} catch (error) {
		console.error('Error en test-db:', error);
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Error desconocido' 
		}, { status: 500 });
	}
} 