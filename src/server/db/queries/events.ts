import type { PoolClient } from 'pg';

export const createEvent = {
  name: 'create-event',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, location, start_time, end_time, capacity, created_at`,
};

// Modern schema without capacity column
export const createEventNoCapacity = {
  name: 'create-event-no-capacity',
  text: `INSERT INTO events (title, description, location, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, description, location, start_time, end_time, created_at`,
};

// Modern schema including a NOT NULL 'date' column derived from start_time
export const createEventWithDate = {
  name: 'create-event-with-date',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity, date)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4))
         RETURNING id, title, description, location, start_time, end_time, capacity, date, created_at`,
};

// Modern schema without capacity but including 'date'
export const createEventNoCapacityWithDate = {
  name: 'create-event-no-capacity-with-date',
  text: `INSERT INTO events (title, description, location, start_time, end_time, date)
         VALUES ($1, $2, $3, $4, $5, DATE($4))
         RETURNING id, title, description, location, start_time, end_time, date, created_at`,
};

// Legacy: databases with columns named 'start' and 'end'
export const createEventLegacy = {
  name: 'create-event-legacy',
  text: `INSERT INTO events (title, description, location, start, "end", capacity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, created_at`,
};

// Legacy schema without capacity column
export const createEventLegacyNoCapacity = {
  name: 'create-event-legacy-no-capacity',
  text: `INSERT INTO events (title, description, location, start, "end")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, created_at`,
};

// Legacy schema including a 'date' column derived from legacy 'start'
export const createEventLegacyWithDate = {
  name: 'create-event-legacy-with-date',
  text: `INSERT INTO events (title, description, location, start, "end", capacity, date)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4))
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, date, created_at`,
};

// Legacy schema without capacity but including 'date'
export const createEventLegacyNoCapacityWithDate = {
  name: 'create-event-legacy-no-capacity-with-date',
  text: `INSERT INTO events (title, description, location, start, "end", date)
         VALUES ($1, $2, $3, $4, $5, DATE($4))
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, date, created_at`,
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

// Legacy fallback for databases using columns named 'start' and 'end'
export const listEventsLegacy = {
  name: 'list-events-legacy',
  text: `SELECT id, title, location, start AS start_time, "end" AS end_time FROM events ORDER BY start ASC LIMIT $1 OFFSET $2`,
};

export const findEventByTitleAndStart = {
  name: 'find-event-by-title-and-start',
  text: `SELECT id FROM events WHERE LOWER(title) = LOWER($1) AND start_time = $2 LIMIT 1`,
};

export const findEventByTitleAndStartLegacy = {
  name: 'find-event-by-title-and-start-legacy',
  text: `SELECT id FROM events WHERE LOWER(title) = LOWER($1) AND start = $2 LIMIT 1`,
};

export const updateEvent = {
  name: 'update-event',
  text: `UPDATE events SET title = $2, description = $3, location = $4, start_time = $5, end_time = $6, capacity = $7
         WHERE id = $1 RETURNING id`,
};

export const updateEventLegacy = {
  name: 'update-event-legacy',
  text: `UPDATE events SET title = $2, description = $3, location = $4, start = $5, "end" = $6, capacity = $7
         WHERE id = $1 RETURNING id`,
};

export const deleteEvent = {
  name: 'delete-event',
  text: `DELETE FROM events WHERE id = $1 RETURNING id`,
};

export async function createEventTx(client: PoolClient, args: [string, string | null, string | null, Date, Date, number]) {
  // Use SAVEPOINT to try modern columns first; gracefully fallback to legacy
  await client.query('SAVEPOINT create_event_sp');
  try {
    const res = await client.query(createEvent, args);
    await client.query('RELEASE SAVEPOINT create_event_sp');
    return res.rows[0];
  } catch (e: any) {
    const msg = String(e?.message || '');
    const col = String((e as any)?.column || '');
    const missingStartTime = msg.includes('start_time') || col === 'start_time';
    const missingEndTime = msg.includes('end_time') || col === 'end_time';
    const missingCapacity = msg.includes('capacity') || col === 'capacity';
    if (missingCapacity) {
      // Retry modern insert without capacity
      const modernArgs: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      try {
        const rNoCap = await client.query(createEventNoCapacity, modernArgs);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return rNoCap.rows[0];
      } catch (inner: any) {
        // If modern also fails, consider date requirement or legacy fallback
        const innerMsg = String(inner?.message || '');
        const innerCol = String((inner as any)?.column || '');
        const innerMissingStart = innerMsg.includes('start_time') || innerCol === 'start_time';
        const innerMissingEnd = innerMsg.includes('end_time') || innerCol === 'end_time';
        const innerDateNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('date') || innerCol === 'date');
        if (innerDateNotNull) {
          const rNoCapWithDate = await client.query(createEventNoCapacityWithDate, modernArgs);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rNoCapWithDate.rows[0];
        }
        if (innerMissingStart || innerMissingEnd) {
          const legacyArgs: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          const rLegacyNoCap = await client.query(createEventLegacyNoCapacity, legacyArgs);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCap.rows[0];
        }
        throw inner;
      }
    }
    if (missingStartTime || missingEndTime) {
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      try {
        const res = await client.query(createEventLegacy, args);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return res.rows[0];
      } catch (inner: any) {
        const innerMsg = String(inner?.message || '');
        const innerCol = String((inner as any)?.column || '');
        const innerMissingCapacity = innerMsg.includes('capacity') || innerCol === 'capacity';
        const innerDateNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('date') || innerCol === 'date');
        if (innerMissingCapacity) {
          const legacyArgs: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          const rLegacyNoCap = await client.query(createEventLegacyNoCapacity, legacyArgs);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCap.rows[0];
        }
        if (innerDateNotNull) {
          const rLegacyWithDate = await client.query(createEventLegacyWithDate, args);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyWithDate.rows[0];
        }
        throw inner;
      }
    }
    // If modern failed due to NOT NULL date, try modern with date
    const dateNotNull = (e as any)?.code === '23502' && (msg.includes('date') || col === 'date');
    if (dateNotNull) {
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      try {
        const rWithDate = await client.query(createEventWithDate, args);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return rWithDate.rows[0];
      } catch (inner: any) {
        const innerMsg = String(inner?.message || '');
        const innerCol = String((inner as any)?.column || '');
        const innerMissingStart = innerMsg.includes('start_time') || innerCol === 'start_time';
        const innerMissingEnd = innerMsg.includes('end_time') || innerCol === 'end_time';
        const innerMissingCapacity = innerMsg.includes('capacity') || innerCol === 'capacity';
        if (innerMissingStart || innerMissingEnd) {
          const rLegacyWithDate = await client.query(createEventLegacyWithDate, args);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyWithDate.rows[0];
        }
        if (innerMissingCapacity) {
          const legacyArgsNoCap: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          const rLegacyNoCapWithDate = await client.query(createEventLegacyNoCapacityWithDate, legacyArgsNoCap);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCapWithDate.rows[0];
        }
        throw inner;
      }
    }
    throw e;
  }
}

