CREATE TABLE IF NOT EXISTS products (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT         NOT NULL,
  sku           TEXT         NOT NULL UNIQUE,
  description   TEXT,
  category      TEXT         NOT NULL,
  unit          TEXT         NOT NULL DEFAULT 'piece',
  unit_price    NUMERIC(12,2) NOT NULL,
  current_stock INTEGER      NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INTEGER      NOT NULL DEFAULT 0,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock    ON products(current_stock);
