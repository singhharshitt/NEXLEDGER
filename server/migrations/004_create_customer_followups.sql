CREATE TABLE IF NOT EXISTS customer_followups (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  notes          TEXT        NOT NULL,
  follow_up_date DATE,
  completed      BOOLEAN     NOT NULL DEFAULT false,
  created_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_followups_customer ON customer_followups(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_followups_date     ON customer_followups(follow_up_date);
