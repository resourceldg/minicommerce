# 🗄️ Configuración de Base de Datos PostgreSQL

## 📋 Requisitos Previos

- ✅ Proyecto desplegado en Vercel
- ✅ Base de datos PostgreSQL creada en Neon
- ✅ Variables de entorno configuradas

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con estas variables:

```bash
# Configuración de la base de datos PostgreSQL en Neon
DATABASE_URL=postgres://default:sMaVKr6xzG9I@ep-spring-base-06745244-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require
POSTGRES_URL=postgres://default:sMaVKr6xzG9I@ep-spring-base-06745244-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require
POSTGRES_HOST=ep-spring-base-06745244-pooler.us-west-2.aws.neon.tech
POSTGRES_USER=default
POSTGRES_PASSWORD=sMaVKr6xzG9I
POSTGRES_DATABASE=verceldb

# Configuración de la tienda
PUBLIC_STORE_NAME="Rare&Magic"
PUBLIC_STORE_DESCRIPTION="Muebles únicos, legado consciente"
PUBLIC_WHATSAPP_NUMBER="+1234567890"
PUBLIC_API_BASE_URL="/api"

# Configuración de desarrollo
NODE_ENV="development"
```

## 🚀 Inicialización de la Base de Datos

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar el script de inicialización
node scripts/init-db.js
```

### Opción 2: Endpoint de la API

```bash
# Hacer POST al endpoint de inicialización
curl -X POST http://localhost:5173/api/init-db
```

### Opción 3: Manual (SQL)

```sql
-- Crear tabla furniture
CREATE TABLE IF NOT EXISTS furniture (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_furniture_category ON furniture(category);
CREATE INDEX IF NOT EXISTS idx_furniture_price ON furniture(price);

-- Insertar datos de ejemplo
INSERT INTO furniture (name, description, price, image, category) VALUES
    ('Silla Vintage Restaurada', 'Silla de madera restaurada con estilo vintage, perfecta para comedor o escritorio', 150.00, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 'sillas'),
    ('Mesa de Centro Antigua', 'Mesa de centro restaurada con patas torneadas y acabado en barniz natural', 300.00, 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=400', 'mesas'),
    ('Cómoda Clásica', 'Cómoda de madera maciza restaurada con cajones funcionales', 450.00, 'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=400', 'muebles');
```

## 🔍 Verificación

### 1. Verificar Conexión
```bash
# El script mostrará: ✅ Conexión exitosa a PostgreSQL
```

### 2. Verificar Tabla
```bash
# El script mostrará: ✅ Tabla furniture creada/verificada
```

### 3. Verificar Datos
```bash
# El script mostrará: ✅ 10 productos de ejemplo insertados
```

## 📊 Estructura de la Base de Datos

### Tabla: `furniture`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | Identificador único (auto-incrementable) |
| `name` | VARCHAR(255) | Nombre del producto |
| `description` | TEXT | Descripción detallada |
| `price` | DECIMAL(10,2) | Precio con 2 decimales |
| `image` | VARCHAR(500) | URL de la imagen |
| `category` | VARCHAR(100) | Categoría del producto |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Índices
- `idx_furniture_category`: Para búsquedas por categoría
- `idx_furniture_price`: Para filtros por precio

## 🚨 Solución de Problemas

### Error: "No se pudo conectar a la base de datos"
- ✅ Verificar variables de entorno
- ✅ Verificar que la base de datos esté activa en Neon
- ✅ Verificar que las credenciales sean correctas

### Error: "relation 'furniture' does not exist"
- ✅ Ejecutar el script de inicialización
- ✅ Verificar que el usuario tenga permisos de CREATE TABLE

### Error: "permission denied"
- ✅ Verificar que el usuario tenga permisos de INSERT, SELECT, UPDATE, DELETE

## 🌐 Despliegue en Vercel

1. **Configurar Variables de Entorno en Vercel:**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega todas las variables de `.env`

2. **Redeploy:**
   - Vercel detectará automáticamente los cambios
   - O haz push a la rama principal

3. **Verificar:**
   - La API debería funcionar con PostgreSQL
   - Los logs mostrarán conexiones exitosas

## 📝 Notas Importantes

- 🔒 **Seguridad**: Nunca commits las variables de entorno
- 🚀 **Performance**: Los índices mejoran las consultas
- 🔄 **Backup**: Neon hace backups automáticos
- 💰 **Costo**: Plan gratuito incluye 3GB de almacenamiento

## 🎯 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Ejecutar script de inicialización
3. ✅ Verificar funcionamiento de la API
4. 🚀 Implementar funcionalidades adicionales (carrito, usuarios, etc.) 