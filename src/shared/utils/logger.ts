type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

const LEVELS: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

// Enhanced environment detection for deployment context
function getEnvironmentContext(): { environment: string; isProduction: boolean; isDevelopment: boolean } {
  const nodeEnv = (typeof process !== 'undefined' && process.env?.NODE_ENV) || 
                 (import.meta as any)?.env?.MODE || 
                 'development';
  
  const environment = nodeEnv.toUpperCase();
  const isProduction = environment === 'PRODUCTION' || environment === 'PROD';
  const isDevelopment = environment === 'DEVELOPMENT' || environment === 'DEV' || environment === 'development';
  
  return { environment, isProduction, isDevelopment };
}

function now() {
  const timestamp = new Date().toISOString();
  const { environment } = getEnvironmentContext();
  return `[${environment}] ${timestamp}`;
}

function getDefaultLevel(): LogLevel {
  const fromEnv = (import.meta as any)?.env?.VITE_LOG_LEVEL as LogLevel | undefined;
  const { isProduction } = getEnvironmentContext();
  const hasLocalStorage = typeof (globalThis as any).localStorage !== 'undefined';
  const fromStorage = hasLocalStorage ? (((globalThis as any).localStorage.getItem('EFU_DEBUG') === 'true') ? 'debug' : undefined) : undefined;
  if (fromStorage) return fromStorage as LogLevel;
  if (fromEnv && LEVELS[fromEnv] !== undefined) return fromEnv;
  return isProduction ? 'warn' : 'debug';
}

let currentLevel: LogLevel = getDefaultLevel();

function shouldLog(level: LogLevel) {
  return LEVELS[level] <= LEVELS[currentLevel];
}

function format(ns: string | undefined, level: LogLevel, msg: string) {
  const { isProduction } = getEnvironmentContext();
  const envTag = isProduction ? '🔴 PROD' : '🟢 DEV';
  const prefix = ns ? `[${ns}]` : '';
  const levelBadge = getLevelBadge(level);
  return `${envTag} ${now()} ${prefix} ${levelBadge} ${msg}`;
}

function getLevelBadge(level: LogLevel): string {
  switch (level) {
    case 'error': return '❌ ERROR';
    case 'warn': return '⚠️  WARN';
    case 'info': return 'ℹ️  INFO';
    case 'debug': return '🐛 DEBUG';
    default: return level.toUpperCase();
  }
}



export const logger = {
  setLevel(level: LogLevel) {
      currentLevel = level;
      this.info(`Log level set to: ${level}`, undefined, 'Logger');
    },
  getLevel(): LogLevel {
    return currentLevel;
  },
  enableDebug(enable = true) {
    const hasLocalStorage = typeof (globalThis as any).localStorage !== 'undefined';
    if (hasLocalStorage) {
      (globalThis as any).localStorage.setItem('EFU_DEBUG', enable ? 'true' : 'false');
    }
    currentLevel = enable ? 'debug' : 'warn';
    const { environment } = getEnvironmentContext();
    this.info(`Debug mode ${enable ? 'enabled' : 'disabled'} in ${environment}`, undefined, 'Logger');
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