CREATE TABLE IF NOT EXISTS challans (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_number TEXT         NOT NULL UNIQUE,
  customer_id    UUID         NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status         TEXT         NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','CONFIRMED','CANCELLED')),
  notes          TEXT,
  total_quantity INTEGER      NOT NULL DEFAULT 0,
  total_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
  confirmed_at   TIMESTAMPTZ,
  cancelled_at   TIMESTAMPTZ,
  created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challans_number   ON challans(challan_number);
CREATE INDEX IF NOT EXISTS idx_challans_customer ON challans(customer_id);
CREATE INDEX IF NOT EXISTS idx_challans_status   ON challans(status);
CREATE INDEX IF NOT EXISTS idx_challans_created  ON challans(created_at);
