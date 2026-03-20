-- Products catalogue
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)   NOT NULL UNIQUE,
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  color       VARCHAR(50)    NOT NULL,
  -- TRUE for items eligible for the pair-discount (Orange, Pink, Green)
  discountable BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Customer orders (one row per checkout)
CREATE TABLE IF NOT EXISTS orders (
  id                    SERIAL PRIMARY KEY,
  member_card_number    VARCHAR(100),
  total_before_discount NUMERIC(10, 2) NOT NULL,
  pair_discount_total   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  member_card_discount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_total           NUMERIC(10, 2) NOT NULL,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Line items per order
CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL  PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes to support the Red-set hourly-restriction query
CREATE INDEX IF NOT EXISTS idx_orders_created_at       ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id  ON order_items(product_id);
