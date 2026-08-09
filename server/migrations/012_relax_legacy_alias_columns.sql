DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
      AND column_name = 'product_name'
  ) THEN
    ALTER TABLE products ALTER COLUMN product_name DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'customers'
      AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE customers ALTER COLUMN customer_name DROP NOT NULL;
  END IF;
END $$;
