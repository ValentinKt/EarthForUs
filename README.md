# EarthForUs — Environmental Volunteering Platform

EarthForUs connects environmentally conscious people with local volunteering opportunities. Discover, create, and participate in events such as cleanups, plantings, and conservation activities.

## Overview

- Full‑stack app: React frontend + Node/Express API + PostgreSQL
- Realtime chat via WebSocket
- Interactive maps (Leaflet) for event location and radius selection
- Robust error logging and diagnostics to `ERRORS_LOGS.md`

## Features

### Events
- Create, list, and join environmental events.
- Pages: `EventsPage`, `EventPage`, `CreateEventPage`.

Frontend
- Event creation form with inline validation: title (≤200 chars), valid dates, end after start, capacity > 0.
- Map-assisted location selection with draggable marker and radius slider.
- Duplicate-prevention UX with clear error messages if same title + start time exists.
- Join flow with loading state, idempotent behavior (handles already registered), and success toasts.
- Detail page tabbed UI: About, Updates, Checklist, Chat, Map; list fallback used if detail endpoint unavailable.

Backend
- `GET /api/events` lists events, auto-falling back to legacy columns (`start`/`end`) when `start_time`/`end_time` are missing.
- `POST /api/events` enforces required fields, sanitizes optional text, validates capacity, and requires `organizer_id`.
- Duplicate prevention via title (case-insensitive) + exact start time, using transactional checks.
- `POST /api/events/:id/join` registers users while preventing duplicates and respecting capacity; returns `already_registered` when applicable.
- Cross-schema insert strategy with SAVEPOINT retries to support modern/legacy schemas, optional `date`/`category`, and organizer typing.

### Event Todo Checklist
- Per‑event task list with priorities and due dates.

Frontend
- Create/edit tasks with validation: title required (≤200 chars), optional description (≤1000 chars), priority one of `low|medium|high`.
- Due date input with runtime validation and helpful messages.
- Progress indicator and completion rate; toggle complete/uncomplete with instant UI updates.
- Delete guarded by ownership UI hints; creator-only deletion pathway.

Backend
- `GET /api/events/:eventId/todos` returns items with creator/completer names via JOINs, sorted by priority, due date, and creation.
- `POST /api/events/:eventId/todos` validates payload and inserts with `created_by` attribution.
- `PUT /api/events/:eventId/todos/:todoId` updates core fields and stamps `updated_at`.
- `PATCH /api/events/:eventId/todos/:todoId/complete` flips `is_completed` and sets `completed_by`/`completed_at` accordingly.
- `DELETE /api/events/:eventId/todos/:todoId` requires creator ownership and returns 404 if not found/not owner.
- Trigger maintains `updated_at` consistency on updates.

### Event Chat
- Real‑time chat for each event with REST persistence and WebSocket broadcasting.

Frontend
- Message list with auto‑scroll, optimistic send, and connection status indicator.
- WebSocket join on connect; rejoin with exponential backoff when disconnected.
- Background polling fallback to keep messages fresh when socket is down.
- Input constrained and debounced; friendly errors on send failures.

Backend
- `GET /api/events/:eventId/messages` returns paginated messages with user identity.
- `POST /api/events/:eventId/messages` requires auth, validates non‑empty message, enforces length (≤1000 chars), and persists.
- WebSocket server manages: `join_event`, `leave_event`, `chat_message`, `user_joined`, `user_left`, `system_message` with scoped broadcast per event.
- Defensive checks for invalid event IDs and unauthorized send attempts, with structured logs and error persistence when failures occur.

### Interactive Map
- Leaflet map for selecting event location and radius.

Frontend
- Geocoding via Nominatim with clear error feedback and loading states.
- Draggable marker, click‑to‑set location, and radius slider with real‑time area/km calculations.
- Lat/lng inputs with clamping: latitude (−90..90), longitude (−180..180).
- Accessible labels, live status, and tile error handling; defaults to a sensible city center when no coords.

Backend
- Currently UI‑driven; map fields are captured in create payload but not yet stored server‑side.

### Authentication (Minimal)
- Basic account creation and login; client‑side session state.

