# 🚀 Lógica de Negocio Disruptiva - Rare&Magic

## 🎯 Concepto Central

**"Vidriera Digital + WhatsApp Business = Checkout Directo"**

En lugar de un carrito tradicional, el usuario:
1. **Explora** productos en la vidriera digital
2. **Selecciona** lo que le interesa
3. **Recibe** un enlace de checkout único
4. **Completa** la transacción vía WhatsApp Business

## 🏗️ Arquitectura de Base de Datos

### 📊 Entidades Principales

#### 1. **Products (Productos)**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Checkouts (Enlaces de Compra)**
```sql
CREATE TABLE checkouts (
    id SERIAL PRIMARY KEY,
    checkout_code VARCHAR(50) UNIQUE NOT NULL, -- Código único para el enlace
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired, cancelled
    expires_at TIMESTAMP NOT NULL, -- El checkout expira en 24h
    whatsapp_message TEXT, -- Mensaje personalizado para WhatsApp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **Checkout_Items (Productos en el Checkout)**
```sql
CREATE TABLE checkout_items (
    id SERIAL PRIMARY KEY,
    checkout_id INTEGER REFERENCES checkouts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. **Categories (Categorías)**
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50), -- Nombre del icono de Lucide
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. **Stock_Logs (Registro de Movimientos de Stock)**
```sql
CREATE TABLE stock_logs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'reserved', 'released', 'sold', 'restored'
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    checkout_id INTEGER REFERENCES checkouts(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Flujo de Negocio

### 1. **Exploración del Usuario**
```
Usuario → Navega por categorías → Ve productos → Selecciona items
```

### 2. **Generación de Checkout**
```
Sistema → Crea checkout único → Genera enlace → Reserva stock temporal
```

### 3. **Comunicación WhatsApp**
```
Sistema → Envía mensaje personalizado → Incluye enlace de checkout
```

### 4. **Gestión de Stock**
```
Stock → Se reserva temporalmente → Se libera si expira → Se confirma si se vende
```

## 💡 Lógica de Stock Minimalista

### **Principios:**
- **Stock Real**: Solo lo que está físicamente disponible
- **Reserva Temporal**: 24h para confirmar compra
- **Liberación Automática**: Si no se confirma, se libera el stock
- **Sin Carritos**: No hay carritos persistentes

### **Estados de Stock:**
1. **Available**: Disponible para compra
2. **Reserved**: Reservado en checkout (24h)
3. **Sold**: Vendido y confirmado
4. **Out of Stock**: Sin stock disponible

## 🎨 Experiencia de Usuario

### **Flujo Ultra-Minimalista:**
1. **Browse**: Usuario explora productos
2. **Add to Cart**: Agrega productos al carrito (se mantiene)
3. **Checkout**: Ve lista + total + botón "Comprar"
4. **Buy**: Un solo click en "Comprar"
5. **Done**: Sistema envía checkout directo a WhatsApp Business
6. **Complete**: Tú gestionas pago y logística por WhatsApp

### **Ventajas:**
- ✅ **Sin registro**: No requiere cuenta
- ✅ **Sin carrito**: Experiencia más directa
- ✅ **Personalización**: Mensaje personalizado por WhatsApp
- ✅ **Trazabilidad**: Cada checkout es único y rastreable
- ✅ **Stock Real**: No hay sobreventas

## 🔧 Implementación Técnica

### **APIs Necesarias:**

#### **POST /api/checkouts**
```typescript
interface CreateCheckoutRequest {
    items: Array<{
        productId: number;
        quantity: number;
    }>;
    customerInfo?: {
        name?: string;
        phone?: string;
        email?: string;
    };
}
```

#### **GET /api/checkouts/:code**
```typescript
interface CheckoutResponse {
    id: number;
    code: string;
    items: CheckoutItem[];
    totalAmount: number;
    status: string;
    expiresAt: string;
    whatsappMessage: string;
}
```

#### **POST /api/checkouts/:code/confirm**
```typescript
interface ConfirmCheckoutRequest {
    confirmed: boolean;
    notes?: string;
}
```

### **Webhooks de WhatsApp Business:**
- **Stock Confirmed**: Cuando se confirma la venta
- **Stock Released**: Cuando expira el checkout
- **Customer Message**: Para seguimiento personalizado

## 📱 Integración WhatsApp Business

### **Mensaje Automático:**
```
🛒 **NUEVA COMPRA - Rare&Magic**

Productos seleccionados:
🪑 Silla Vintage Restaurada - $150 x1
🪑 Mesa de Centro Antigua - $300 x1
🪑 Lámpara Art Deco - $120 x2

💰 **Total: $690**

📱 Cliente: [Nombre si disponible]
📧 Email: [Email si disponible]
🌐 Origen: https://raremagic.com

⏰ Checkout creado: [Timestamp]
🔗 Código: ABC123

💬 **Gestiona pago y logística por WhatsApp**
```

### **Respuestas Automáticas:**
- **Confirmación**: "¡Perfecto! Tu pedido está confirmado"
- **Stock**: "Producto disponible, procedemos con la venta"
- **Pago**: "Opciones de pago: transferencia, efectivo, tarjeta"

## 🚀 Próximos Pasos

1. **✅ Diseño de Base de Datos** (Este documento)
2. **🔄 Implementar Schemas** (SQL)
3. **🔧 Crear APIs** (Checkout, Stock, WhatsApp)
4. **📱 Integrar WhatsApp Business API**
5. **🎨 UI/UX del Checkout**
6. **🧪 Testing y Validación**

## 💭 Consideraciones Futuras

- **Analytics**: Tracking de conversiones por checkout
- **Personalización**: Mensajes personalizados por cliente
- **Automatización**: Respuestas automáticas inteligentes
- **Escalabilidad**: Múltiples tiendas, múltiples WhatsApp

---

**¿Te parece bien esta arquitectura? ¿Quieres que ajustemos algún aspecto específico?** 