import { logger } from './logger';

const log = logger.withContext('ErrorReporter');
const BASE = String((typeof process !== 'undefined' && process.env?.VITE_API_BASE) || '');

function buildUrl(path: string) {
  return path.startsWith('http') ? path : `${BASE}${path}`;
}

function getContext(extra?: Record<string, unknown>) {
  const path = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
  const userAgent = typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent : '';
  const ctx: Record<string, unknown> = { path, userAgent };
  if (extra) Object.assign(ctx, extra);
  return ctx;
}

export async function report(error: unknown, type = 'Client Error', extra?: Record<string, unknown>) {
  let message: string;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && error !== null) {
    // Handle objects properly - try to extract meaningful information
    try {
      message = JSON.stringify(error, null, 2);
    } catch {
      message = String(error);
    }
  } else {
    message = String(error);
  }
  
  const stack = error instanceof Error && typeof error.stack === 'string' ? error.stack : null;
  const payload = {
    type,
    message,
    stack,
    timestamp: new Date().toISOString(),
    context: getContext(extra)
  };
  try {
    log.error('captured', payload);
    const url = buildUrl('/api/logs/error');
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    log.error('report_failed', { message: (err as Error)?.message });
  }
}