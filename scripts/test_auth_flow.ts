import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../src/server/db/pool';
import { createUserTx, getUserByEmailTx } from '../src/server/db/queries/users';

async function main() {
  const email = process.env.TEST_EMAIL || `john.doe.test+${Date.now()}@example.com`;
  const password = process.env.TEST_PASSWORD || 'Azerty123!*';
  const firstName = process.env.TEST_FIRST || 'John';
  const lastName = process.env.TEST_LAST || 'Doe';

  console.log('[auth-test] using email:', email);

  // Ensure a clean slate
  await withTransaction(async (client) => {
    await client.query('DELETE FROM users WHERE email = $1', [email]);
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await withTransaction(async (client) => {
    return createUserTx(client, email, passwordHash, firstName, lastName);
  });
  console.log('[auth-test] created user:', { id: user.id, email: user.email });

  // Fetch user and validate bcrypt compare
  const fetched = await withTransaction(async (client) => {
    return getUserByEmailTx(client, email);
  });
  if (!fetched) {
    console.error('[auth-test] ERROR: user not found after creation');
    process.exit(1);
  }

  // Pull password hash directly to simulate login logic
  const q = `SELECT password_hash FROM users WHERE email = $1`;
  const res = await pool.query(q, [email]);
  const row = res.rows[0];
  if (!row) {
    console.error('[auth-test] ERROR: password hash not found');
    process.exit(1);
  }
  const ok = await bcrypt.compare(password, row.password_hash);
  console.log('[auth-test] bcrypt compare result:', ok);

  if (!ok) {
    console.error('[auth-test] FAIL: bcrypt compare returned false');
    process.exit(1);
  }

  console.log('[auth-test] PASS: signup + login bcrypt compare works');
  await pool.end();
}

main().catch(async (err) => {
  console.error('[auth-test] Error:', err);
  await pool.end();
  process.exit(1);
});