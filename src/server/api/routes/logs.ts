import { Router } from 'express';
import type { Request, Response } from 'express';
import { errorLogger } from '../../utils/errorLogger';
import { logger } from '../../../shared/utils/logger';

const router = Router();
const log = logger.withContext('LogsRoute');

router.post('/logs/error', async (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const type = String((body.type as string) || 'Client Error');
    const message = String((body.message as string) || '');
    const stack = typeof body.stack === 'string' ? (body.stack as string) : null;
    const context = (body.context && typeof body.context === 'object') ? (body.context as Record<string, unknown>) : undefined;
    log.error('received_client_error', { type, message, stack, timestamp: new Date().toISOString(), context });
    await errorLogger.logError(type, { message, stack }, context || null);
    return res.status(201).json({ ok: true });
  } catch (e) {
    log.error('logs_route_exception', { message: (e as Error)?.message });
    await errorLogger.logError('Logs Route Error', e, null);
    return res.status(500).json({ error: 'Failed to persist error' });
  }
});

export default router;