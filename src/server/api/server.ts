import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import chatRouter from './routes/chat';
import todosRouter from './routes/todos';
import usersRouter from './routes/users';
import logsRouter from './routes/logs';
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
app.use('/api', logsRouter);

// Create WebSocket server for real-time chat
createWebSocketServer(server);

app.use(async (err: unknown, req: Request, res: Response, next: any) => {
  await errorLogger.logError('Server Error', err, { route: req.originalUrl });
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.API_PORT || 3001);
const onListen = (p: number) => {
  console.log(`[api] Server listening on http://localhost:${p}`);
  console.log(`[websocket] WebSocket server started`);
};

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err && err.code === 'EADDRINUSE') {
    const next = port + 1;
    try {
      server.listen(next, () => onListen(next));
    } catch (e) {
      void errorLogger.logError('Server Listen Error', e, null);
      process.exit(1);
    }
  } else {
    void errorLogger.logError('Server Listen Error', err, null);
    process.exit(1);
  }
});

server.listen(port, () => onListen(port));