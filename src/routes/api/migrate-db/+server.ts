import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export async function POST() {
    try {
        console.log('🚀 Iniciando migración a estructura completa...');
        
        // Verificar conexión
        const connectionTest = await db.testConnection();
        if (!connectionTest.success || connectionTest.mode !== 'postgres') {
            return json({
                success: false,
                error: 'No hay conexión a PostgreSQL',
                mode: connectionTest.mode
            }, { status: 500 });
        }

        // Ejecutar migración
        const result = await db.migrateToFullSchema();
        
        if (!result.success) {
            return json({
                success: false,
                error: result.error || 'Error en la migración',
                mode: result.mode
            }, { status: 500 });
        }

        return json({
            success: true,
            message: result.message,
            mode: result.mode,
            tablesCreated: result.tablesCreated || [],
            dataMigrated: result.dataMigrated || false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error en migrate-db:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
            mode: 'error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 