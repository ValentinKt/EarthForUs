import 'dotenv/config';

type SSLMode = 'disable' | 'require';

export interface DbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  sslMode: SSLMode;
  pool: {
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
    statementTimeoutMillis: number;
  };
}

const env = process.env;

export const dbConfig: DbConfig = {
  connectionString: env.DATABASE_URL,
  host: env.PGHOST,
  port: env.PGPORT ? Number(env.PGPORT) : undefined,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  sslMode: (env.PG_SSL_MODE as SSLMode) || 'disable',
  pool: {
    max: env.PG_POOL_MAX ? Number(env.PG_POOL_MAX) : 10,
    idleTimeoutMillis: env.PG_POOL_IDLE_TIMEOUT_MS ? Number(env.PG_POOL_IDLE_TIMEOUT_MS) : 30_000,
    connectionTimeoutMillis: env.PG_POOL_CONNECTION_TIMEOUT_MS ? Number(env.PG_POOL_CONNECTION_TIMEOUT_MS) : 5_000,
    statementTimeoutMillis: env.PG_STATEMENT_TIMEOUT_MS ? Number(env.PG_STATEMENT_TIMEOUT_MS) : 5_000,
  },
};

export const isProd = process.env.NODE_ENV === 'production';