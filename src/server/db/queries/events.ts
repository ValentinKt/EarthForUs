import type { PoolClient } from 'pg';

export const createEvent = {
  name: 'create-event',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, location, start_time, end_time, capacity, created_at`,
};

// Modern schema with organizer_id (when NOT NULL and present)
export const createEventWithOrganizer = {
  name: 'create-event-with-organizer',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, description, location, start_time, end_time, capacity, created_at`,
};

// Modern schema without capacity column
export const createEventNoCapacity = {
  name: 'create-event-no-capacity',
  text: `INSERT INTO events (title, description, location, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, description, location, start_time, end_time, created_at`,
};

// Modern schema without capacity but with organizer_id
export const createEventNoCapacityWithOrganizer = {
  name: 'create-event-no-capacity-with-organizer',
  text: `INSERT INTO events (title, description, location, start_time, end_time, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, location, start_time, end_time, created_at`,
};

// Modern schema including a NOT NULL 'date' column derived from start_time
export const createEventWithDate = {
  name: 'create-event-with-date',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity, date)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4))
         RETURNING id, title, description, location, start_time, end_time, capacity, date, created_at`,
};

// Modern schema with date and organizer_id
export const createEventWithDateAndOrganizer = {
  name: 'create-event-with-date-and-organizer',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity, date, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4), $7)
         RETURNING id, title, description, location, start_time, end_time, capacity, date, created_at`,
};

// Modern schema without capacity but including 'date'
export const createEventNoCapacityWithDate = {
  name: 'create-event-no-capacity-with-date',
  text: `INSERT INTO events (title, description, location, start_time, end_time, date)
         VALUES ($1, $2, $3, $4, $5, DATE($4))
         RETURNING id, title, description, location, start_time, end_time, date, created_at`,
};

// Modern schema without capacity, with date and organizer_id
export const createEventNoCapacityWithDateAndOrganizer = {
  name: 'create-event-no-capacity-with-date-and-organizer',
  text: `INSERT INTO events (title, description, location, start_time, end_time, date, organizer_id)
         VALUES ($1, $2, $3, $4, $5, DATE($4), $6)
         RETURNING id, title, description, location, start_time, end_time, date, created_at`,
};

