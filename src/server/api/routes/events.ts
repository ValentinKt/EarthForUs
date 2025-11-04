import { Router } from 'express';
import type { Request, Response } from 'express';
import { withTransaction, pool } from '../../db/pool';
import { createEventTx, listEvents } from '../../db/queries/events';
import { mapPgError } from '../../db/errors';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Number((req.query.limit as string) || 20);
    const offset = Number((req.query.offset as string) || 0);
    const result = await pool.query(listEvents, [limit, offset]);
    return res.json({ events: result.rows, count: result.rowCount ?? result.rows.length });
  } catch (err) {
    const mapped = mapPgError(err);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, location, start_time, end_time, capacity } = req.body || {};
    if (!title || !start_time || !end_time || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const start = new Date(start_time);
    const end = new Date(end_time);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end time' });
    }
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap <= 0) {
      return res.status(400).json({ error: 'Invalid capacity' });
    }
    const event = await withTransaction(async (client) => {
      return createEventTx(client, [title, description ?? null, location ?? null, start, end, cap]);
    });
    return res.status(201).json({ event });
  } catch (err) {
    const mapped = mapPgError(err);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

export default router;