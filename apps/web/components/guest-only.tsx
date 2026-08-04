'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef } from 'react';
import { profilePath } from '../lib/auth';
import { useAuth } from './auth-provider';

/**
 * For guest-only pages (/login, /register).
 * Renders children immediately; redirects users who arrive already authenticated.
 * Does not steal navigation after login/register on this page (saw guest first).
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();
  const sawGuest = useRef(false);

  useEffect(() => {
    if (status === 'guest') {
      sawGuest.current = true;
      return;
    }
    if (status === 'authenticated' && user && !sawGuest.current) {
      router.replace(profilePath(user.slug));
    }
  }, [status, user, router]);

  return <>{children}</>;
}
