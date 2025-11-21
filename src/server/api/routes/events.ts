import { Router } from 'express';
import type { Request, Response } from 'express';
import { withTransaction, pool } from '../../db/pool';
import { createEventTx, listEvents, listEventsLegacy, existsDuplicateEvent, getEventById } from '../../db/queries/events';
import { registerTx } from '../../db/queries/registrations';
import { mapPgError } from '../../db/errors';
import { logger } from '../../../shared/utils/logger';
import { errorLogger } from '../../utils/errorLogger';

const router = Router();
const log = logger.withContext('api/events');

router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Number((req.query.limit as string) || 20);
    const offset = Number((req.query.offset as string) || 0);
    log.info('list_events_request', { limit, offset });
    // Try modern columns first; fall back to legacy on unknown column errors
    let result;
    try {
      result = await pool.query(listEvents, [limit, offset]);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (err?.code === '42703' && (msg.includes('start_time') || msg.includes('end_time'))) {
        result = await pool.query(listEventsLegacy, [limit, offset]);
      } else {
        throw err;
      }
    }
    log.debug('list_events_response', { count: result.rowCount ?? result.rows.length });
    return res.json({ events: result.rows, count: result.rowCount ?? result.rows.length });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('list_events_error', { message: mapped.message, code: mapped.code, name: mapped.name, stack: mapped.stack, timestamp: new Date().toISOString() });
    await errorLogger.logError('Event Error', err, { message: mapped.message, code: mapped.code, name: mapped.name, stack: mapped.stack });
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, start_time, end_time, capacity } = req.body || {};
    // Default optional text fields to empty strings to satisfy NOT NULL constraints across schema variants
    const description: string = (req.body?.description ?? '').toString();
    const location: string = (req.body?.location ?? '').toString();
    if (!title || !start_time || !end_time || !capacity) {
      log.warn('validation_failed_missing', { title: !!title, start_time: !!start_time, end_time: !!end_time, capacity: !!capacity });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const start = new Date(start_time);
    const end = new Date(end_time);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      log.warn('validation_failed_invalid_dates', { start_time, end_time });
      return res.status(400).json({ error: 'Invalid start or end time' });
    }
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap <= 0) {
      log.warn('validation_failed_invalid_capacity', { capacity });
      return res.status(400).json({ error: 'Invalid capacity' });
    }

    // Duplicate prevention: same title (case-insensitive) and exact start time
    const isDuplicate = await withTransaction(async (client) => {
      return existsDuplicateEvent(client, title, start);
    });
    if (isDuplicate) {
      log.warn('create_event_duplicate', { title, start_time });
      return res.status(409).json({ error: 'An event with the same title and start time already exists' });
    }

    // Determine organizer ID: prefer authenticated user, then body. Require a valid existing organizer.
    const organizerCandidate: string | number | undefined = (req as any).user?.id ?? req.body?.organizer_id;
    if (!organizerCandidate) {
      log.warn('create_event_missing_organizer');
      await errorLogger.logError('Event Error', new Error('Organizer ID is required for event creation'), { title, start_time });
      return res.status(400).json({ error: 'Organizer ID is required' });
    }
    const organizerId: string | number = organizerCandidate;
    log.info('create_event_request', { title, location, start_time, end_time, capacity: cap, organizer_id: organizerId });
    const event = await withTransaction(async (client) => {
      return createEventTx(client, [title, description, location, start, end, cap, organizerId]);
    });
    log.info('create_event_success', { id: (event as any)?.id ?? 'unknown' });
    return res.status(201).json({ event });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('create_event_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const eventIdRaw = req.params.id;
    const eventId: string | number = (() => {
      const n = Number(eventIdRaw);
      return Number.isFinite(n) && n > 0 ? n : eventIdRaw;
    })();
    if (!eventIdRaw) {
      log.warn('get_event_invalid_id', { id: eventIdRaw });
      return res.status(400).json({ error: 'Invalid event id' });
    }
    
    log.info('get_event_request', { eventId });
    
    // Try modern columns first; fall back to legacy on unknown column errors
    let result;
    try {
      result = await pool.query(getEventById, [eventId]);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (err?.code === '42703') {
        // Handle missing columns by trying different schema variations
        if (msg.includes('start_time') || msg.includes('end_time')) {
          // Legacy schema with start/end columns
          const legacyQuery = {
            name: 'get-event-by-id-legacy',
            text: `SELECT id, title, description, location, start AS start_time, "end" AS end_time, capacity, created_at
                   FROM events WHERE id = $1`,
          };
          result = await pool.query(legacyQuery, [eventId]);
        } else if (msg.includes('capacity')) {
          // Modern schema without capacity column
          const noCapacityQuery = {
            name: 'get-event-by-id-no-capacity',
            text: `SELECT id, title, description, location, start_time, end_time, created_at
                   FROM events WHERE id = $1`,
          };
          result = await pool.query(noCapacityQuery, [eventId]);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
    
    if (!result.rows || result.rows.length === 0) {
      log.warn('get_event_not_found', { eventId });
      return res.status(404).json({ error: 'Event not found' });
    }
    
    log.info('get_event_success', { eventId });
    return res.json({ event: result.rows[0] });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('get_event_error', { message: mapped.message, code: mapped.code, name: mapped.name, stack: mapped.stack, timestamp: new Date().toISOString() });
    await errorLogger.logError('Event Error', err, { message: mapped.message, code: mapped.code, name: mapped.name, stack: mapped.stack });
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

router.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const eventIdRaw = req.params.id;
    const eventId: string | number = (() => {
      const n = Number(eventIdRaw);
      return Number.isFinite(n) && n > 0 ? n : eventIdRaw;
    })();
    if (!eventIdRaw) {
      log.warn('join_event_invalid_id', { id: eventIdRaw });
      return res.status(400).json({ error: 'Invalid event id' });
    }
    const userCandidate: string | number | undefined = (req as any).user?.id ?? (req.body?.user_id as any);
    if (!userCandidate) {
      log.warn('join_event_missing_user', { eventId });
      await errorLogger.log('Event Error', 'User ID is required to join event', { eventId });
      return res.status(401).json({ error: 'User authentication required' });
    }
    const registration = await withTransaction(async (client) => {
      return registerTx(client, userCandidate, eventId);
    });
    if (!registration) {
      log.info('join_event_already_registered', { eventId, user_id: userCandidate });
      return res.status(200).json({ status: 'already_registered' });
    }
    log.info('join_event_success', { eventId, user_id: userCandidate, registration_id: registration.id });
    return res.status(201).json({ registration });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('join_event_error', { message: mapped.message, code: mapped.code, name: mapped.name, stack: mapped.stack, timestamp: new Date().toISOString() });
    await errorLogger.logError('Event Error', err, { message: mapped.message, code: mapped.code, name: mapped.name, stack: mapped.stack });
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

export default router;