import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import chatRouter from './routes/chat';
import todosRouter from './routes/todos';
import usersRouter from './routes/users';
import { createWebSocketServer } from '../websocket/server';
import { errorLogger } from '../utils/errorLogger';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api', chatRouter);
app.use('/api', todosRouter);
app.use('/api/users', usersRouter);

// Create WebSocket server for real-time chat
const wsManager = createWebSocketServer(server);

// Global error handler to persist unhandled errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(async (err: unknown, req: Request, res: Response, _next: any) => {
  await errorLogger.serverError(req.originalUrl, err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.API_PORT || 3001);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] Server listening on http://localhost:${port}`);
  console.log(`[websocket] WebSocket server started`);
});