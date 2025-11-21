const fs = require('fs');
const path = require('path');

const LOG_FILE = '/Users/valentin/Documents/trae_projects/EarthForUs/ERRORS_LOGS.md';

let writeQueue: Promise<void> = Promise.resolve();

function ensureLogFile() {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, '', { encoding: 'utf8' });
    }
  } catch (e) {
    console.error('[errorLogger] ensureLogFile', e);
  }
}

function sanitize(value: unknown) {
  try {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message;
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatMarkdownEntry(input: {
  type: string;
  message: string;
  stack?: string | null;
  timestamp: string;
  context?: Record<string, unknown> | null;
}) {
  const lines: string[] = [];
  lines.push(`[${input.timestamp}] ${input.type}`);
  lines.push(input.message);
  if (input.stack) lines.push(`Stack: ${input.stack}`);
  if (input.context && Object.keys(input.context).length > 0) {
    lines.push(`Details: ${sanitize(input.context)}`);
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

async function append(entry: string) {
  ensureLogFile();
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.promises.appendFile(LOG_FILE, entry, { encoding: 'utf8' });
    } catch (e) {
      console.error('[errorLogger] append', e);
    }
  });
  return writeQueue;
}

export const errorLogger = {
  async log(category: string, message: string, details?: unknown) {
    const payload = {
      type: category,
      message,
      stack: null as string | null,
      timestamp: new Date().toISOString(),
      context: (details as Record<string, unknown>) || null
    };
    const entry = formatMarkdownEntry(payload);
    await append(entry);
  },
  async logError(name: string, error: unknown, context?: Record<string, unknown> | null) {
    const message = error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : sanitize(error);
    const stack = error instanceof Error && typeof error.stack === 'string' ? error.stack : null;
    const payload = {
      type: name,
      message,
      stack,
      timestamp: new Date().toISOString(),
      context: context || null
    };
    const entry = formatMarkdownEntry(payload);
    await append(entry);
  },
  async chatFailedToLoadMessages(eventId: number, details?: unknown) {
    await this.log('Chat Error', 'Failed to load chat messages', { eventId, ...(details as object) });
  },
  async chatDisconnected(details?: unknown) {
    const isNormalDisconnection = details && typeof details === 'object' && 'isNormalDisconnection' in details && details.isNormalDisconnection === true;
    const message = isNormalDisconnection ? 'Disconnected from real-time chat' : 'Abnormal disconnection from real-time chat';
    const type = isNormalDisconnection ? 'Connection' : 'Connection Error';
    await this.log(type, message, details);
  },
  async checklistFailedToLoad(eventId: number, details?: unknown) {
    await this.log('Checklist Error', 'Failed to load todo items', { eventId, ...(details as object) });
  },
  async authLoginError(email: string, details?: unknown) {
    await this.log('Auth Error', 'Invalid credentials', { email, ...(details as object) });
  },
  async authSignupError(email: string, details?: unknown) {
    await this.log('Auth Error', 'Signup failed', { email, ...(details as object) });
  },
  async serverError(route: string, details?: unknown) {
    await this.log('Server Error', 'Unhandled server error', { route, ...(details as object) });
  }
};