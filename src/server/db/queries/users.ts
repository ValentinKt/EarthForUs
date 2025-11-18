import type { PoolClient } from 'pg';

export const createUser = {
  name: 'create-user',
  text: `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, first_name, last_name, created_at`,
};

export const createUserWithName = {
  name: 'create-user-with-name',
  text: `INSERT INTO users (email, password_hash, first_name, last_name, name)
         VALUES ($1, $2, $3, $4, $5)
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
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    const resWithName = await client.query(createUserWithName, [email, passwordHash, firstName, lastName, fullName]);
    return resWithName.rows[0];
  } catch (err: any) {
    const code = err?.code;
    if (code === '42703' || code === '23503' || code === '23502') {
      const res = await client.query(createUser, [email, passwordHash, firstName, lastName]);
      return res.rows[0];
    }
    throw err;
  }
}

export async function getUserByEmailTx(client: PoolClient, email: string) {
  const res = await client.query(getUserByEmail, [email]);
  return res.rows[0] || null;
}

export async function updateUserProfileTx(client: PoolClient, id: number, firstName: string, lastName: string) {
  const res = await client.query(updateUserProfile, [id, firstName, lastName]);
  return res.rows[0] || null;
}