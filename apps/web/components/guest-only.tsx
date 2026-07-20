'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { getCurrentUser, profilePath } from '../lib/auth';

/**
 * For guest-only pages (/login, /register).
 * Does not render children while checking session; redirects auth users to /u/[slug].
 * Cookie session is first-party via BFF `/api/auth/*` (Nest `/auth/*`).
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const user = await getCurrentUser();
      if (cancelled) {
        return;
      }
      if (user) {
        router.replace(profilePath(user.slug));
        return;
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return null;
  }

  return children;
}
