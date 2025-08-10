-- Crear tabla de muebles
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

-- Insertar datos de ejemplo
INSERT INTO furniture (name, description, price, image, category) VALUES
    ('Silla Vintage Restaurada', 'Silla de madera restaurada con estilo vintage, perfecta para comedor o escritorio', 150.00, '/images/chair.jpg', 'sillas'),
    ('Mesa de Centro Antigua', 'Mesa de centro restaurada con patas torneadas y acabado en barniz natural', 300.00, '/images/table.jpg', 'mesas'),
    ('Cómoda Clásica', 'Cómoda de madera maciza restaurada con cajones funcionales', 450.00, '/images/dresser.jpg', 'muebles'),
    ('Sofá Chesterfield', 'Sofá clásico restaurado con tapizado premium y estructura sólida', 800.00, '/images/sofa.jpg', 'asientos'),
    ('Estantería Industrial', 'Estantería de metal y madera con estilo industrial vintage', 250.00, '/images/shelf.jpg', 'estanterías'),
    ('Lámpara de Mesa Art Deco', 'Lámpara de mesa restaurada con estilo Art Deco y pantalla de cristal', 180.00, '/images/lamp.jpg', 'iluminación'),
    ('Espejo de Pared Antiguo', 'Espejo de pared restaurado con marco tallado y acabado dorado', 220.00, '/images/mirror.jpg', 'decoración'),
    ('Silla de Escritorio Vintage', 'Silla de escritorio restaurada con respaldo alto y asiento acolchado', 120.00, '/images/desk-chair.jpg', 'sillas');

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_furniture_category ON furniture(category);
CREATE INDEX IF NOT EXISTS idx_furniture_price ON furniture(price);

-- Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_furniture_updated_at 
    BEFORE UPDATE ON furniture 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 