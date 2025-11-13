import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { logger } from '../../../shared/utils/logger';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const log = logger.withContext('AuthProvider');
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) {
        log.info('init_no_user');
        return null;
      }
      const parsed = JSON.parse(raw);
      const normalized: AuthUser = {
        id: parsed.id,
        email: parsed.email,
        firstName: parsed.first_name ?? parsed.firstName,
        lastName: parsed.last_name ?? parsed.lastName,
      };
      log.info('init_with_user', { id: normalized.id, email: normalized.email });
      return normalized;
    } catch (err) {
      log.warn('init_parse_error', err);
      return null;
    }
  });

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'user') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : null;
          const normalized = next
            ? {
                id: next.id,
                email: next.email,
                firstName: next.first_name ?? next.firstName,
                lastName: next.last_name ?? next.lastName,
              }
            : null;
          log.info('storage_user_change', { hasUser: !!normalized });
          setUser(normalized);
        } catch (err) {
          log.warn('storage_parse_error', err);
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = (u: AuthUser) => {
    log.info('login', { id: u.id, email: u.email });
    setUser(u);
    localStorage.setItem('user', JSON.stringify({
      id: u.id,
      email: u.email,
      first_name: u.firstName,
      last_name: u.lastName,
    }));
  };

  const logout = () => {
    log.info('logout');
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