Frontend
- `LoginPage` with validation, optional test credential hints, and remember‑me.
- `AuthProvider` stores normalized user in `localStorage` and exposes `login/logout`.
- `ProtectedRoute` redirects unauthenticated users to login with original path preserved.

Backend
- `POST /api/auth/signup` checks uniqueness, hashes password, and returns normalized user profile.
- `POST /api/auth/login` validates credentials and logs invalid attempts; returns normalized user profile.
- Session/token issuance is deferred; client maintains lightweight user state.

### Error Logging & Diagnostics
- Centralized, failure‑resistant error logging across client and server.

Frontend
- Toast `.error()` auto‑reports UI errors with context.
- `ErrorBoundary` captures uncaught render errors and posts them to the server.
- API client reports exceptions with method and URL context.

Backend
- Markdown persistence to `ERRORS_LOGS.md` with `[timestamp] Type`, message, optional stack, and details.
- Thread‑safe write queue prevents race conditions; logging is isolated to avoid secondary failures.
- `/api/logs/error` endpoint accepts structured client reports for unified logging.
- Global Express error handler persists unhandled exceptions with route context.

### Users & Settings
- Manage profile and security settings.

Frontend
- Settings page supports secure password change with strength indicator, inline validation, and show/hide controls.
- Profile fields update with helpful error messages and success toasts.

Backend
- `GET /api/users/:id` returns basic profile.
- `PUT /api/users/:id` updates `first_name`/`last_name` with length and emptiness checks.
- `PUT /api/users/:id/password` verifies current password, enforces min length for new password, and stores a new hash.

## Technology Stack

Frontend
- React 19, React Router 7
- Vite 7, TypeScript
- Tailwind CSS 4
- Leaflet + React‑Leaflet

Backend
- Node.js, Express 5
- `ws` for WebSocket
- PostgreSQL via `pg`
- TypeScript

Tooling
- ESLint, TypeScript ESLint
- Vite preview, `tsx` for dev scripts

## Setup

Prerequisites
- Node.js 18+
- npm 8+
- PostgreSQL (local or Docker)

Install
```bash
npm install
```

Environment
```bash
# Client
VITE_API_BASE=http://localhost:3001/api
VITE_LOG_LEVEL=info

# Server
API_PORT=3001
```

Start
```bash
# Frontend
npm run dev  # http://localhost:5173

# Backend API (port overridable)
API_PORT=3001 npm run api:start  # http://localhost:3001
```

Database (optional for local API)
```bash
# Start Postgres via Docker Compose
npm run db:up

# Apply migrations
npm run db:migrate

# Stop DB
npm run db:down
```

## Scripts

Development
- `npm run dev` — start Vite dev server
- `npm run api:start` — start Express API

Build & Preview
- `npm run build` — typecheck + build frontend
- `npm run preview` — preview production build

Database
- `npm run db:up` — docker compose up
- `npm run db:migrate` — run migrations
- `npm run db:down` — docker compose down

Deploy
- `npm run deploy:dev` — development build and manifest
- `npm run deploy:prod` — production build with security validation

## Project Structure

```
EarthForUs/
├── src/
│   ├── features/            # Pages & feature components
│   ├── shared/              # UI, hooks, utils, theme
│   ├── server/              # Express API, DB, WebSocket
│   └── app/                 # Layout and app shell
├── scripts/                 # Deploy and maintenance scripts
├── public/                  # Static assets
├── dist/                    # Build output
└── ERRORS_LOGS.md           # Error log (markdown)
```

## Quick Reference

Frontend Components

| Area | Component | Path | Purpose |
| --- | --- | --- | --- |
| Landing | `LandingPage` | `src/features/landing/pages/LandingPage.tsx` | Entry hero and CTA navigation |
| Events | `EventsPage` | `src/features/events/pages/EventsPage.tsx` | Browse and join events |
| Events | `EventPage` | `src/features/events/pages/EventPage.tsx` | Event details with tabs |
| Events | `CreateEventPage` | `src/features/events/pages/CreateEventPage.tsx` | Create event with validation and map |
| Events | `EventMap` | `src/features/events/components/EventMap.tsx` | Map, geocoding, radius selection |
| Events | `ChatComponent` | `src/features/events/components/ChatComponent.tsx` | Real‑time event chat UI |
| Events | `TodoListComponent` | `src/features/events/components/TodoListComponent.tsx` | Event checklist UI |
| Auth | `LoginPage` | `src/features/auth/pages/LoginPage.tsx` | Login form and validation |
| Auth | `AuthProvider` | `src/features/auth/context/AuthContext.tsx` | Session state via localStorage |
| Auth | `ProtectedRoute` | `src/features/auth/components/ProtectedRoute.tsx` | Route guard for authenticated pages |
| Shared | `ToastProvider` | `src/shared/components/Toast.tsx` | Notifications and error reporting |
| Shared | `ErrorBoundary` | `src/shared/components/ErrorBoundary.tsx` | Capture uncaught errors |
| App | `Layout` | `src/app/layout/Layout.tsx` | App shell with header/footer |

