[EarthForUs Error Logs]
Date: 2025-11-18

Migration errors:
- [migrate] Applying 001_init.sql...
- Error: foreign key constraint "registrations_user_id_fkey" cannot be implemented
- Code: 42804
- Detail: Key columns "user_id" and "id" are of incompatible types: bigint and uuid.

- [migrate] Skipping already applied 001_init.sql
- [migrate] Applying 002_add_user_names.sql... Applied
- [migrate] Applying 002_chat_and_todos.sql...
- Error: foreign key constraint "event_chat_messages_event_id_fkey" cannot be implemented
- Code: 42804
- Detail: Key columns "event_id" and "id" are of incompatible types: bigint and uuid.

Signup error (HTTP):
- Endpoint: POST http://localhost:3001/api/auth/signup
- Response: {"error":"null value in column \"name\" of relation \"users\" violates not-null constraint","code":"23502"}
- Status: HTTP 500

Login issue (reported):
- Email: john.doe@test.fr
- Password: Azerty123!*
- Outcome: Invalid credentials

Auth test success:
- Script: scripts/test_auth_flow.ts
- Result: PASS: signup + login bcrypt compare works
- Example user: john.doe.test+1763497553778@example.com
API server (dev):
- Instance: http://localhost:3003
- Signup test: HTTP 201 with created user payload
- Example email: valentin.signup.test+1763496595@example.com

Notes:
- Live DB uses uuid for `users.id`; some legacy migrations expect bigint.
- `users` table had `name` NOT NULL; now backfilled and enforced first_name/last_name.
- login route validates via bcrypt compare against `password_hash`.

Next steps:
- Adjust remaining migrations to uuid or mark as applied.
- Add HTTP integration tests for /api/auth/signup and /api/auth/login.
- Verify john.doe@test.fr login via API after restart.
[2025-11-18T20:54:30.626Z] Chat Error
Failed to load chat messages
Details: {"eventId":1,"reason":"relation_missing_or_fk_mismatch"}
---
[2025-11-18T20:54:30.628Z] Connection
Disconnected from real-time chat
Details: {"clientId":"sample-client","totalClients":0}
---
[2025-11-18T20:54:30.628Z] Checklist Error
Failed to load todo items
Details: {"eventId":1,"reason":"relation_missing_or_fk_mismatch"}
---
[2025-11-18T20:54:30.628Z] Auth Error
Invalid credentials
Details: {"email":"john.doe@test.fr","reason":"password_mismatch"}
---
[2025-11-18T20:54:30.628Z] Server Error
Unhandled server error
Details: {"route":"/api/health","reason":"sample_unhandled_error"}
---
[2025-11-18T20:54:30.628Z] Event Error
Failed to load event detail
Details: {"eventId":1,"reason":"not_implemented_or_schema_mismatch"}
---
[2025-11-19T13:35:56.127Z] Event Error
Organizer ID is required for event creation
Details: {"title":"Paris garden cleanup title","start_time":"2025-11-20T13:35:00.000Z"}
---
[2025-11-19T13:48:24.592Z] Connection
Disconnected from real-time chat
Details: {"clientId":"client_1763560104583_sklkeysb3","totalClients":0}
---
[2025-11-19T13:49:19.470Z] Connection
Disconnected from real-time chat
Details: {"clientId":"client_1763560104594_332t84cbj","totalClients":0}
---
[2025-11-19T14:04:00.580Z] Event Error
Failed to join event
Details: {"code":"25P02","name":"DbError"}
---
[2025-11-19T14:04:30.728Z] Event Error
Failed to join event
Details: {"code":"42703","name":"DbError"}
---
[2025-11-19T14:05:01.537Z] Event Error
Failed to join event
Details: {"code":"42P01","name":"DbError"}
---
[2025-11-19T15:13:17.819Z] WebSocket Server Error
listen EADDRINUSE: address already in use :::3001
Stack: Error: listen EADDRINUSE: address already in use :::3001
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
    at listenInCluster (node:net:1997:12)
    at Server.listen (node:net:2102:7)
    at <anonymous> (/Users/valentin/Documents/trae_projects/EarthForUs/src/server/api/server.ts:45:8)
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:647:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
---
[2025-11-19T15:14:01.833Z] Test Error
Simulated error
Stack: Error: Simulated error
    at [eval]:25:48
Details: {"origin":"verification","id":123}
---
[2025-11-20T08:35:05.101Z] Chat Error
Failed to load chat messages
Details: {"eventId":1,"code":"42P01","name":"DbError"}
---
[2025-11-20T08:36:02.656Z] Checklist Error
Failed to load todo items
Details: {"eventId":1,"code":"42P01","name":"DbError"}
---
[2025-11-20T08:36:21.846Z] Test Error
{"message":"This is a test error","stack":null}
Details: {"test":true}
---
