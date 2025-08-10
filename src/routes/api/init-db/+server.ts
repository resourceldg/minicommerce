import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export async function POST() {
	try {
		console.log('🚀 Iniciando inicialización de la base de datos...');
		
		// Usar el nuevo sistema híbrido
		const result = await db.initDatabase();
		
		if (!result.success) {
			return json({ 
				success: false, 
				error: result.error || 'Error desconocido',
				mode: result.mode
			}, { status: 500 });
		}

		return json({
			success: true,
			message: result.message,
			mode: result.mode,
			furnitureCount: result.furnitureCount || 0,
			tables: result.tables || [],
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Error en init-db:', error);
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Error desconocido',
			mode: 'error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
} 