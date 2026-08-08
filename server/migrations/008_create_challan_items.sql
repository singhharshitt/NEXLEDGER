CREATE TABLE IF NOT EXISTS challan_items (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id            UUID         NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
  product_id            UUID         NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name_snapshot TEXT         NOT NULL,
  sku_snapshot          TEXT         NOT NULL,
  unit_price_snapshot   NUMERIC(12,2) NOT NULL,
  quantity              INTEGER      NOT NULL CHECK (quantity > 0),
  total_price           NUMERIC(14,2) NOT NULL,
  UNIQUE (challan_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_challan_items_challan  ON challan_items(challan_id);
CREATE INDEX IF NOT EXISTS idx_challan_items_product  ON challan_items(product_id);
