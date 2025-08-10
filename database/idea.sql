BEGIN;

-- 1) Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- 2) Usuarios
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'customer', -- 'admin' o 'customer'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Categorías principales
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Productos
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  sku TEXT UNIQUE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_unique BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 0, -- puede ser negativo para backorders
  stock_threshold INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active',
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  category_id BIGINT REFERENCES categories(id), -- categoría principal
  searchable tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Imágenes (máx. 5 por producto)
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  position SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) Etiquetas
CREATE TABLE tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_tags (
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- 7) Favoritos
CREATE TABLE favorites (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, product_id)
);

-- 8) Ratings
CREATE TABLE ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 9) Carritos
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  is_snapshot BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity SMALLINT NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10) Órdenes
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  contact_email TEXT,
  contact_phone TEXT,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending_whatsapp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  whatsapp_sent_at TIMESTAMPTZ
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity SMALLINT NOT NULL,
  title_snapshot TEXT,
  sku_snapshot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11) Cambios de stock
CREATE TABLE stock_changes (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  actor_user_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12) Notificaciones
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  type TEXT NOT NULL,
  payload JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13) Índices clave
CREATE INDEX products_search_idx ON products USING GIN (to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(description,'')));
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_product_tags_product ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags(tag_id);

-- 14) Funciones y triggers

-- A) Límite 5 imágenes por producto
CREATE OR REPLACE FUNCTION fn_check_product_images_limit() RETURNS trigger AS $$
DECLARE
  img_count INT;
BEGIN
  SELECT COUNT(*) INTO img_count FROM product_images WHERE product_id = NEW.product_id;
  IF img_count >= 5 THEN
    RAISE EXCEPTION 'Cada producto no puede tener más de 5 imágenes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_images_limit
BEFORE INSERT ON product_images
FOR EACH ROW EXECUTE FUNCTION fn_check_product_images_limit();

-- B) Actualizar promedio de ratings
CREATE OR REPLACE FUNCTION fn_recompute_product_rating() RETURNS trigger AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  cnt INT;
BEGIN
  SELECT COUNT(*), COALESCE(AVG(rating),0) INTO cnt, avg_rating FROM ratings WHERE product_id = NEW.product_id;
  UPDATE products SET rating_avg = avg_rating, rating_count = cnt, updated_at = now() WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ratings_after_ins AFTER INSERT ON ratings FOR EACH ROW EXECUTE FUNCTION fn_recompute_product_rating();
CREATE TRIGGER trg_ratings_after_upd AFTER UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION fn_recompute_product_rating();

CREATE OR REPLACE FUNCTION fn_recompute_product_rating_del() RETURNS trigger AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  cnt INT;
BEGIN
  SELECT COUNT(*), COALESCE(AVG(rating),0) INTO cnt, avg_rating FROM ratings WHERE product_id = OLD.product_id;
  UPDATE products SET rating_avg = avg_rating, rating_count = cnt, updated_at = now() WHERE id = OLD.product_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ratings_after_del AFTER DELETE ON ratings FOR EACH ROW EXECUTE FUNCTION fn_recompute_product_rating_del();

-- C) Snapshot de carrito a orden
CREATE OR REPLACE FUNCTION fn_cart_snapshot_to_order(p_cart_id UUID, p_contact_email TEXT, p_contact_phone TEXT) RETURNS BIGINT AS $$
DECLARE
  o_id BIGINT;
  total INTEGER := 0;
  ci RECORD;
BEGIN
  IF (SELECT is_snapshot FROM carts WHERE id = p_cart_id) THEN
    RAISE EXCEPTION 'Carrito ya fue snapshotteado';
  END IF;

  INSERT INTO orders(user_id, contact_email, contact_phone, total_cents, status)
  SELECT c.user_id, p_contact_email, p_contact_phone, 0, 'pending_whatsapp'
  FROM carts c WHERE c.id = p_cart_id
  RETURNING id INTO o_id;

  FOR ci IN SELECT * FROM cart_items WHERE cart_id = p_cart_id LOOP
    INSERT INTO order_items(order_id, product_id, unit_price_cents, quantity, title_snapshot, sku_snapshot)
    SELECT o_id, ci.product_id, ci.unit_price_cents, ci.quantity, p.title, p.sku
    FROM products p WHERE p.id = ci.product_id;

    total := total + (ci.unit_price_cents * ci.quantity);
  END LOOP;

  UPDATE orders SET total_cents = total WHERE id = o_id;
  UPDATE carts SET is_snapshot = true WHERE id = p_cart_id;

  RETURN o_id;
END;
$$ LANGUAGE plpgsql;

-- D) Confirmar orden vía WhatsApp y descontar stock
CREATE OR REPLACE FUNCTION fn_confirm_order_mark_whatsapp_sent(p_order_id BIGINT, p_actor_user_id BIGINT) RETURNS VOID AS $$
DECLARE
  oi RECORD;
  new_stock INTEGER;
BEGIN
  IF (SELECT status FROM orders WHERE id = p_order_id) != 'pending_whatsapp' THEN
    RAISE EXCEPTION 'Order no en estado pending_whatsapp';
  END IF;

  FOR oi IN SELECT * FROM order_items WHERE order_id = p_order_id LOOP
    UPDATE products SET stock = stock - oi.quantity, updated_at = now()
    WHERE id = oi.product_id
    RETURNING stock INTO new_stock;

    INSERT INTO stock_changes(product_id, delta, reason, actor_user_id)
    VALUES (oi.product_id, -oi.quantity, 'order_confirmed', p_actor_user_id);

    IF new_stock < (SELECT stock_threshold FROM products WHERE id = oi.product_id) THEN
      INSERT INTO notifications(user_id, type, payload)
      VALUES (NULL, 'stock_below_threshold', jsonb_build_object('product_id', oi.product_id, 'stock', new_stock));
    END IF;
  END LOOP;

  UPDATE orders SET status = 'confirmed', whatsapp_sent_at = now() WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- E) Ajuste manual de stock
CREATE OR REPLACE FUNCTION fn_admin_adjust_stock(p_product_id BIGINT, p_delta INTEGER, p_actor_user_id BIGINT, p_reason TEXT) RETURNS VOID AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE products SET stock = stock + p_delta, updated_at = now() WHERE id = p_product_id RETURNING stock INTO new_stock;
  INSERT INTO stock_changes(product_id, delta, reason, actor_user_id) VALUES (p_product_id, p_delta, p_reason, p_actor_user_id);
  IF new_stock < (SELECT stock_threshold FROM products WHERE id = p_product_id) THEN
    INSERT INTO notifications(user_id, type, payload)
    VALUES (NULL, 'stock_below_threshold', jsonb_build_object('product_id', p_product_id, 'stock', new_stock));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- F) Limpieza de carritos vencidos
CREATE OR REPLACE FUNCTION fn_cleanup_expired_carts() RETURNS INTEGER AS $$
DECLARE
  removed INT;
BEGIN
  DELETE FROM carts WHERE expires_at < now() AND is_snapshot = false;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$ LANGUAGE plpgsql;

-- G) Indexar texto
CREATE OR REPLACE FUNCTION fn_products_tsvector_update() RETURNS trigger AS $$
BEGIN
  NEW.searchable := to_tsvector('spanish', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_searchable BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION fn_products_tsvector_update();

-- H) Auto updated_at
CREATE OR REPLACE FUNCTION fn_update_timestamp() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_update_ts BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_carts_update_ts BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_cart_items_update_ts BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_orders_update_ts BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_ratings_update_ts BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

COMMIT;
