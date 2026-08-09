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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_name'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'customers' AND column_name = 'name'
    ) THEN
      ALTER TABLE customers RENAME COLUMN name TO contact_name;
    ELSE
      ALTER TABLE customers ADD COLUMN contact_name TEXT;
    END IF;
  END IF;
END $$;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'RETAIL';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'LEAD';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS follow_up_date DATE;

UPDATE customers
SET
  contact_name = COALESCE(NULLIF(contact_name, ''), NULLIF(business_name, ''), NULLIF(mobile, ''), 'Unknown Contact'),
  business_name = COALESCE(NULLIF(business_name, ''), NULLIF(contact_name, ''), 'Unknown Business'),
  mobile = COALESCE(NULLIF(mobile, ''), '0000000000'),
  type = COALESCE(NULLIF(type, ''), 'RETAIL'),
  status = COALESCE(NULLIF(status, ''), 'LEAD')
WHERE contact_name IS NULL
   OR contact_name = ''
   OR business_name IS NULL
   OR business_name = ''
   OR mobile IS NULL
   OR mobile = ''
   OR type IS NULL
   OR type = ''
   OR status IS NULL
   OR status = '';

ALTER TABLE customers ALTER COLUMN contact_name SET NOT NULL;
ALTER TABLE customers ALTER COLUMN business_name SET NOT NULL;
ALTER TABLE customers ALTER COLUMN mobile SET NOT NULL;
ALTER TABLE customers ALTER COLUMN type SET NOT NULL;
ALTER TABLE customers ALTER COLUMN status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_contact_name   ON customers(contact_name);
CREATE INDEX IF NOT EXISTS idx_customers_mobile         ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_status         ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type           ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_follow_up_date ON customers(follow_up_date);
