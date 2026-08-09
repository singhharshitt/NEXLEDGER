DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'full_name'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'name'
    ) THEN
      ALTER TABLE users RENAME COLUMN name TO full_name;
    ELSE
      ALTER TABLE users ADD COLUMN full_name TEXT;
    END IF;
  END IF;
END $$;

UPDATE users
SET full_name = COALESCE(NULLIF(full_name, ''), split_part(email, '@', 1), 'NexLedger User')
WHERE full_name IS NULL OR full_name = '';

ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
