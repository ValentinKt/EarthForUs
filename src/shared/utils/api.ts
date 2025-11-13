import { logger } from './logger';

export type ApiError = {
  status: number;
  message?: string;
  body?: unknown;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
  json?: boolean; // force JSON parse even if header missing
};

const log = logger.withContext('ApiClient');
const BASE = (import.meta as any)?.env?.VITE_API_BASE || '';

function buildUrl(path: string) {
  if (!path.startsWith('http')) return `${BASE}${path}`;
  return path;
}

function normalizeInit(init: RequestOptions = {}): RequestInit {
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  // If body is plain object and no content-type set, set JSON
  const body = (init as any).body;
  if (body && !(body instanceof FormData)) {
    const hasCt = !!headers.get('Content-Type');
    if (!hasCt) headers.set('Content-Type', 'application/json');
    if (typeof body !== 'string') {
      (init as any).body = JSON.stringify(body);
    }
  }
  return { ...init, headers } as RequestInit;
}

async function parseBody<T>(res: Response, forceJson = false): Promise<T | undefined> {
  if (res.status === 204) return undefined;
  const ct = res.headers.get('content-type') || '';
  const isJson = forceJson || ct.includes('application/json');
  try {
    return isJson ? await res.json() : ((await res.text()) as unknown as T);
  } catch (e) {
    log.warn('parse_failed', { status: res.status, contentType: ct });
    return undefined;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path);
  const method = (options.method || 'GET').toUpperCase();
  const grp = log.group('request');
  const tm = log.time('duration');
  log.info('start', { method, url });
  const init = normalizeInit(options);
  try {
    const res = await fetch(url, init);
    const body = await parseBody<T>(res, !!options.json);
    if (res.ok) {
      log.info('success', { status: res.status });
      return (body as T);
    }
    const err: ApiError = { status: res.status, body };
    log.error('failure', err);
    throw Object.assign(new Error((body as any)?.error || 'Request failed'), err);
  } catch (e) {
    log.error('exception', { message: (e as Error)?.message });
    throw e;
  } finally {
    tm.end();
    grp.end();
  }
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) => request<T>(path, { ...(init || {}), method: 'GET' }),
  post: <T>(path: string, body?: BodyInit | Record<string, unknown> | null, init?: RequestOptions) => request<T>(path, { ...(init || {}), method: 'POST', body }),
  put: <T>(path: string, body?: BodyInit | Record<string, unknown> | null, init?: RequestOptions) => request<T>(path, { ...(init || {}), method: 'PUT', body }),
  del: <T>(path: string, init?: RequestOptions) => request<T>(path, { ...(init || {}), method: 'DELETE' }),
};