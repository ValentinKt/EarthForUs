import { Router } from 'express';
import type { Request, Response } from 'express';
import { pool } from '../../db/pool';
import { getChatMessagesByEvent, createChatMessage } from '../../db/queries/chat';
import { mapPgError } from '../../db/errors';
import { logger } from '../../../shared/utils/logger';
import { errorLogger } from '../../utils/errorLogger';

const router = Router();
const log = logger.withContext('api/chat');

// Get chat messages for an event
router.get('/events/:eventId/messages', async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.eventId);
    const limit = Number(req.query.limit as string) || 50;
    const offset = Number(req.query.offset as string) || 0;
    
    if (!Number.isFinite(eventId) || eventId <= 0) {
      log.warn('invalid_event_id', { eventId: req.params.eventId });
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    log.info('get_chat_messages', { eventId, limit, offset });
    const result = await pool.query(getChatMessagesByEvent, [eventId, limit, offset]);
    
    const messages = result.rows.map(row => ({
      id: row.id,
      message: row.message,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email
      }
    }));

    log.debug('chat_messages_retrieved', { count: messages.length });
    return res.json({ messages, count: messages.length });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('get_chat_messages_error', mapped);
    // Persist error to ERRORS_LOGS.txt
    await errorLogger.chatFailedToLoadMessages(Number(req.params.eventId), mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Send a chat message
router.post('/events/:eventId/messages', async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.eventId);
    const { message } = req.body || {};
    const userId = (req as any).user?.id; // This would come from auth middleware
    
    if (!Number.isFinite(eventId) || eventId <= 0) {
      log.warn('invalid_event_id', { eventId: req.params.eventId });
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      log.warn('invalid_message', { message });
      return res.status(400).json({ error: 'Message is required and cannot be empty' });
    }

    if (!userId) {
      log.warn('unauthorized_chat_attempt');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 1000) {
      log.warn('message_too_long', { length: trimmedMessage.length });
      return res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
    }

    log.info('create_chat_message', { eventId, userId, messageLength: trimmedMessage.length });
    const result = await pool.query(createChatMessage, [eventId, userId, trimmedMessage]);
    
    const newMessage = result.rows[0];
    log.info('chat_message_created', { messageId: newMessage.id });
    
    return res.status(201).json({ 
      message: {
        id: newMessage.id,
        message: newMessage.message,
        createdAt: newMessage.created_at
      }
    });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('create_chat_message_error', mapped);
    // Persist chat message creation errors as well
    await errorLogger.log('Chat Error', 'Failed to create chat message', { eventId: Number(req.params.eventId), details: mapped });
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

export default router;