export async function existsDuplicateEvent(client: PoolClient, title: string, start: Date) {
  // Use SAVEPOINT and try modern columns first; fallback to legacy
  await client.query('SAVEPOINT dup_check_sp');
  try {
    const res = await client.query(findEventByTitleAndStart, [title, start]);
    await client.query('RELEASE SAVEPOINT dup_check_sp');
    return !!(res.rowCount && res.rowCount > 0);
  } catch (e: any) {
    const msg = String(e?.message || '');
    const col = String((e as any)?.column || '');
    const missingStartTime = msg.includes('start_time') || col === 'start_time';
    if (missingStartTime) {
      await client.query('ROLLBACK TO SAVEPOINT dup_check_sp');
      const res = await client.query(findEventByTitleAndStartLegacy, [title, start]);
      await client.query('RELEASE SAVEPOINT dup_check_sp');
      return !!(res.rowCount && res.rowCount > 0);
    }
    throw e;
  }
}

/**
 * Detect column presence for robust cross-schema support.
 */
async function hasColumn(client: PoolClient, table: string, column: string): Promise<boolean> {
  const sql = `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1`;
  const r = await client.query(sql, [table, column]);
  return (r.rowCount ?? 0) > 0;
}

/**
 * List events using modern columns if available, otherwise legacy.
 * Avoids try/catch ambiguity by introspecting the schema first.
 */
export async function listEventsTx(client: PoolClient, limit: number, offset: number) {
  // Use a SAVEPOINT to allow fallback without aborting the transaction
  await client.query('SAVEPOINT list_events_sp');
  try {
    const r = await client.query(listEvents, [limit, offset]);
    await client.query('RELEASE SAVEPOINT list_events_sp');
    return r.rows;
  } catch (e: any) {
    const msg = String(e?.message || '');
    if (e?.code === '42703' || msg.includes('start_time') || msg.includes('end_time')) {
      await client.query('ROLLBACK TO SAVEPOINT list_events_sp');
      const r2 = await client.query(listEventsLegacy, [limit, offset]);
      await client.query('RELEASE SAVEPOINT list_events_sp');
      return r2.rows;
    }
    throw e;
  }
}
