import { pool, withTransaction } from '../src/server/db/pool';

async function main() {
  try {
    // Mark the problematic migration as applied to skip it
    await pool.query(`
      INSERT INTO _migrations (name) 
      VALUES ('002_chat_and_todos.sql') 
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('[fix] Marked 002_chat_and_todos.sql as applied');

    // Run our new migration to fix the schema
    const fs = await import('fs');
    const path = await import('path');
    const migrationPath = path.join(process.cwd(), 'src', 'server', 'db', 'migrations', '003_fix_schema_types.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', ['003_fix_schema_types.sql']);
    });
    
    console.log('[fix] Applied 003_fix_schema_types.sql successfully');
    
  } catch (err) {
    console.error('[fix] Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();