// Modern schema: include date and category, with capacity
export const createEventWithDateAndCategory = {
  name: 'create-event-with-date-and-category',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity, date, category)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4), 'other')
         RETURNING id, title, description, location, start_time, end_time, capacity, date, category, created_at`,
};

// Modern schema: date, category, and organizer_id
export const createEventWithDateCategoryAndOrganizer = {
  name: 'create-event-with-date-category-and-organizer',
  text: `INSERT INTO events (title, description, location, start_time, end_time, capacity, date, category, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4), 'other', $7)
         RETURNING id, title, description, location, start_time, end_time, capacity, date, category, created_at`,
};

// Modern schema: include date and category, without capacity
export const createEventNoCapacityWithDateAndCategory = {
  name: 'create-event-no-capacity-with-date-and-category',
  text: `INSERT INTO events (title, description, location, start_time, end_time, date, category)
         VALUES ($1, $2, $3, $4, $5, DATE($4), 'other')
         RETURNING id, title, description, location, start_time, end_time, date, category, created_at`,
};

// Modern schema: no capacity, with date, category, and organizer_id
export const createEventNoCapacityWithDateCategoryAndOrganizer = {
  name: 'create-event-no-capacity-with-date-category-and-organizer',
  text: `INSERT INTO events (title, description, location, start_time, end_time, date, category, organizer_id)
         VALUES ($1, $2, $3, $4, $5, DATE($4), 'other', $6)
         RETURNING id, title, description, location, start_time, end_time, date, category, created_at`,
};

// Legacy: databases with columns named 'start' and 'end'
export const createEventLegacy = {
  name: 'create-event-legacy',
  text: `INSERT INTO events (title, description, location, start, "end", capacity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, created_at`,
};

// Legacy schema with organizer_id
export const createEventLegacyWithOrganizer = {
  name: 'create-event-legacy-with-organizer',
  text: `INSERT INTO events (title, description, location, start, "end", capacity, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, created_at`,
};

// Legacy schema without capacity column
export const createEventLegacyNoCapacity = {
  name: 'create-event-legacy-no-capacity',
  text: `INSERT INTO events (title, description, location, start, "end")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, created_at`,
};

// Legacy schema without capacity, with organizer_id
export const createEventLegacyNoCapacityWithOrganizer = {
  name: 'create-event-legacy-no-capacity-with-organizer',
  text: `INSERT INTO events (title, description, location, start, "end", organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, created_at`,
};

// Legacy schema including a 'date' column derived from legacy 'start'
export const createEventLegacyWithDate = {
  name: 'create-event-legacy-with-date',
  text: `INSERT INTO events (title, description, location, start, "end", capacity, date)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4))
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, date, created_at`,
};

// Legacy schema with date and organizer_id
export const createEventLegacyWithDateAndOrganizer = {
  name: 'create-event-legacy-with-date-and-organizer',
  text: `INSERT INTO events (title, description, location, start, "end", capacity, date, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4), $7)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, date, created_at`,
};

// Legacy schema without capacity but including 'date'
export const createEventLegacyNoCapacityWithDate = {
  name: 'create-event-legacy-no-capacity-with-date',
  text: `INSERT INTO events (title, description, location, start, "end", date)
         VALUES ($1, $2, $3, $4, $5, DATE($4))
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, date, created_at`,
};

// Legacy schema without capacity, with date and organizer_id
export const createEventLegacyNoCapacityWithDateAndOrganizer = {
  name: 'create-event-legacy-no-capacity-with-date-and-organizer',
  text: `INSERT INTO events (title, description, location, start, "end", date, organizer_id)
         VALUES ($1, $2, $3, $4, $5, DATE($4), $6)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, date, created_at`,
};

// Legacy schema: include date and category, with capacity
export const createEventLegacyWithDateAndCategory = {
  name: 'create-event-legacy-with-date-and-category',
  text: `INSERT INTO events (title, description, location, start, "end", capacity, date, category)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4), 'other')
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, date, category, created_at`,
};

// Legacy schema: date, category, and organizer_id
export const createEventLegacyWithDateCategoryAndOrganizer = {
  name: 'create-event-legacy-with-date-category-and-organizer',
  text: `INSERT INTO events (title, description, location, start, "end", capacity, date, category, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, DATE($4), 'other', $7)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, capacity, date, category, created_at`,
};

// Legacy schema: include date and category, without capacity
export const createEventLegacyNoCapacityWithDateAndCategory = {
  name: 'create-event-legacy-no-capacity-with-date-and-category',
  text: `INSERT INTO events (title, description, location, start, "end", date, category)
         VALUES ($1, $2, $3, $4, $5, DATE($4), 'other')
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, date, category, created_at`,
};

// Legacy schema: no capacity, with date, category, and organizer_id
export const createEventLegacyNoCapacityWithDateCategoryAndOrganizer = {
  name: 'create-event-legacy-no-capacity-with-date-category-and-organizer',
  text: `INSERT INTO events (title, description, location, start, "end", date, category, organizer_id)
         VALUES ($1, $2, $3, $4, $5, DATE($4), 'other', $6)
         RETURNING id, title, description, location, start AS start_time, "end" AS end_time, date, category, created_at`,
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

export async function createEventTx(client: PoolClient, args: [string, string | null, string | null, Date, Date, number, string | number]) {
  // Use SAVEPOINT to try modern columns first; gracefully fallback to legacy
  await client.query('SAVEPOINT create_event_sp');
  try {
    const baseArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
    const res = await client.query(createEvent, baseArgs6);
    await client.query('RELEASE SAVEPOINT create_event_sp');
    return res.rows[0];
  } catch (e: any) {
    const msg = String(e?.message || '');
    const col = String((e as any)?.column || '');
    // Debug trace to aid fallback selection during cross-schema inserts
    console.warn('[createEventTx] initial insert failed', { code: (e as any)?.code, col, msg });
    const missingStartTime = msg.includes('start_time') || col === 'start_time';
    const missingEndTime = msg.includes('end_time') || col === 'end_time';
    const missingCapacity = msg.includes('capacity') || col === 'capacity';
    const organizerNotNull = (e as any)?.code === '23502' && (msg.includes('organizer_id') || col === 'organizer_id');
    // Handle category CHECK constraint violations by retrying with explicit category
    const categoryCheckFailed = (e as any)?.code === '23514' && (msg.includes('events_category_check') || msg.toLowerCase().includes('category'));
    if (categoryCheckFailed) {
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      try {
        const baseArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
        const rModernDateCat = await client.query(createEventWithDateAndCategory, baseArgs6);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return rModernDateCat.rows[0];
      } catch (inner2: any) {
        const inner2Msg = String(inner2?.message || '');
        const inner2Col = String((inner2 as any)?.column || '');
        const inner2OrganizerNotNull = (inner2 as any)?.code === '23502' && (inner2Msg.includes('organizer_id') || inner2Col === 'organizer_id');
        const inner2MissingStart = inner2Msg.includes('start_time') || inner2Col === 'start_time';
        const inner2MissingEnd = inner2Msg.includes('end_time') || inner2Col === 'end_time';
        const inner2MissingCapacity = inner2Msg.includes('capacity') || inner2Col === 'capacity';
        if (inner2OrganizerNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const argsWithOrg: [string, string | null, string | null, Date, Date, number, string | number] = [args[0], args[1], args[2], args[3], args[4], args[5], args[6]];
          try {
            const rModernDateCatOrg = await client.query(createEventWithDateCategoryAndOrganizer, argsWithOrg);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rModernDateCatOrg.rows[0];
          } catch (innerOrgErr: any) {
            const iMsg = String(innerOrgErr?.message || '');
            const iCol = String((innerOrgErr as any)?.column || '');
            const invalidUuid = (innerOrgErr as any)?.code === '22P02' && iMsg.toLowerCase().includes('uuid');
            const invalidInteger = (innerOrgErr as any)?.code === '22P02' && iMsg.toLowerCase().includes('integer');
            if (invalidUuid) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rModernDateCatOrgUuid = await client.query(createEventWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], '00000000-0000-0000-0000-000000000001']);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rModernDateCatOrgUuid.rows[0];
            }
            if (invalidInteger) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rModernDateCatOrgInt = await client.query(createEventWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], 1]);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rModernDateCatOrgInt.rows[0];
            }
            throw innerOrgErr;
          }
        }
        if (inner2MissingStart || inner2MissingEnd) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const legacyArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
          const rLegacyDateCat = await client.query(createEventLegacyWithDateAndCategory, legacyArgs6);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyDateCat.rows[0];
        }
        if (inner2MissingCapacity) {
          const legacyArgsNoCap2: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rLegacyNoCapDateCat = await client.query(createEventLegacyNoCapacityWithDateAndCategory, legacyArgsNoCap2);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCapDateCat.rows[0];
        }
        throw inner2;
      }
    }
    if (organizerNotNull) {
      console.warn('[createEventTx] organizer_id NOT NULL on initial insert; retrying with organizer');
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      const argsWithOrganizer: [string, string | null, string | null, Date, Date, number, string | number] = [args[0], args[1], args[2], args[3], args[4], args[5], args[6]];
      try {
        const rWithOrg = await client.query(createEventWithOrganizer, argsWithOrganizer);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return rWithOrg.rows[0];
      } catch (innerOrg: any) {
        const iMsg = String(innerOrg?.message || '');
        const iCol = String((innerOrg as any)?.column || '');
        const iMissingStart = iMsg.includes('start_time') || iCol === 'start_time';
        const iMissingEnd = iMsg.includes('end_time') || iCol === 'end_time';
        const iMissingCapacity = iMsg.includes('capacity') || iCol === 'capacity';
        const invalidOrganizerUuid = (innerOrg as any)?.code === '22P02' && iMsg.toLowerCase().includes('uuid');
        const invalidOrganizerInteger = (innerOrg as any)?.code === '22P02' && iMsg.toLowerCase().includes('integer');
        if (invalidOrganizerUuid) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rWithOrgUuid = await client.query(createEventWithOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], '00000000-0000-0000-0000-000000000001']);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rWithOrgUuid.rows[0];
        }
        if (invalidOrganizerInteger) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rWithOrgInt = await client.query(createEventWithOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], 1]);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rWithOrgInt.rows[0];
        }
        if (iMissingStart || iMissingEnd) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const legacyArgsWithOrg: [string, string | null, string | null, Date, Date, number, number] = [args[0], args[1], args[2], args[3], args[4], args[5], args[6]];
          const rLegacyOrg = await client.query(createEventLegacyWithOrganizer, legacyArgsWithOrg);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyOrg.rows[0];
        }
        if (iMissingCapacity) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          try {
            const rNoCapOrg = await client.query(createEventNoCapacityWithOrganizer, [args[0], args[1], args[2], args[3], args[4], args[6]]);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rNoCapOrg.rows[0];
          } catch (innerOrg2: any) {
            const i2Msg = String(innerOrg2?.message || '');
            const i2Col = String((innerOrg2 as any)?.column || '');
            const invalidOrganizerUuid2 = (innerOrg2 as any)?.code === '22P02' && i2Msg.toLowerCase().includes('uuid');
            const invalidOrganizerInteger2 = (innerOrg2 as any)?.code === '22P02' && i2Msg.toLowerCase().includes('integer');
            if (invalidOrganizerUuid2) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rNoCapOrgUuid = await client.query(createEventNoCapacityWithOrganizer, [args[0], args[1], args[2], args[3], args[4], '00000000-0000-0000-0000-000000000001']);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rNoCapOrgUuid.rows[0];
            }
            if (invalidOrganizerInteger2) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rNoCapOrgInt = await client.query(createEventNoCapacityWithOrganizer, [args[0], args[1], args[2], args[3], args[4], 1]);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rNoCapOrgInt.rows[0];
            }
            const i2MissingStart = i2Msg.includes('start_time') || i2Col === 'start_time';
            const i2MissingEnd = i2Msg.includes('end_time') || i2Col === 'end_time';
            if (i2MissingStart || i2MissingEnd) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const legacyNoCapWithOrg: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[6]];
              const rLegacyNoCapOrg = await client.query(createEventLegacyNoCapacityWithOrganizer, legacyNoCapWithOrg);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rLegacyNoCapOrg.rows[0];
            }
            throw innerOrg2;
          }
        }
        throw innerOrg;
      }
    }
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
        console.warn('[createEventTx] no-cap insert failed', { code: (inner as any)?.code, col: innerCol, msg: innerMsg });
        const innerMissingStart = innerMsg.includes('start_time') || innerCol === 'start_time';
        const innerMissingEnd = innerMsg.includes('end_time') || innerCol === 'end_time';
        const innerDateNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('date') || innerCol === 'date');
        const innerOrganizerNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('organizer_id') || innerCol === 'organizer_id');
        if (innerOrganizerNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const modernNoCapWithOrg: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[6]];
          try {
            const rNoCapOrg = await client.query(createEventNoCapacityWithOrganizer, modernNoCapWithOrg);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rNoCapOrg.rows[0];
          } catch (innerOrg2: any) {
            const i2Msg = String(innerOrg2?.message || '');
            const i2Col = String((innerOrg2 as any)?.column || '');
            const i2MissingStart = i2Msg.includes('start_time') || i2Col === 'start_time';
            const i2MissingEnd = i2Msg.includes('end_time') || i2Col === 'end_time';
            if (i2MissingStart || i2MissingEnd) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const legacyNoCapWithOrg: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[6]];
              const rLegacyNoCapOrg = await client.query(createEventLegacyNoCapacityWithOrganizer, legacyNoCapWithOrg);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rLegacyNoCapOrg.rows[0];
            }
            throw innerOrg2;
          }
        }
        if (innerDateNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          try {
            const rNoCapWithDate = await client.query(createEventNoCapacityWithDate, modernArgs);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rNoCapWithDate.rows[0];
          } catch (inner2: any) {
            const inner2Msg = String(inner2?.message || '');
            const inner2Col = String((inner2 as any)?.column || '');
            const inner2CategoryNotNull = (inner2 as any)?.code === '23502' && (inner2Msg.includes('category') || inner2Col === 'category');
            const inner2OrganizerNotNull = (inner2 as any)?.code === '23502' && (inner2Msg.includes('organizer_id') || inner2Col === 'organizer_id');
        if (inner2OrganizerNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          try {
            const rNoCapDateOrg = await client.query(createEventNoCapacityWithDateAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[6]]);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rNoCapDateOrg.rows[0];
          } catch (innerOrg3: any) {
            const i3Msg = String(innerOrg3?.message || '');
            const i3Col = String((innerOrg3 as any)?.column || '');
            const invalidOrganizerUuid3 = (innerOrg3 as any)?.code === '22P02' && i3Msg.toLowerCase().includes('uuid');
            const invalidOrganizerInteger3 = (innerOrg3 as any)?.code === '22P02' && i3Msg.toLowerCase().includes('integer');
            if (invalidOrganizerUuid3) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rNoCapDateOrgUuid = await client.query(createEventNoCapacityWithDateAndOrganizer, [args[0], args[1], args[2], args[3], args[4], '00000000-0000-0000-0000-000000000001']);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rNoCapDateOrgUuid.rows[0];
            }
            if (invalidOrganizerInteger3) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rNoCapDateOrgInt = await client.query(createEventNoCapacityWithDateAndOrganizer, [args[0], args[1], args[2], args[3], args[4], 1]);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rNoCapDateOrgInt.rows[0];
            }
            throw innerOrg3;
          }
        }
            if (inner2CategoryNotNull) {
              console.warn('[createEventTx] no-cap+date: category NOT NULL; retrying date+category');
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              try {
                const rNoCapDateCat = await client.query(createEventNoCapacityWithDateAndCategory, modernArgs);
                await client.query('RELEASE SAVEPOINT create_event_sp');
                return rNoCapDateCat.rows[0];
              } catch (catOrg: any) {
                const cMsg = String(catOrg?.message || '');
                const cCol = String((catOrg as any)?.column || '');
                const cOrganizerNotNull = (catOrg as any)?.code === '23502' && (cMsg.includes('organizer_id') || cCol === 'organizer_id');
                if (cOrganizerNotNull) {
                  await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
                  try {
                    const rNoCapDateCatOrg = await client.query(createEventNoCapacityWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[6]]);
                    await client.query('RELEASE SAVEPOINT create_event_sp');
                    return rNoCapDateCatOrg.rows[0];
                  } catch (orgTypeErr: any) {
                    const otMsg = String(orgTypeErr?.message || '');
                    const otCol = String((orgTypeErr as any)?.column || '');
                    const invalidOrganizerUuid4 = (orgTypeErr as any)?.code === '22P02' && otMsg.toLowerCase().includes('uuid');
                    const invalidOrganizerInteger4 = (orgTypeErr as any)?.code === '22P02' && otMsg.toLowerCase().includes('integer');
                    if (invalidOrganizerUuid4) {
                      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
                      const rNoCapDateCatOrgUuid = await client.query(createEventNoCapacityWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], '00000000-0000-0000-0000-000000000001']);
                      await client.query('RELEASE SAVEPOINT create_event_sp');
                      return rNoCapDateCatOrgUuid.rows[0];
                    }
                    if (invalidOrganizerInteger4) {
                      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
                      const rNoCapDateCatOrgInt = await client.query(createEventNoCapacityWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], 1]);
                      await client.query('RELEASE SAVEPOINT create_event_sp');
                      return rNoCapDateCatOrgInt.rows[0];
                    }
                    throw orgTypeErr;
                  }
                }
                throw catOrg;
              }
            }
            throw inner2;
          }
        }
        if (innerMissingStart || innerMissingEnd) {
          const legacyArgs: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rLegacyNoCap = await client.query(createEventLegacyNoCapacity, legacyArgs);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCap.rows[0];
        }
        // Category NOT NULL
        const innerCategoryNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('category') || innerCol === 'category');
        if (innerCategoryNotNull) {
          console.warn('[createEventTx] no-cap: category NOT NULL; retrying date+category');
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          try {
            const rNoCapDateCat = await client.query(createEventNoCapacityWithDateAndCategory, modernArgs);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rNoCapDateCat.rows[0];
          } catch (catOrg: any) {
            const cMsg = String(catOrg?.message || '');
            const cCol = String((catOrg as any)?.column || '');
            const cOrganizerNotNull = (catOrg as any)?.code === '23502' && (cMsg.includes('organizer_id') || cCol === 'organizer_id');
            if (cOrganizerNotNull) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              try {
                const rNoCapDateCatOrg = await client.query(createEventNoCapacityWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[6]]);
                await client.query('RELEASE SAVEPOINT create_event_sp');
                return rNoCapDateCatOrg.rows[0];
              } catch (orgTypeErr: any) {
                const otMsg = String(orgTypeErr?.message || '');
                const otCol = String((orgTypeErr as any)?.column || '');
                const invalidOrganizerUuid4 = (orgTypeErr as any)?.code === '22P02' && otMsg.toLowerCase().includes('uuid');
                const invalidOrganizerInteger4 = (orgTypeErr as any)?.code === '22P02' && otMsg.toLowerCase().includes('integer');
                if (invalidOrganizerUuid4) {
                  await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
                  const rNoCapDateCatOrgUuid = await client.query(createEventNoCapacityWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], '00000000-0000-0000-0000-000000000001']);
                  await client.query('RELEASE SAVEPOINT create_event_sp');
                  return rNoCapDateCatOrgUuid.rows[0];
                }
                if (invalidOrganizerInteger4) {
                  await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
                  const rNoCapDateCatOrgInt = await client.query(createEventNoCapacityWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], 1]);
                  await client.query('RELEASE SAVEPOINT create_event_sp');
                  return rNoCapDateCatOrgInt.rows[0];
                }
                throw orgTypeErr;
              }
            }
            throw catOrg;
          }
        }
        throw inner;
      }
    }
    if (missingStartTime || missingEndTime) {
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      try {
        const legacyArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
        const res = await client.query(createEventLegacy, legacyArgs6);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return res.rows[0];
      } catch (inner: any) {
        const innerMsg = String(inner?.message || '');
        const innerCol = String((inner as any)?.column || '');
        const innerMissingCapacity = innerMsg.includes('capacity') || innerCol === 'capacity';
        const innerDateNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('date') || innerCol === 'date');
        const innerCategoryNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('category') || innerCol === 'category');
        const innerOrganizerNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('organizer_id') || innerCol === 'organizer_id');
        if (innerOrganizerNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const legacyArgsWithOrg: [string, string | null, string | null, Date, Date, number, number] = [args[0], args[1], args[2], args[3], args[4], args[5], args[6]];
          const rLegacyOrg = await client.query(createEventLegacyWithOrganizer, legacyArgsWithOrg);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyOrg.rows[0];
        }
        if (innerMissingCapacity) {
          const legacyArgs: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rLegacyNoCap = await client.query(createEventLegacyNoCapacity, legacyArgs);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCap.rows[0];
        }
        if (innerDateNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rLegacyWithDate = await client.query(createEventLegacyWithDate, legacyArgs6);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyWithDate.rows[0];
        }
        if (innerCategoryNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          // Prefer legacy with date and category mixed
          const rLegacyDateCat = await client.query(createEventLegacyWithDateAndCategory, legacyArgs6);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyDateCat.rows[0];
        }
        throw inner;
      }
    }
    // If modern failed due to NOT NULL date, try modern with date
    const dateNotNull = (e as any)?.code === '23502' && (msg.includes('date') || col === 'date');
    if (dateNotNull) {
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      try {
        const baseArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
        const rWithDate = await client.query(createEventWithDate, baseArgs6);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return rWithDate.rows[0];
      } catch (inner: any) {
        const innerMsg = String(inner?.message || '');
        const innerCol = String((inner as any)?.column || '');
        const innerMissingStart = innerMsg.includes('start_time') || innerCol === 'start_time';
        const innerMissingEnd = innerMsg.includes('end_time') || innerCol === 'end_time';
        const innerMissingCapacity = innerMsg.includes('capacity') || innerCol === 'capacity';
        const innerCategoryNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('category') || innerCol === 'category');
        const innerOrganizerNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('organizer_id') || innerCol === 'organizer_id');
        if (innerOrganizerNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const argsWithOrg: [string, string | null, string | null, Date, Date, number, string | number] = [args[0], args[1], args[2], args[3], args[4], args[5], args[6]];
          try {
            const rWithDateOrg = await client.query(createEventWithDateAndOrganizer, argsWithOrg);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rWithDateOrg.rows[0];
          } catch (innerOrgErr: any) {
            const iMsg = String(innerOrgErr?.message || '');
            const iCol = String((innerOrgErr as any)?.column || '');
            const invalidUuid = (innerOrgErr as any)?.code === '22P02' && iMsg.toLowerCase().includes('uuid');
            const invalidInteger = (innerOrgErr as any)?.code === '22P02' && iMsg.toLowerCase().includes('integer');
            if (invalidUuid) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rWithDateOrgUuid = await client.query(createEventWithDateAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], '00000000-0000-0000-0000-000000000001']);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rWithDateOrgUuid.rows[0];
            }
            if (invalidInteger) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rWithDateOrgInt = await client.query(createEventWithDateAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], 1]);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rWithDateOrgInt.rows[0];
            }
            throw innerOrgErr;
          }
        }
        if (innerMissingStart || innerMissingEnd) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const legacyArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
          const rLegacyWithDate = await client.query(createEventLegacyWithDate, legacyArgs6);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyWithDate.rows[0];
        }
        if (innerMissingCapacity) {
          const legacyArgsNoCap: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rLegacyNoCapWithDate = await client.query(createEventLegacyNoCapacityWithDate, legacyArgsNoCap);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCapWithDate.rows[0];
        }
        if (innerCategoryNotNull) {
          // Try modern with date and category first
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          try {
            const baseArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
            const rModernDateCat = await client.query(createEventWithDateAndCategory, baseArgs6);
            await client.query('RELEASE SAVEPOINT create_event_sp');
            return rModernDateCat.rows[0];
          } catch (inner2: any) {
            const inner2Msg = String(inner2?.message || '');
            const inner2Col = String((inner2 as any)?.column || '');
            const inner2MissingStart = inner2Msg.includes('start_time') || inner2Col === 'start_time';
            const inner2MissingEnd = inner2Msg.includes('end_time') || inner2Col === 'end_time';
            const inner2MissingCapacity = inner2Msg.includes('capacity') || inner2Col === 'capacity';
            const inner2OrganizerNotNull = (inner2 as any)?.code === '23502' && (inner2Msg.includes('organizer_id') || inner2Col === 'organizer_id');
            if (inner2OrganizerNotNull) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const argsWithOrg: [string, string | null, string | null, Date, Date, number, string | number] = [args[0], args[1], args[2], args[3], args[4], args[5], args[6]];
              try {
                const rModernDateCatOrg = await client.query(createEventWithDateCategoryAndOrganizer, argsWithOrg);
                await client.query('RELEASE SAVEPOINT create_event_sp');
                return rModernDateCatOrg.rows[0];
              } catch (innerOrgErr: any) {
                const iMsg = String(innerOrgErr?.message || '');
                const iCol = String((innerOrgErr as any)?.column || '');
                const invalidUuid = (innerOrgErr as any)?.code === '22P02' && iMsg.toLowerCase().includes('uuid');
                const invalidInteger = (innerOrgErr as any)?.code === '22P02' && iMsg.toLowerCase().includes('integer');
                if (invalidUuid) {
                  await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
                  const rModernDateCatOrgUuid = await client.query(createEventWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], '00000000-0000-0000-0000-000000000001']);
                  await client.query('RELEASE SAVEPOINT create_event_sp');
                  return rModernDateCatOrgUuid.rows[0];
                }
                if (invalidInteger) {
                  await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
                  const rModernDateCatOrgInt = await client.query(createEventWithDateCategoryAndOrganizer, [args[0], args[1], args[2], args[3], args[4], args[5], 1]);
                  await client.query('RELEASE SAVEPOINT create_event_sp');
                  return rModernDateCatOrgInt.rows[0];
                }
                throw innerOrgErr;
              }
            }
            if (inner2MissingStart || inner2MissingEnd) {
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const legacyArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
              const rLegacyDateCat = await client.query(createEventLegacyWithDateAndCategory, legacyArgs6);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rLegacyDateCat.rows[0];
            }
            if (inner2MissingCapacity) {
              const legacyArgsNoCap2: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
              await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
              const rLegacyNoCapDateCat = await client.query(createEventLegacyNoCapacityWithDateAndCategory, legacyArgsNoCap2);
              await client.query('RELEASE SAVEPOINT create_event_sp');
              return rLegacyNoCapDateCat.rows[0];
            }
            throw inner2;
          }
        }
        throw inner;
      }
    }

    // Category NOT NULL on initial modern attempt
    const categoryNotNull = (e as any)?.code === '23502' && (msg.includes('category') || col === 'category');
    if (categoryNotNull) {
      console.warn('[createEventTx] category NOT NULL detected; retrying with date+category');
      await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
      try {
        const baseArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
        const rModernDateCat = await client.query(createEventWithDateAndCategory, baseArgs6);
        await client.query('RELEASE SAVEPOINT create_event_sp');
        return rModernDateCat.rows[0];
      } catch (inner: any) {
        const innerMsg = String(inner?.message || '');
        const innerCol = String((inner as any)?.column || '');
        const innerMissingStart = innerMsg.includes('start_time') || innerCol === 'start_time';
        const innerMissingEnd = innerMsg.includes('end_time') || innerCol === 'end_time';
        const innerMissingCapacity = innerMsg.includes('capacity') || innerCol === 'capacity';
        const innerOrganizerNotNull = (inner as any)?.code === '23502' && (innerMsg.includes('organizer_id') || innerCol === 'organizer_id');
        if (innerOrganizerNotNull) {
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const argsWithOrg: [string, string | null, string | null, Date, Date, number, number] = [args[0], args[1], args[2], args[3], args[4], args[5], args[6]];
          const rModernDateCatOrg = await client.query(createEventWithDateCategoryAndOrganizer, argsWithOrg);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rModernDateCatOrg.rows[0];
        }
        if (innerMissingStart || innerMissingEnd) {
          console.warn('[createEventTx] category branch: missing start/end; retry legacy with date+category');
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const legacyArgs6: [string, string | null, string | null, Date, Date, number] = [args[0], args[1], args[2], args[3], args[4], args[5]];
          const rLegacyDateCat = await client.query(createEventLegacyWithDateAndCategory, legacyArgs6);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyDateCat.rows[0];
        }
        if (innerMissingCapacity) {
          console.warn('[createEventTx] category branch: missing capacity; retry legacy no-cap with date+category');
          const legacyArgsNoCap: [string, string | null, string | null, Date, Date] = [args[0], args[1], args[2], args[3], args[4]];
          await client.query('ROLLBACK TO SAVEPOINT create_event_sp');
          const rLegacyNoCapDateCat = await client.query(createEventLegacyNoCapacityWithDateAndCategory, legacyArgsNoCap);
          await client.query('RELEASE SAVEPOINT create_event_sp');
          return rLegacyNoCapDateCat.rows[0];
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
