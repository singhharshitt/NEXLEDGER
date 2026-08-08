CREATE TABLE IF NOT EXISTS stock_movements (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  type         TEXT        NOT NULL CHECK (type IN ('IN','OUT')),
  quantity     INTEGER     NOT NULL CHECK (quantity > 0),
  notes        TEXT,
  reference_id UUID,
  created_by   UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);
