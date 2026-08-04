'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { profilePath } from '../lib/auth';
import { useAuth } from './auth-provider';

/**
 * For guest-only pages (/login, /register).
 * Renders children immediately; redirects auth users to /u/[slug] when
 * Auth Context resolves as authenticated (no own /api/auth/me).
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status !== 'authenticated' || !user) {
      return;
    }
    router.replace(profilePath(user.slug));
  }, [status, user, router]);

  return <>{children}</>;
}
