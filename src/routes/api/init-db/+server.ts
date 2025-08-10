import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db';

export const POST: RequestHandler = async () => {
	try {
		// Verificar conexión
		const isConnected = await db.testConnection();
		if (!isConnected) {
			return json({ 
				success: false, 
				error: 'No se pudo conectar a la base de datos' 
			}, { status: 500 });
		}

		// Inicializar base de datos
		const success = await db.initDatabase();
		
		if (success) {
			return json({ 
				success: true, 
				message: 'Base de datos inicializada correctamente' 
			});
		} else {
			return json({ 
				success: false, 
				error: 'Error al inicializar la base de datos' 
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error en endpoint init-db:', error);
		return json({ 
			success: false, 
			error: 'Error interno del servidor' 
		}, { status: 500 });
	}
}; 