type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

const LEVELS: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

function now() {
  return new Date().toISOString();
}

function getDefaultLevel(): LogLevel {
  const fromEnv = (import.meta as any)?.env?.VITE_LOG_LEVEL as LogLevel | undefined;
  const fromStorage = (typeof window !== 'undefined') ? (localStorage.getItem('EFU_DEBUG') === 'true' ? 'debug' : undefined) : undefined;
  if (fromStorage) return fromStorage as LogLevel;
  if (fromEnv && LEVELS[fromEnv] !== undefined) return fromEnv;
  const mode = (import.meta as any)?.env?.MODE;
  return mode === 'development' ? 'debug' : 'warn';
}

let currentLevel: LogLevel = getDefaultLevel();

function shouldLog(level: LogLevel) {
  return LEVELS[level] <= LEVELS[currentLevel];
}

function format(ns: string | undefined, level: LogLevel, msg: string) {
  const prefix = ns ? `[${ns}]` : '';
  return `${now()} ${prefix} ${level.toUpperCase()}: ${msg}`;
}

export const logger = {
  setLevel(level: LogLevel) {
    currentLevel = level;
  },
  getLevel(): LogLevel {
    return currentLevel;
  },
  enableDebug(enable = true) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('EFU_DEBUG', enable ? 'true' : 'false');
    }
    currentLevel = enable ? 'debug' : 'warn';
  },
  debug(msg: string, payload?: unknown, ns?: string) {
    if (!shouldLog('debug')) return;
    console.debug(format(ns, 'debug', msg), payload ?? '');
  },
  info(msg: string, payload?: unknown, ns?: string) {
    if (!shouldLog('info')) return;
    console.info(format(ns, 'info', msg), payload ?? '');
  },
  warn(msg: string, payload?: unknown, ns?: string) {
    if (!shouldLog('warn')) return;
    console.warn(format(ns, 'warn', msg), payload ?? '');
  },
  error(msg: string, payload?: unknown, ns?: string) {
    if (!shouldLog('error')) return;
    console.error(format(ns, 'error', msg), payload ?? '');
  },
  group(title: string, ns?: string, collapsed = true) {
    const header = format(ns, 'info', title);
    if (collapsed) console.groupCollapsed(header);
    else console.group(header);
    return {
      end() { console.groupEnd(); }
    };
  },
  time(label: string, ns?: string) {
    const id = ns ? `${ns}:${label}` : label;
    console.time(id);
    return {
      end() { console.timeEnd(id); }
    };
  },
  withContext(ns: string) {
    return {
      setLevel: this.setLevel,
      getLevel: this.getLevel,
      enableDebug: this.enableDebug,
      debug: (msg: string, payload?: unknown) => this.debug(msg, payload, ns),
      info: (msg: string, payload?: unknown) => this.info(msg, payload, ns),
      warn: (msg: string, payload?: unknown) => this.warn(msg, payload, ns),
      error: (msg: string, payload?: unknown) => this.error(msg, payload, ns),
      group: (title: string, collapsed = true) => this.group(title, ns, collapsed),
      time: (label: string) => this.time(label, ns),
    };
  }
};