import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../../db/pool';
import { updateUserProfileTx } from '../../db/queries/users';
import { mapPgError } from '../../db/errors';
import { logger } from '../../../shared/utils/logger';

const router = Router();
const log = logger.withContext('api/users');

// Get user by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      log.warn('invalid_user_id', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const q = `SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1`;
    const result = await pool.query(q, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const row = result.rows[0];
    return res.json({ user: row });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('get_user_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Update profile fields: first_name, last_name
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName } = req.body || {};
    if (!Number.isFinite(id) || id <= 0) {
      log.warn('invalid_user_id', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (!firstName || !lastName) {
      log.warn('missing_profile_fields', { hasFirstName: !!firstName, hasLastName: !!lastName });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const trimmedFirst = String(firstName).trim();
    const trimmedLast = String(lastName).trim();
    if (trimmedFirst.length === 0 || trimmedLast.length === 0) {
      return res.status(400).json({ error: 'Names cannot be empty' });
    }
    if (trimmedFirst.length > 100 || trimmedLast.length > 100) {
      return res.status(400).json({ error: 'Names are too long (max 100 characters)' });
    }

    log.info('update_user_profile', { id });
    const updated = await withTransaction(async (client) => {
      return updateUserProfileTx(client, id, trimmedFirst, trimmedLast);
    });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: updated });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('update_user_profile_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Change password: verify old password, set new password
router.put('/:id/password', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { oldPassword, newPassword } = req.body || {};
    if (!Number.isFinite(id) || id <= 0) {
      log.warn('invalid_user_id', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (!oldPassword || !newPassword) {
      log.warn('missing_password_fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Fetch current password hash
    const q = `SELECT id, password_hash FROM users WHERE id = $1`;
    const result = await pool.query(q, [id]);
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    const ok = await bcrypt.compare(String(oldPassword), String(row.password_hash));
    if (!ok) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);
    const upd = await pool.query(`UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING id`, [id, newHash]);
    if (upd.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    log.info('password_updated', { id });
    return res.status(204).send();
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('update_user_password_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

export default router;