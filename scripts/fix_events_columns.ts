import { pool } from '../src/server/db/pool';

async function main() {
  try {
    console.log('[fix] Ensuring events.start_time / events.end_time exist');
    await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ');
    await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time)');

    // Optional backfill from legacy columns if present
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = current_schema() AND table_name = 'events' AND column_name = 'start'
        ) THEN
          EXECUTE 'UPDATE events SET start_time = start WHERE start_time IS NULL';
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = current_schema() AND table_name = 'events' AND column_name = 'end'
        ) THEN
          EXECUTE 'UPDATE events SET end_time = "end" WHERE end_time IS NULL';
        END IF;
      END $$;
    `);
    console.log('[fix] Completed ensuring events columns');
  } finally {
    await pool.end();
  }
}

main().catch(async (err) => {
  console.error('[fix] Error:', err);
  await pool.end();
  process.exit(1);
});