'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { getCurrentUser, profilePath, type AuthUser } from '../lib/auth';

const GUEST_ONLY_TIMEOUT_MS = 4_000;
const TIMEOUT = 'timeout' as const;

/**
 * For guest-only pages (/login, /register).
 * Renders children immediately; redirects auth users to /u/[slug] in the background.
 * Cookie session is first-party via BFF `/api/auth/*` (Nest `/auth/*`).
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await Promise.race<AuthUser | null | typeof TIMEOUT>([
          getCurrentUser(),
          new Promise<typeof TIMEOUT>((resolve) => {
            setTimeout(() => {
              resolve(TIMEOUT);
            }, GUEST_ONLY_TIMEOUT_MS);
          }),
        ]);
        if (cancelled || result === TIMEOUT || result === null) {
          return;
        }
        router.replace(profilePath(result.slug));
      } catch {
        // Ignore transient auth check failures; keep guest page visible.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <>{children}</>;
}
