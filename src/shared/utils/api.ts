import { logger } from './logger';
import { report } from './errorReporter';

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
const BASE = 'http://localhost:3002';

function buildUrl(path: string) {
  if (!path.startsWith('http')) return `${BASE}${path}`;
  return path;
}

function normalizeInit(init: RequestOptions = {}): RequestInit {
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  const body = init.body;
  let nextBody: BodyInit | null | undefined = body as BodyInit | null | undefined;
  if (body && !(body instanceof FormData)) {
    const hasCt = !!headers.get('Content-Type');
    if (!hasCt) headers.set('Content-Type', 'application/json');
    nextBody = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const next: RequestInit = { ...init, headers, body: nextBody };
  return next;
}

async function parseBody<T>(res: Response, forceJson = false): Promise<T | undefined> {
  if (res.status === 204) return undefined;
  const ct = res.headers.get('content-type') || '';
  const isJson = forceJson || ct.includes('application/json');
  try {
    if (isJson) {
      return await res.json();
    }
    const txt = await res.text();
    const trimmed = txt.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed) as T;
      } catch (err) {
        log.debug('text_json_parse_failed', { error: err });
      }
    }
    return txt as unknown as T;
  } catch (e) {
    log.warn('parse_failed', { status: res.status, contentType: ct, error: e });
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
      return body as T;
    }
    const err: ApiError = { status: res.status, body };
    log.error('failure', err);
    const msg = typeof body === 'object' && body !== null && 'error' in (body as Record<string, unknown>)
      ? String((body as Record<string, unknown>).error)
      : 'Request failed';
    throw Object.assign(new Error(msg), err);
  } catch (e) {
    log.error('exception', { message: (e as Error)?.message });
    report(e, 'API Error', { method, url });
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