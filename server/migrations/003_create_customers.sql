CREATE TABLE IF NOT EXISTS customers (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name  TEXT         NOT NULL,
  contact_name   TEXT         NOT NULL,
  email          TEXT,
  mobile         TEXT         NOT NULL,
  address        TEXT,
  city           TEXT,
  state          TEXT,
  gstin          TEXT,
  type           TEXT         NOT NULL CHECK (type IN ('RETAIL','WHOLESALE','DISTRIBUTOR')),
  status         TEXT         NOT NULL DEFAULT 'LEAD' CHECK (status IN ('LEAD','ACTIVE','INACTIVE')),
  credit_limit   NUMERIC(12,2) DEFAULT 0,
  notes          TEXT,
  follow_up_date DATE,
  created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_contact_name   ON customers(contact_name);
CREATE INDEX IF NOT EXISTS idx_customers_mobile         ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_status         ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type           ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_follow_up_date ON customers(follow_up_date);
