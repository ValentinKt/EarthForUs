import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pool, withTransaction } from '../src/server/db/pool';

async function alreadyApplied(name: string): Promise<boolean> {
  const res = await pool.query('SELECT 1 FROM _migrations WHERE name = $1 LIMIT 1', [name]);
  return (res.rowCount ?? 0) > 0;
}

async function applyMigration(name: string, sql: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
  });
}

async function main() {
  const dir = join(process.cwd(), 'src', 'server', 'db', 'migrations');
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const name = file;
    const sql = readFileSync(join(dir, file), 'utf-8');
    const applied = await alreadyApplied(name);
    if (applied) {
      console.log(`[migrate] Skipping already applied ${name}`);
      continue;
    }
    console.log(`[migrate] Applying ${name}...`);
    await applyMigration(name, sql);
    console.log(`[migrate] Applied ${name}`);
  }
  await pool.end();
}

main().catch(async (err) => {
  console.error('[migrate] Error:', err);
  await pool.end();
  process.exit(1);
});