# 🚀 Configuración Rápida - Tienda de Muebles

## ⚡ Pasos para tener tu tienda funcionando en 10 minutos

### 1. 📱 Cambiar tu número de WhatsApp
Edita `src/lib/components/Cart.svelte` línea ~40:
```typescript
const whatsappUrl = `https://wa.me/+TU_NUMERO_REAL?text=${encodeURIComponent(message)}`;
```

### 2. 🗄️ Configurar PostgreSQL en Vercel
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Crea nuevo proyecto o usa uno existente
3. **Storage** → **Connect Store** → **Postgres**
4. Sigue los pasos y copia las variables

### 3. 🔑 Variables de Entorno
En tu proyecto de Vercel, agrega:
```
POSTGRES_URL=postgresql://...
POSTGRES_HOST=...
POSTGRES_DATABASE=...
POSTGRES_USERNAME=...
POSTGRES_PASSWORD=...
```

### 4. 🚀 Desplegar
```bash
git add .
git commit -m "Mi tienda de muebles"
git push origin main
```

### 5. 🎯 ¡Listo!
Tu tienda estará en: `https://tu-proyecto.vercel.app`

---

## 🎨 Personalización Rápida

### Cambiar colores
Edita los archivos `.svelte` en `src/lib/components/`

### Agregar productos
Edita `database/init.sql` o usa la API

### Cambiar logo/título
Edita `src/routes/+page.svelte`

---

## 📱 Testear en móvil
1. Abre tu tienda en el móvil
2. Agrega productos al carrito
3. Click en "Comprar por WhatsApp"
4. ¡Debería abrir WhatsApp con el pedido!

---

## 🆘 Problemas comunes

**❌ Error de base de datos**: Verifica las variables de entorno en Vercel
**❌ WhatsApp no abre**: Revisa el número en `Cart.svelte`
**❌ Imágenes no cargan**: Crea `static/images/` con tus fotos

---

**¡Tu tienda minimalista está lista para vender! 🎉** 