import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

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
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Normalize keys from API (first_name/last_name)
      return {
        id: parsed.id,
        email: parsed.email,
        firstName: parsed.first_name ?? parsed.firstName,
        lastName: parsed.last_name ?? parsed.lastName,
      } as AuthUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'user') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(
            next
              ? {
                  id: next.id,
                  email: next.email,
                  firstName: next.first_name ?? next.firstName,
                  lastName: next.last_name ?? next.lastName,
                }
              : null
          );
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify({
      id: u.id,
      email: u.email,
      first_name: u.firstName,
      last_name: u.lastName,
    }));
  };

  const logout = () => {
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
