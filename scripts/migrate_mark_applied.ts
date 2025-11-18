import { pool } from '../src/server/db/pool';

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function mark(name: string) {
  await ensureMigrationsTable();
  const res = await pool.query('SELECT 1 FROM _migrations WHERE name = $1 LIMIT 1', [name]);
  if ((res.rowCount ?? 0) === 0) {
    await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
    console.log(`[mark] Marked ${name} as applied.`);
  } else {
    console.log(`[mark] ${name} already marked as applied.`);
  }
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: tsx scripts/migrate_mark_applied.ts <migration_name.sql>');
    process.exit(1);
  }
  await mark(name);
  await pool.end();
}

main().catch(async (err) => {
  console.error('[mark] Error:', err);
  await pool.end();
  process.exit(1);
});