'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getCurrentUser, type AuthUser } from '../lib/auth';

export type AuthStatus = 'pending' | 'authenticated' | 'guest';

export type AuthContextValue = {
  /** Resolved user; null while pending or guest. */
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * One client session fetch for the SPA lifetime (bd-957.6).
 * Mount-only getCurrentUser(); login/logout update via setUser / refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('pending');

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
    setStatus(next ? 'authenticated' : 'guest');
  }, []);

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, [setUser]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const current = await getCurrentUser();
        if (!cancelled) {
          setUserState(current);
          setStatus(current ? 'authenticated' : 'guest');
        }
      } catch {
        if (!cancelled) {
          setUserState(null);
          setStatus('guest');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, setUser, refresh }),
    [user, status, setUser, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