Backend Endpoints

| Area | Method | Path | Handler |
| --- | --- | --- | --- |
| Health | `GET` | `/api/health` | `src/server/api/server.ts` |
| Auth | `POST` | `/api/auth/signup` | `src/server/api/routes/auth.ts` |
| Auth | `POST` | `/api/auth/login` | `src/server/api/routes/auth.ts` |
| Events | `GET` | `/api/events` | `src/server/api/routes/events.ts` |
| Events | `POST` | `/api/events` | `src/server/api/routes/events.ts` |
| Events | `POST` | `/api/events/:id/join` | `src/server/api/routes/events.ts` |
| Chat | `GET` | `/api/events/:eventId/messages` | `src/server/api/routes/chat.ts` |
| Chat | `POST` | `/api/events/:eventId/messages` | `src/server/api/routes/chat.ts` |
| Todos | `GET` | `/api/events/:eventId/todos` | `src/server/api/routes/todos.ts` |
| Todos | `POST` | `/api/events/:eventId/todos` | `src/server/api/routes/todos.ts` |
| Todos | `PUT` | `/api/events/:eventId/todos/:todoId` | `src/server/api/routes/todos.ts` |
| Todos | `PATCH` | `/api/events/:eventId/todos/:todoId/complete` | `src/server/api/routes/todos.ts` |
| Todos | `DELETE` | `/api/events/:eventId/todos/:todoId` | `src/server/api/routes/todos.ts` |
| Users | `GET` | `/api/users/:id` | `src/server/api/routes/users.ts` |
| Users | `PUT` | `/api/users/:id` | `src/server/api/routes/users.ts` |
| Users | `PUT` | `/api/users/:id/password` | `src/server/api/routes/users.ts` |
| Logs | `POST` | `/api/logs/error` | `src/server/api/routes/logs.ts` |
| WebSocket | `WS` | `ws://localhost:3001` | `src/server/websocket/server.ts` (events: `join_event`, `chat_message`, `user_joined`, `user_left`, `system_message`) |

## API Summary

Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

Events
- `GET /api/events`
- `POST /api/events`
- `POST /api/events/:id/join`

Chat
- `GET /api/events/:eventId/messages`
- `POST /api/events/:eventId/messages`

Todos
- `GET /api/events/:eventId/todos`
- `POST /api/events/:eventId/todos`
- `PUT /api/events/:eventId/todos/:todoId`
- `PATCH /api/events/:eventId/todos/:todoId/complete`
- `DELETE /api/events/:eventId/todos/:todoId`

Diagnostics
- `POST /api/logs/error`

## Deployment

Hostinger (static hosting) workflow is automated via `scripts/deploy.js`.

Development
```bash
npm run deploy:dev
# Upload dist/ to Hostinger
```

Production
```bash
npm run deploy:prod
# Upload dist/, configure environment, verify API
```

Recommended client env (Hostinger)
```bash
VITE_API_BASE=https://your-api-domain.com/api
VITE_LOG_LEVEL=info
```

## Troubleshooting

Build
- Run `npm run build` to surface type errors.
- Ensure `VITE_API_BASE` points to the running API.

API
- Start with `API_PORT=3001 npm run api:start`.
- Check server logs; errors are appended to `ERRORS_LOGS.md`.

Maps
- Confirm network access to OpenStreetMap tiles.
- Verify Leaflet CSS via CDN and map container sizing.

## License

MIT — see `LICENSE`.

---

EarthForUs — Connecting people with the planet 🌱