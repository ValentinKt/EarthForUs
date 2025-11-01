import type { PoolClient } from 'pg';

export const createEvent = {
  name: 'create-event',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, location, start_time, end_time, capacity, created_at`,
};

export const getEventById = {
  name: 'get-event-by-id',
  text: `SELECT id, title, description, location, start_time, end_time, capacity, created_at
         FROM events WHERE id = $1`,
};

export const listEvents = {
  name: 'list-events',
  text: `SELECT id, title, location, start_time, end_time FROM events ORDER BY start_time ASC LIMIT $1 OFFSET $2`,
};

export const updateEvent = {
  name: 'update-event',
  text: `UPDATE events SET title = $2, description = $3, location = $4, start_time = $5, end_time = $6, capacity = $7
         WHERE id = $1 RETURNING id`,
};

export const deleteEvent = {
  name: 'delete-event',
  text: `DELETE FROM events WHERE id = $1 RETURNING id`,
};

export async function createEventTx(client: PoolClient, args: [string, string | null, string | null, Date, Date, number]) {
  const res = await client.query(createEvent, args);
  return res.rows[0];
}