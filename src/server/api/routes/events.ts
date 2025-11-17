import { Router } from 'express';
import type { Request, Response } from 'express';
import { withTransaction, pool } from '../../db/pool';
import { createEventTx, listEvents, listEventsLegacy, existsDuplicateEvent } from '../../db/queries/events';
import { mapPgError } from '../../db/errors';
import { logger } from '../../../shared/utils/logger';

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
    log.error('list_events_error', mapped);
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

    log.info('create_event_request', { title, location, start_time, end_time, capacity: cap });
    const event = await withTransaction(async (client) => {
      return createEventTx(client, [title, description, location, start, end, cap]);
    });
    log.info('create_event_success', { id: (event as any)?.id ?? 'unknown' });
    return res.status(201).json({ event });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('create_event_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

export default router;