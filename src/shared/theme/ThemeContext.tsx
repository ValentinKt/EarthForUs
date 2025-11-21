import * as React from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved as Theme;
  } catch {}
  return 'system';
}

const prefersDarkQuery = '(prefers-color-scheme: dark)';
let transitionTimeoutId: number | null = null;

function applyTheme(theme: Theme, systemPrefersDark: boolean) {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);
  root.classList.toggle('dark', isDark);
  // Improve form controls contrast in supported browsers
  root.style.colorScheme = isDark ? 'dark' : 'light';
  // Expose theme state for CSS/data-theme selectors
  root.dataset.theme = isDark ? 'dark' : 'light';
  // Smooth transition on theme changes
  if (transitionTimeoutId) {
    clearTimeout(transitionTimeoutId);
    transitionTimeoutId = null;
  }
  root.classList.add('theme-transition');
  transitionTimeoutId = window.setTimeout(() => {
    root.classList.remove('theme-transition');
    transitionTimeoutId = null;
  }, 220);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    return window.matchMedia(prefersDarkQuery).matches;
  });
  const mqlRef = useRef<MediaQueryList | null>(null);

  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    return theme === 'dark' || (theme === 'system' && systemPrefersDark) ? 'dark' : 'light';
  }, [theme, systemPrefersDark]);

  useEffect(() => {
    applyTheme(theme, systemPrefersDark);
  }, [theme, systemPrefersDark]);

  useEffect(() => {
    if (!('matchMedia' in window)) return;
    const mql = window.matchMedia(prefersDarkQuery);
    mqlRef.current = mql;
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem('theme', t); } catch {}
  };

  const toggle = () => {
    // Cycle: light → dark → system → light
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggle,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}