import { logger } from './logger';

const log = logger.withContext('ErrorReporter');
const BASE = String(((import.meta as unknown as { env?: Record<string, unknown> })?.env?.VITE_API_BASE) || '');

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
  const message = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : String(error);
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