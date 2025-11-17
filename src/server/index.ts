import { connectWithRetry, withTransaction, pool } from './db/pool';
import { createUserTx, getUserByEmailTx } from './db/queries/users';
import { createEventTx } from './db/queries/events';
import { registerTx } from './db/queries/registrations';
import { mapPgError } from './db/errors';

async function healthCheck() {
  const client = await connectWithRetry();
  try {
    const res = await client.query('SELECT 1');
    console.log('[db] Health check:', res.rows[0]);
  } finally {
    client.release();
  }
}

async function demo() {
  try {
    await healthCheck();
    await withTransaction(async (client) => {
      const user = await createUserTx(client, 'alice@example.com', 'hashed-password', 'Alice', 'Wonderland');
      console.log('Created user:', user);
      const found = await getUserByEmailTx(client, 'alice@example.com');
      console.log('Found user:', found);

      const event = await createEventTx(client, ['Beach Cleanup', 'Clean the beach', 'Santa Monica', new Date(), new Date(Date.now() + 2 * 60 * 60 * 1000), 50, '00000000-0000-0000-0000-000000000001']);
      console.log('Created event:', event);

      const reg = await registerTx(client, user.id, event.id);
      console.log('Registered:', reg);
    });
  } catch (err) {
    const mapped = mapPgError(err);
    console.error('[demo] Error:', mapped.name, mapped.message, mapped.code);
  } finally {
    await pool.end();
  }
}

// Run demo when invoked directly
demo();