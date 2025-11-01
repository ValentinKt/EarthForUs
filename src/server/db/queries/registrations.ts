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

export async function registerTx(client: PoolClient, userId: number, eventId: number) {
  // Ensure capacity is not exceeded
  const event = await client.query('SELECT capacity FROM events WHERE id = $1', [eventId]);
  if (event.rowCount === 0) throw new Error('Event not found');
  const capacity: number = event.rows[0].capacity;

  const countRes = await client.query(countRegistrationsForEvent, [eventId]);
  const current = countRes.rows[0].count as number;
  if (current >= capacity) throw new Error('Event capacity reached');

  const res = await client.query(registerUserForEvent, [userId, eventId]);
  return res.rows[0] || null; // null when already registered
}