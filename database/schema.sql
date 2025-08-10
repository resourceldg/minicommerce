-- 🚀 Schema de Base de Datos para Rare&Magic
-- Arquitectura: Vidriera Digital + WhatsApp Business = Checkout Directo

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- 1. CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL, -- Nombre del icono de Lucide
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CHECKOUTS (Enlaces de Compra Únicos)
CREATE TABLE IF NOT EXISTS checkouts (
    id SERIAL PRIMARY KEY,
    checkout_code VARCHAR(50) UNIQUE NOT NULL, -- Código único para el enlace
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired, cancelled
    whatsapp_sent BOOLEAN DEFAULT false,
    whatsapp_message_id VARCHAR(100), -- ID del mensaje de WhatsApp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ITEMS DEL CHECKOUT
CREATE TABLE IF NOT EXISTS checkout_items (
    id SERIAL PRIMARY KEY,
    checkout_id INTEGER REFERENCES checkouts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. LOGS DE STOCK
CREATE TABLE IF NOT EXISTS stock_logs (
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

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Categorías
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, sort_order);

-- Productos
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Checkouts
CREATE INDEX IF NOT EXISTS idx_checkouts_code ON checkouts(checkout_code);
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkouts_expires ON checkouts(expires_at);
CREATE INDEX IF NOT EXISTS idx_checkouts_customer ON checkouts(customer_phone, customer_email);

-- Checkouts
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkouts_whatsapp ON checkouts(whatsapp_sent);
CREATE INDEX IF NOT EXISTS idx_checkouts_customer ON checkouts(customer_phone, customer_email);

-- Checkout Items
CREATE INDEX IF NOT EXISTS idx_checkout_items_checkout ON checkout_items(checkout_id);
CREATE INDEX IF NOT EXISTS idx_checkout_items_product ON checkout_items(product_id);

-- Stock Logs
CREATE INDEX IF NOT EXISTS idx_stock_logs_product ON stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_action ON stock_logs(action);
CREATE INDEX IF NOT EXISTS idx_stock_logs_checkout ON stock_logs(checkout_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created ON stock_logs(created_at);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers a todas las tablas
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkouts_updated_at BEFORE UPDATE ON checkouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES PARA GESTIÓN DE STOCK
-- =====================================================

-- Función para crear checkout con múltiples productos
CREATE OR REPLACE FUNCTION create_checkout_from_cart(
    p_items JSON, -- Array de {productId, quantity}
    p_customer_name VARCHAR(255) DEFAULT NULL,
    p_customer_phone VARCHAR(20) DEFAULT NULL,
    p_customer_email VARCHAR(255) DEFAULT NULL
)
RETURNS VARCHAR(50) AS $$
DECLARE
    checkout_code VARCHAR(50);
    checkout_id INTEGER;
    item RECORD;
    total_amount DECIMAL(10,2) := 0;
BEGIN
    -- Generar código único
    checkout_code := 'RM' || EXTRACT(EPOCH FROM NOW())::INTEGER || floor(random() * 1000)::INTEGER;
    
    -- Crear checkout principal
    INSERT INTO checkouts (checkout_code, customer_name, customer_phone, customer_email, total_amount)
    VALUES (checkout_code, p_customer_name, p_customer_phone, p_customer_email, 0)
    RETURNING id INTO checkout_id;
    
    -- Procesar cada item
    FOR item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        -- Verificar stock
        IF NOT EXISTS (
            SELECT 1 FROM products 
            WHERE id = (item->>'productId')::INTEGER 
            AND is_available = true 
            AND stock_quantity >= (item->>'quantity')::INTEGER
        ) THEN
            RAISE EXCEPTION 'Producto % no disponible o stock insuficiente', (item->>'productId')::INTEGER;
        END IF;
        
        -- Agregar item al checkout
        INSERT INTO checkout_items (checkout_id, product_id, quantity, unit_price, subtotal)
        SELECT 
            checkout_id,
            p.id,
            (item->>'quantity')::INTEGER,
            p.price,
            p.price * (item->>'quantity')::INTEGER
        FROM products p
        WHERE p.id = (item->>'productId')::INTEGER;
        
        -- Actualizar total
        total_amount := total_amount + (p.price * (item->>'quantity')::INTEGER);
        
        -- Reservar stock
        UPDATE products 
        SET stock_quantity = stock_quantity - (item->>'quantity')::INTEGER
        WHERE id = (item->>'productId')::INTEGER;
        
        -- Registrar en log
        INSERT INTO stock_logs (product_id, action, quantity, previous_stock, new_stock, checkout_id, notes)
        SELECT 
            p.id,
            'reserved',
            (item->>'quantity')::INTEGER,
            p.stock_quantity + (item->>'quantity')::INTEGER,
            p.stock_quantity,
            checkout_id,
            'Stock reservado para checkout'
        FROM products p
        WHERE p.id = (item->>'productId')::INTEGER;
    END LOOP;
    
    -- Actualizar total del checkout
    UPDATE checkouts SET total_amount = total_amount WHERE id = checkout_id;
    
    RETURN checkout_code;
END;
$$ LANGUAGE plpgsql;

-- Función para liberar stock
CREATE OR REPLACE FUNCTION release_stock(
    p_checkout_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    checkout_record RECORD;
BEGIN
    -- Obtener información del checkout
    SELECT product_id, quantity INTO checkout_record
    FROM checkouts
    WHERE id = p_checkout_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Liberar stock
    UPDATE products 
    SET stock_quantity = stock_quantity + checkout_record.quantity
    WHERE id = checkout_record.product_id;
    
    -- Registrar en log
    INSERT INTO stock_logs (product_id, action, quantity, previous_stock, new_stock, checkout_id, notes)
    SELECT 
        checkout_record.product_id, 
        'released', 
        checkout_record.quantity, 
        stock_quantity - checkout_record.quantity, 
        stock_quantity, 
        p_checkout_id, 
        'Stock liberado de checkout'
    FROM products 
    WHERE id = checkout_record.product_id;
    
    -- Marcar checkout como expirado
    UPDATE checkouts SET status = 'expired' WHERE id = p_checkout_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Función para confirmar venta
CREATE OR REPLACE FUNCTION confirm_sale(
    p_checkout_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    checkout_record RECORD;
BEGIN
    -- Obtener información del checkout
    SELECT * INTO checkout_record
    FROM checkouts
    WHERE id = p_checkout_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Actualizar estado del checkout
    UPDATE checkouts 
    SET status = 'completed'
    WHERE id = p_checkout_id;
    
    -- Registrar venta en logs (no liberar stock, ya está reservado)
    INSERT INTO stock_logs (product_id, action, quantity, previous_stock, new_stock, checkout_id, notes)
    SELECT 
        checkout_record.product_id, 
        'sold', 
        checkout_record.quantity, 
        stock_quantity, 
        stock_quantity, 
        p_checkout_id, 
        'Venta confirmada'
    FROM products 
    WHERE id = checkout_record.product_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar categorías
INSERT INTO categories (name, slug, icon, sort_order) VALUES
('Sillas', 'sillas', 'Armchair', 1),
('Mesas', 'mesas', 'Square', 2),
('Muebles', 'muebles', 'Box', 3),
('Asientos', 'asientos', 'Armchair', 4),
('Estanterías', 'estanterias', 'BookOpen', 5),
('Iluminación', 'iluminacion', 'Lightbulb', 6),
('Decoración', 'decoracion', 'Star', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity) VALUES
('Silla Vintage Restaurada', 'Silla de madera restaurada con estilo vintage, perfecta para comedor o escritorio', 150.00, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 1, 5),
('Mesa de Centro Antigua', 'Mesa de centro restaurada con patas torneadas y acabado en barniz natural', 300.00, 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=400', 2, 3),
('Cómoda Clásica', 'Cómoda de madera maciza restaurada con cajones funcionales', 450.00, 'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=400', 3, 2),
('Sofá Chesterfield', 'Sofá clásico restaurado con tapizado premium y estructura sólida', 800.00, 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=400', 4, 1),
('Estantería Industrial', 'Estantería de metal y madera con estilo industrial vintage', 250.00, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 5, 4),
('Silla de Jardín Adirondack', 'Silla de jardín clásica restaurada, perfecta para terrazas y patios', 180.00, 'https://images.pexels.com/photos/1571465/pexels-photo-1571465.jpeg?auto=compress&cs=tinysrgb&w=400', 1, 6),
('Mesa de Noche Artesanal', 'Mesa de noche con cajón secreto y patas talladas a mano', 250.00, 'https://images.pexels.com/photos/1571466/pexels-photo-1571466.jpeg?auto=compress&cs=tinysrgb&w=400', 3, 2),
('Lámpara de Mesa Vintage', 'Lámpara de mesa restaurada con pantalla de tela y base de latón', 120.00, 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=400', 6, 8),
('Espejo Decorativo Antiguo', 'Espejo de pared restaurado con marco tallado y acabado dorado', 220.00, 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400', 7, 3),
('Silla de Escritorio Vintage', 'Silla de escritorio restaurada con respaldo alto y asiento acolchado', 120.00, 'https://images.pexels.com/photos/1571469/pexels-photo-1571469.jpeg?auto=compress&cs=tinysrgb&w=400', 1, 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para productos disponibles con categoría
CREATE OR REPLACE VIEW available_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.stock_quantity,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_available = true AND p.stock_quantity > 0
ORDER BY c.sort_order, p.name;

-- Vista para checkouts activos
CREATE OR REPLACE VIEW active_checkouts AS
SELECT 
    c.id,
    c.checkout_code,
    c.total_amount,
    c.customer_name,
    c.customer_phone,
    c.customer_email,
    c.status,
    c.whatsapp_sent,
    c.created_at,
    COUNT(ci.id) as item_count
FROM checkouts c
LEFT JOIN checkout_items ci ON c.id = ci.checkout_id
WHERE c.status = 'pending'
GROUP BY c.id, c.checkout_code, c.total_amount, c.customer_name, c.customer_phone, c.customer_email, c.status, c.whatsapp_sent, c.created_at
ORDER BY c.created_at DESC;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON TABLE categories IS 'Categorías de productos para organización de la vidriera';
COMMENT ON TABLE products IS 'Productos disponibles en la tienda con gestión de stock';
COMMENT ON TABLE checkouts IS 'Enlaces de compra únicos que expiran en 24h';
COMMENT ON TABLE checkouts IS 'Checkouts directos de productos individuales';
COMMENT ON TABLE stock_logs IS 'Registro completo de movimientos de stock para auditoría';

COMMENT ON FUNCTION create_checkout_from_cart IS 'Crea checkout con múltiples productos del carrito';
COMMENT ON FUNCTION release_stock IS 'Libera stock reservado cuando expira un checkout';
COMMENT ON FUNCTION confirm_sale IS 'Confirma una venta y actualiza logs';

-- =====================================================
-- FIN DEL SCHEMA
-- ===================================================== 