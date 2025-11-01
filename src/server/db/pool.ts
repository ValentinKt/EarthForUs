import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import { dbConfig } from '../config/env';

function buildPool(): Pool {
  if (dbConfig.connectionString) {
    return new Pool({
      connectionString: dbConfig.connectionString,
      max: dbConfig.pool.max,
      idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.pool.connectionTimeoutMillis,
      ssl: dbConfig.sslMode === 'require' ? { rejectUnauthorized: true } : undefined,
    });
  }
  return new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    max: dbConfig.pool.max,
    idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.pool.connectionTimeoutMillis,
    ssl: dbConfig.sslMode === 'require' ? { rejectUnauthorized: true } : undefined,
  });
}

export const pool = buildPool();

// Apply per-connection settings when a new client is created
pool.on('connect', (client: PoolClient) => {
  client.query(`SET statement_timeout TO ${dbConfig.pool.statementTimeoutMillis}`)
    .catch(() => {/* ignore */});
});

export async function connectWithRetry(maxRetries = 5, initialDelayMs = 500): Promise<PoolClient> {
  let attempt = 0;
  let delay = initialDelayMs;
  while (true) {
    try {
      const client = await pool.connect();
      return client;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 10_000);
    }
  }
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await connectWithRetry();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {/* ignore */});
    throw err;
  } finally {
    client.release();
  }
}