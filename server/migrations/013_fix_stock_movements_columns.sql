-- Fix stock_movements table to match the expected schema
-- The code expects: type, quantity, notes, reference_id
-- The DB has: movement_type, quantity_changed, reason, reference

DO $$
BEGIN
  -- Rename movement_type -> type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'movement_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'type'
  ) THEN
    ALTER TABLE stock_movements RENAME COLUMN movement_type TO type;
  END IF;

  -- Rename quantity_changed -> quantity
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'quantity_changed'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE stock_movements RENAME COLUMN quantity_changed TO quantity;
  END IF;

  -- Rename reason -> notes (make nullable since notes is optional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'reason'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'notes'
  ) THEN
    ALTER TABLE stock_movements RENAME COLUMN reason TO notes;
    ALTER TABLE stock_movements ALTER COLUMN notes DROP NOT NULL;
  END IF;

  -- Rename reference -> reference_id (cast to UUID)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'reference'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'reference_id'
  ) THEN
    ALTER TABLE stock_movements ADD COLUMN reference_id UUID;
    -- Try to copy valid UUIDs from reference column
    UPDATE stock_movements
    SET reference_id = reference::uuid
    WHERE reference IS NOT NULL
      AND reference ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    ALTER TABLE stock_movements DROP COLUMN reference;
  END IF;

  -- Ensure notes column is nullable (code treats it as optional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'notes'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE stock_movements ALTER COLUMN notes DROP NOT NULL;
  END IF;

  -- Ensure created_by is nullable (code allows null)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stock_movements' AND column_name = 'created_by'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE stock_movements ALTER COLUMN created_by DROP NOT NULL;
  END IF;
END $$;

-- Add check constraint on type if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'stock_movements' AND column_name = 'type'
  ) THEN
    ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_type_check
      CHECK (type IN ('IN', 'OUT'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
