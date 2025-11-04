import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { withTransaction, pool } from '../../db/pool';
import { createUserTx, getUserByEmailTx } from '../../db/queries/users';
import { mapPgError } from '../../db/errors';
import type { QueryResult } from 'pg';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await withTransaction(async (client) => {
      return getUserByEmailTx(client, email);
    });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await withTransaction(async (client) => {
      return createUserTx(client, email, passwordHash, firstName, lastName);
    });
    return res.status(201).json({ user });
  } catch (err) {
    const mapped = mapPgError(err);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Minimal login endpoint: validates credentials
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    // Fetch password_hash directly to avoid exposing it elsewhere
    const q = `SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1`;
    const result: QueryResult<{ id: number; email: string; password_hash: string; first_name: string; last_name: string; }> = await pool.query(q, [email]);
    const row = result.rows[0];
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = { id: row.id, email: row.email, first_name: row.first_name, last_name: row.last_name };
    return res.json({ user });
  } catch (err) {
    const mapped = mapPgError(err);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

export default router;