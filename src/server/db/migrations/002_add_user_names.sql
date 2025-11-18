-- Migration: ensure users has first_name/last_name with NOT NULL
-- Safe for existing tables missing these columns

-- Add columns if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Backfill NULLs to empty strings to satisfy NOT NULL
UPDATE users SET first_name = COALESCE(first_name, '') WHERE first_name IS NULL;
UPDATE users SET last_name = COALESCE(last_name, '') WHERE last_name IS NULL;

-- If legacy 'name' column exists, attempt a best-effort backfill
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    -- Fill first_name/last_name from 'name' where they are empty
    UPDATE users
    SET first_name = CASE
      WHEN (first_name IS NULL OR first_name = '') AND name IS NOT NULL THEN split_part(name, ' ', 1)
      ELSE first_name
    END,
    last_name = CASE
      WHEN (last_name IS NULL OR last_name = '') AND name IS NOT NULL THEN regexp_replace(name, '^[^ ]+\s*', '')
      ELSE last_name
    END;
  END IF;
END $$;

-- Enforce NOT NULL constraint
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;

-- Optional: ensure created_at exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();