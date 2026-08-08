-- NexLedger initial schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  business_name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(20),
  customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR')),
  address TEXT NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  state VARCHAR(100) NOT NULL DEFAULT '',
  pincode VARCHAR(20) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'LEAD' CHECK (status IN ('LEAD', 'ACTIVE', 'INACTIVE')),
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (customer_name);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers (mobile);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers (customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_follow_up_date ON customers (follow_up_date);

CREATE TABLE IF NOT EXISTS customer_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_followups_customer ON customer_followups (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_followups_date ON customer_followups (follow_up_date);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
  unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
  warehouse_location VARCHAR(100) NOT NULL DEFAULT 'Main',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_sku_unique UNIQUE (sku)
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (current_stock);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  quantity_changed INTEGER NOT NULL CHECK (quantity_changed > 0),
  movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  reason TEXT NOT NULL,
  reference VARCHAR(255),
  created_by UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements (created_at);

CREATE TABLE IF NOT EXISTS challan_sequences (
  year INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_number VARCHAR(20) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  total_quantity INTEGER NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  CONSTRAINT challans_number_unique UNIQUE (challan_number)
);

CREATE INDEX IF NOT EXISTS idx_challans_number ON challans (challan_number);
CREATE INDEX IF NOT EXISTS idx_challans_customer ON challans (customer_id);
CREATE INDEX IF NOT EXISTS idx_challans_status ON challans (status);
CREATE INDEX IF NOT EXISTS idx_challans_created ON challans (created_at);

CREATE TABLE IF NOT EXISTS challan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id UUID NOT NULL REFERENCES challans (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  product_name_snapshot VARCHAR(255) NOT NULL,
  sku_snapshot VARCHAR(100) NOT NULL,
  unit_price_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(14, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_challan_items_challan ON challan_items (challan_id);
CREATE INDEX IF NOT EXISTS idx_challan_items_product ON challan_items (product_id);
