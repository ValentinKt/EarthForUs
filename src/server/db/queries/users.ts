import type { PoolClient } from 'pg';

export const createUser = {
  name: 'create-user',
  text: `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, first_name, last_name, created_at`,
};

export const getUserByEmail = {
  name: 'get-user-by-email',
  text: `SELECT id, email, first_name, last_name, created_at
         FROM users WHERE email = $1`,
};

export const updateUserPassword = {
  name: 'update-user-password',
  text: `UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING id`,
};

export const updateUserProfile = {
  name: 'update-user-profile',
  text: `UPDATE users SET first_name = $2, last_name = $3 WHERE id = $1
         RETURNING id, email, first_name, last_name, created_at`,
};

export const deleteUser = {
  name: 'delete-user',
  text: `DELETE FROM users WHERE id = $1 RETURNING id`,
};

export async function createUserTx(client: PoolClient, email: string, passwordHash: string, firstName: string, lastName: string) {
  const res = await client.query(createUser, [email, passwordHash, firstName, lastName]);
  return res.rows[0];
}

export async function getUserByEmailTx(client: PoolClient, email: string) {
  const res = await client.query(getUserByEmail, [email]);
  return res.rows[0] || null;
}

export async function updateUserProfileTx(client: PoolClient, id: number, firstName: string, lastName: string) {
  const res = await client.query(updateUserProfile, [id, firstName, lastName]);
  return res.rows[0] || null;
}