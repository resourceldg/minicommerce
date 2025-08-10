# Configuración de Base de Datos PostgreSQL en Vercel

## Opción 1: Vercel Postgres (Recomendado)

### 1. Crear Base de Datos en Vercel
1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a la pestaña "Storage"
4. Haz clic en "Create Database"
5. Selecciona "Postgres"
6. Elige tu plan (Hobby es gratuito)
7. Selecciona la región más cercana a tus usuarios

### 2. Configurar Variables de Entorno
Vercel automáticamente configurará estas variables:
- `POSTGRES_URL`
- `POSTGRES_HOST`
- `POSTGRES_DATABASE`
- `POSTGRES_USERNAME`
- `POSTGRES_PASSWORD`

### 3. Conectar a tu Proyecto
1. En la pestaña "Storage", haz clic en "Connect"
2. Selecciona tu proyecto
3. Las variables se configurarán automáticamente

## Opción 2: Neon (PostgreSQL Serverless)

### 1. Crear Cuenta en Neon
1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 2. Obtener Credenciales
1. Copia la connection string
2. Extrae las credenciales individuales

### 3. Configurar en Vercel
Agrega estas variables en tu dashboard de Vercel:
```
POSTGRES_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname
POSTGRES_HOST=ep-xxx.region.aws.neon.tech
POSTGRES_DATABASE=dbname
POSTGRES_USERNAME=user
POSTGRES_PASSWORD=password
```

## Opción 3: Supabase

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > Database

### 2. Obtener Connection String
1. Copia la connection string
2. Extrae las credenciales

### 3. Configurar en Vercel
Agrega las variables de entorno en tu dashboard de Vercel.

## Inicializar la Base de Datos

### Opción A: Endpoint Automático
Una vez desplegado, visita:
```
https://tu-proyecto.vercel.app/api/init-db
```

### Opción B: Script Manual
Puedes ejecutar el script de inicialización manualmente:
```bash
curl -X POST https://tu-proyecto.vercel.app/api/init-db
```

## Verificar Conexión

Para verificar que todo funciona:
```
https://tu-proyecto.vercel.app/api/test-db
```

## Estructura de la Base de Datos

### Tabla `furniture`
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(255)
- `description`: TEXT
- `price`: DECIMAL(10,2)
- `image`: VARCHAR(500)
- `category`: VARCHAR(100)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Tabla `checkouts`
- `id`: SERIAL PRIMARY KEY
- `items`: JSONB (productos del carrito)
- `total_amount`: DECIMAL(10,2)
- `status`: VARCHAR(50)
- `whatsapp_sent`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Troubleshooting

### Error: "relation does not exist"
- Ejecuta el endpoint de inicialización: `/api/init-db`

### Error: "connection refused"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que la base de datos esté activa

### Error: "authentication failed"
- Verifica username y password
- Asegúrate de que el usuario tenga permisos en la base de datos

## Notas Importantes

- **Vercel Postgres**: Se integra automáticamente con tu proyecto
- **Neon/Supabase**: Requieren configuración manual de variables
- **Desarrollo Local**: Usa `.env.local` para pruebas locales
- **Producción**: Las variables se configuran en el dashboard de Vercel 