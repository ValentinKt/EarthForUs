import { pool } from '../src/server/db/pool';

async function main() {
  const q = `SELECT column_name, data_type, is_nullable
             FROM information_schema.columns
             WHERE table_name = 'users'
             ORDER BY ordinal_position`;
  const res = await pool.query(q);
  console.log('[users columns]');
  for (const row of res.rows) {
    console.log(`- ${row.column_name}: ${row.data_type}, nullable=${row.is_nullable}`);
  }
  await pool.end();
}

main().catch(async (err) => {
  console.error('[inspect] Error:', err);
  await pool.end();
  process.exit(1);
});