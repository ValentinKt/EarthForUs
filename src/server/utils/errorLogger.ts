import fs from 'fs';
import path from 'path';

const LOG_FILE = path.resolve(process.cwd(), 'ERRORS_LOGS.txt');

function ensureLogFile() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, '', { encoding: 'utf8' });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[errorLogger] Failed to ensure log file', e);
  }
}

function formatEntry(category: string, message: string, details?: unknown) {
  const ts = new Date().toISOString();
  const lines: string[] = [];
  lines.push(`[${ts}] ${category}`);
  lines.push(message);
  if (details) {
    try {
      const json = typeof details === 'string' ? details : JSON.stringify(details);
      lines.push(`Details: ${json}`);
    } catch {
      // best-effort only
    }
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

export const errorLogger = {
  async log(category: string, message: string, details?: unknown) {
    ensureLogFile();
    const entry = formatEntry(category, message, details);
    try {
      await fs.promises.appendFile(LOG_FILE, entry, { encoding: 'utf8' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[errorLogger] Failed to write log', e);
    }
  },
  // Convenience helpers for common categories/messages
  async chatFailedToLoadMessages(eventId: number, details?: unknown) {
    await this.log('Chat Error', 'Failed to load chat messages', { eventId, ...(details as object) });
  },
  async chatDisconnected(details?: unknown) {
    await this.log('Connection', 'Disconnected from real-time chat', details);
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