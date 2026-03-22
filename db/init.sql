-- ============================================================
-- Full schema + seed – idempotent, safe to re-run
-- ============================================================

-- ── Core tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100)   NOT NULL UNIQUE,
  price        NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  color        VARCHAR(50)    NOT NULL,
  discountable BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                    SERIAL PRIMARY KEY,
  table_number          VARCHAR(10),
  member_card_number    VARCHAR(100),
  total_before_discount NUMERIC(10, 2) NOT NULL,
  pair_discount_total   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  member_card_discount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_total           NUMERIC(10, 2) NOT NULL,
  status                VARCHAR(20)    NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL  PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Admin system ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS restaurant_tables (
  id           SERIAL PRIMARY KEY,
  table_number VARCHAR(10)  UNIQUE NOT NULL,
  capacity     INTEGER      NOT NULL DEFAULT 4,
  status       VARCHAR(20)  NOT NULL DEFAULT 'vacant',
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  note         TEXT         NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  password_salt TEXT         NOT NULL,
  full_name     VARCHAR(100) NOT NULL DEFAULT '',
  role          VARCHAR(20)  NOT NULL DEFAULT 'staff',
  permissions   JSONB        NOT NULL DEFAULT '{}',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id         TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)   NOT NULL,
  unit          VARCHAR(20)    NOT NULL DEFAULT 'ชิ้น',
  quantity      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_quantity  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key        VARCHAR(50) PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Migrations for existing tables ──────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number VARCHAR(10);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

-- ── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_created_at        ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_table_number      ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id     ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id   ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires   ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_number ON restaurant_tables(table_number);

-- ── Seed: products ────────────────────────────────────────────

INSERT INTO products (name, price, color, discountable) VALUES
  ('ผัดไทยไฟแดง',    50.00,  'red',    FALSE),
  ('ผัดไทยไฟเขียว',  40.00,  'green',  TRUE),
  ('ผัดไทยไฟน้ำเงิน', 30.00,  'blue',   FALSE),
  ('ผัดไทยไฟเหลือง', 50.00,  'yellow', FALSE),
  ('ผัดไทยไฟชมพู',   80.00,  'pink',   TRUE),
  ('ผัดไทยไฟม่วง',   90.00,  'purple', FALSE),
  ('ผัดไทยไฟส้ม',    120.00, 'orange', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ── Seed: default restaurant tables ──────────────────────────

INSERT INTO restaurant_tables (table_number, capacity) VALUES
  ('1', 4), ('2', 4), ('3', 4), ('4', 4), ('5', 4),
  ('6', 4), ('7', 4), ('8', 4), ('9', 4), ('10', 4)
ON CONFLICT (table_number) DO NOTHING;

-- ── Seed: inventory ──────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);

-- Remove old ingredient-based entries if present
DELETE FROM inventory WHERE name IN (
  'เส้นผัดไทย','กุ้งสด','ไข่ไก่','ถั่วงอก','น้ำมันพืช','ซอสผัดไทย','ต้นหอม-ผักชี'
);

INSERT INTO inventory (name, unit, quantity, min_quantity, cost_per_unit) VALUES
  ('ผัดไทยไฟแดง',     'กก.',  10.00, 3.0,  35.00),
  ('ผัดไทยไฟเขียว',   'กก.',   4.00, 3.0,  25.00),
  ('ผัดไทยไฟน้ำเงิน', 'กก.',   8.00, 3.0,  20.00),
  ('ผัดไทยไฟเหลือง',  'กก.',   6.00, 3.0,  35.00),
  ('ผัดไทยไฟชมพู',    'กก.',  12.00, 3.0,  55.00),
  ('ผัดไทยไฟม่วง',    'กก.',   5.00, 3.0,  60.00),
  ('ผัดไทยไฟส้ม',     'กก.',   3.00, 3.0,  80.00)
ON CONFLICT (name) DO NOTHING;

-- ── Seed: default settings ────────────────────────────────────

INSERT INTO settings (key, value) VALUES
  ('shop_name',      'ผัดไทยไฟรวม'),
  ('shop_address',   ''),
  ('receipt_footer', 'ขอบคุณที่ใช้บริการ'),
  ('theme_primary',  '#9E080F'),
  ('theme_accent',   '#F7B90B'),
  ('logo_url',       '')
ON CONFLICT (key) DO NOTHING;
