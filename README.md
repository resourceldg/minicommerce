# 🪑 Muebles Restaurados - Instagram Shopping Style

Una tienda de muebles restaurados con diseño inspirado en Instagram Shopping, construida con SvelteKit.

## ✨ Características

- 🎨 **Diseño elegante** inspirado en Instagram Shopping
- 🔍 **Búsqueda y filtrado** por categorías
- 🛒 **Carrito de compras** funcional
- ❤️ **Sistema de favoritos**
- 📱 **Diseño responsive** para móvil y desktop
- 🖼️ **Grid de productos** con precios superpuestos
- 🏷️ **Categorías con scroll horizontal**

## 🚀 Deployment en Vercel

### 1. Preparar el repositorio

```bash
# Clonar el repositorio
git clone <tu-repo-url>
cd minicommerce

# Instalar dependencias
npm install

# Verificar que funciona localmente
npm run dev
```

### 2. Conectar con Vercel

1. **Crear cuenta en [Vercel](https://vercel.com)**
2. **Importar el repositorio** desde GitHub/GitLab
3. **Vercel detectará automáticamente** que es un proyecto SvelteKit
4. **Configuración automática** con el `vercel.json`

### 3. Variables de entorno (opcional)

Si quieres conectar una base de datos PostgreSQL:

```bash
# En Vercel Dashboard → Settings → Environment Variables
POSTGRES_URL=tu_url_de_postgres
```

### 4. Deployment automático

- **Cada push a `main`** se desplegará automáticamente
- **Preview deployments** para cada pull request
- **Rollback** a versiones anteriores si algo falla

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📁 Estructura del proyecto

```
src/
├── lib/
│   ├── components/          # Componentes reutilizables
│   │   ├── Cart.svelte     # Carrito de compras
│   │   ├── ProductGrid.svelte # Grid de productos
│   │   └── CategoryScroll.svelte # Scroll de categorías
│   ├── types.ts            # Tipos TypeScript
│   └── config.ts           # Configuración
├── routes/
│   ├── +page.svelte        # Página principal
│   ├── +layout.svelte      # Layout principal
│   └── api/
│       └── furniture/      # API de muebles
└── app.html                # Template HTML
```

## 🎯 Próximas mejoras

- [ ] **Sistema de favoritos** completo
- [ ] **Vista detallada** de productos
- [ ] **Integración con WhatsApp** para pedidos
- [ ] **Más filtros** (precio, material, estilo)
- [ ] **Animaciones** y transiciones suaves
- [ ] **PWA** (Progressive Web App)

## 🌟 Tecnologías

- **Frontend**: SvelteKit + TypeScript
- **Styling**: CSS Variables + Responsive Design
- **Icons**: Lucide Svelte
- **Images**: Pexels API (gratuita)
- **Deployment**: Vercel
- **Database**: PostgreSQL (opcional)

## 📱 Demo

Visita la aplicación desplegada en: [tu-url-de-vercel.vercel.app](https://tu-url-de-vercel.vercel.app)

---

**¿Te gusta el proyecto?** ⭐ ¡Dale una estrella al repositorio!
