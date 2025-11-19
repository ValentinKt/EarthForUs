import type { PoolClient } from 'pg';

export const registerUserForEvent = {
  name: 'register-user-for-event',
  text: `INSERT INTO registrations (user_id, event_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, event_id) DO NOTHING
         RETURNING id, user_id, event_id, registered_at`,
};

export const countRegistrationsForEvent = {
  name: 'count-registrations-for-event',
  text: `SELECT COUNT(*)::int AS count FROM registrations WHERE event_id = $1`,
};

export async function registerTx(client: PoolClient, userId: string | number, eventId: string | number) {
  const et = await client.query(`SELECT pg_typeof(id)::text AS t FROM events LIMIT 1`);
  const ut = await client.query(`SELECT pg_typeof(id)::text AS t FROM users LIMIT 1`);
  const eventIdType = (et.rows[0]?.t === 'uuid' ? 'uuid' : 'bigint');
  const userIdType = (ut.rows[0]?.t === 'uuid' ? 'uuid' : 'bigint');
  await client.query(
    `CREATE TABLE IF NOT EXISTS registrations (
      id BIGSERIAL PRIMARY KEY,
      user_id ${userIdType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id ${eventIdType} NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, event_id)
    )`
  );
  const eId = String(eventId);
  const uId = String(userId);

  const eventRes = await client.query('SELECT * FROM events WHERE id::text = $1::text LIMIT 1', [eId]);
  if ((eventRes.rowCount ?? 0) === 0) throw new Error('Event not found');
  const capacityVal = (eventRes.rows[0] as any).capacity;
  const capacity = typeof capacityVal === 'number' ? capacityVal : null;

  const countRes = await client.query('SELECT COUNT(*)::int AS count FROM registrations WHERE event_id::text = $1::text', [eId]);
  const current = (countRes.rows[0].count as number) || 0;
  if (typeof capacity === 'number' && current >= capacity) throw new Error('Event capacity reached');

  const insertRes = await client.query(
    `INSERT INTO registrations (user_id, event_id)
     SELECT u.id, e.id FROM users u, events e
     WHERE u.id::text = $1::text AND e.id::text = $2::text
     ON CONFLICT (user_id, event_id) DO NOTHING
     RETURNING id, user_id, event_id, registered_at`,
    [uId, eId]
  );
  return insertRes.rows[0] || null;
}