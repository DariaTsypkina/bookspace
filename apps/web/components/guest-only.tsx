'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { getCurrentUser, profilePath } from '../lib/auth';

const GUEST_ONLY_TIMEOUT_MS = 4_000;

/**
 * For guest-only pages (/login, /register).
 * Shows a visible loading status while checking session (never blank);
 * redirects auth users to /u/[slug].
 * Cookie session is first-party via BFF `/api/auth/*` (Nest `/auth/*`).
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const user = await Promise.race<AuthUserOrTimeout>([
          getCurrentUser(),
          new Promise<AuthUserOrTimeout>((resolve) => {
            setTimeout(() => {
              resolve(TIMEOUT_SYMBOL);
            }, GUEST_ONLY_TIMEOUT_MS);
          }),
        ]);
        if (cancelled) {
          return;
        }
        if (user && user !== TIMEOUT_SYMBOL) {
          router.replace(profilePath(user.slug));
          return;
        }
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

type AuthUserOrTimeout = Awaited<ReturnType<typeof getCurrentUser>> | symbol;
const TIMEOUT_SYMBOL = Symbol('guest-only-timeout');
