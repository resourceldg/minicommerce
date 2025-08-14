# 🚀 Despliegue en Vercel - Paso a Paso

## 📋 Prerrequisitos
- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [GitHub](https://github.com)
- ✅ Proyecto subido a GitHub

## 🔧 Paso 1: Configurar PostgreSQL en Vercel

### 1.1 Ir al Dashboard de Vercel
- Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
- Inicia sesión o crea una cuenta

### 1.2 Crear/Seleccionar Proyecto
- **Nuevo proyecto**: Click en "New Project"
- **Proyecto existente**: Selecciona tu proyecto

### 1.3 Conectar Base de Datos
- En tu proyecto, ve a **Storage**
- Click en **"Connect Store"**
- Selecciona **Postgres**
- Click en **"Continue"**

### 1.4 Configurar PostgreSQL
- **Plan**: Selecciona "Hobby" (gratis)
- **Region**: Elige la más cercana a tus clientes
- **Database Name**: `muebles_restaurados` (o el que prefieras)
- Click en **"Create"**

### 1.5 Copiar Variables de Entorno
Vercel te dará algo como:
```bash
POSTGRES_URL="postgresql://..."
POSTGRES_HOST="..."
POSTGRES_DATABASE="..."
POSTGRES_USERNAME="..."
POSTGRES_PASSWORD="..."
```

## 🔑 Paso 2: Configurar Variables de Entorno

### 2.1 En tu proyecto de Vercel
- Ve a **Settings** → **Environment Variables**
- Agrega cada variable una por una:

| Variable | Valor |
|----------|-------|
| `POSTGRES_URL` | `postgresql://...` (desde Vercel) |
| `POSTGRES_HOST` | `...` (desde Vercel) |
| `POSTGRES_DATABASE` | `...` (desde Vercel) |
| `POSTGRES_USERNAME` | `...` (desde Vercel) |
| `POSTGRES_PASSWORD` | `...` (desde Vercel) |

### 2.2 Seleccionar Entornos
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

## 🗄️ Paso 3: Inicializar Base de Datos

### 3.1 Conectar a PostgreSQL
- En Vercel, ve a **Storage** → **Postgres**
- Click en **"Connect"**
- Usa cualquier cliente SQL (pgAdmin, DBeaver, etc.)

### 3.2 Ejecutar Script
- Copia el contenido de `database/init.sql`
- Ejecuta el script en tu base de datos

## 🚀 Paso 4: Desplegar

### 4.1 Push a GitHub
```bash
git add .
git commit -m "Tienda de muebles lista para producción"
git push origin main
```

### 4.2 Vercel se despliega automáticamente
- Vercel detecta el push
- Construye automáticamente
- Despliega en tu dominio

### 4.3 Verificar despliegue
- Ve a tu dominio: `https://tu-proyecto.vercel.app`
- Prueba agregar productos al carrito
- Prueba el checkout por WhatsApp

## 📱 Paso 5: Configurar WhatsApp

### 5.1 ✅ Número de WhatsApp configurado
El número `+542236202061` ya está configurado en todos los componentes necesarios.

### 5.2 Redeploy
```bash
git add .
git commit -m "Actualizar número de WhatsApp"
git push origin main
```

## ✅ Verificación Final

### ✅ Base de datos
- [ ] PostgreSQL conectado
- [ ] Tabla `furniture` creada
- [ ] Productos insertados

### ✅ Frontend
- [ ] Página carga correctamente
- [ ] Productos se muestran
- [ ] Carrito funciona

### ✅ Checkout
- [ ] WhatsApp se abre
- [ ] Mensaje se genera correctamente
- [ ] Número es el correcto

## 🆘 Solución de Problemas

### ❌ Error: "Cannot connect to database"
- Verifica variables de entorno en Vercel
- Asegúrate de que PostgreSQL esté activo

### ❌ Error: "Table doesn't exist"
- Ejecuta `database/init.sql`
- Verifica que la tabla se haya creado

### ❌ WhatsApp no abre
- Revisa el número en `Cart.svelte`
- Asegúrate de que incluya código de país (+34, +1, etc.)

### ❌ Imágenes no cargan
- Crea directorio `static/images/`
- Agrega imágenes con nombres correctos

## 🎯 ¡Listo!

Tu tienda estará funcionando en:
**`https://tu-proyecto.vercel.app`**

Los clientes pueden:
1. Ver tus muebles
2. Agregar al carrito
3. Comprar por WhatsApp
4. ¡Tú recibes el pedido directamente!

---

**¡Felicitaciones! 🎉 Tu tienda minimalista está online y lista para vender.** 