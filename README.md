# EarthForUs – PostgreSQL Integration

This project now includes a secure, maintainable PostgreSQL integration aligned with best practices.

Key features
- Secure connection handling via environment variables (`.env` file)
- Connection pooling with timeouts and exponential backoff on connect
- Transaction helpers for data integrity
- Schema migrations with tracked history (`_migrations` table)
- Prepared statements for common CRUD operations

Getting started
1. Copy `.env.example` to `.env` and edit values:
   - `DATABASE_URL` (recommended) or discrete `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
   - Tweak pooling and timeout values as needed
2. Start PostgreSQL locally (Docker recommended):
   - `npm run db:up` to launch `postgres:16` via Docker Compose
3. Apply migrations:
   - `npm run db:migrate`
4. Run the demo script (connects, creates sample data, and runs a transaction):
   - `npm run server:demo`

Project structure additions
- `src/server/config/env.ts`: Loads env and exposes typed DB config
- `src/server/db/pool.ts`: Pooled connections, SSL mode, backoff, transaction helper
- `src/server/db/errors.ts`: Normalizes Pg error codes to typed errors
- `src/server/db/migrations/001_init.sql`: Tables, indexes, FKs, migrations table
- `src/server/db/queries/*`: Prepared statements and helpers for users, events, registrations
- `scripts/migrate.ts`: Applies SQL migrations in order within a transaction
- `docker-compose.yml`: Local Postgres with persistent volume

Security & performance notes
- Use strong credentials and prefer `DATABASE_URL` in production
- Set `PG_SSL_MODE=require` when deploying to providers that enforce SSL
- Tune pool settings (`PG_POOL_MAX`, timeouts) per deployment
- All queries are parameterized to prevent SQL injection
- Unique constraints and foreign keys enforce data integrity by design
