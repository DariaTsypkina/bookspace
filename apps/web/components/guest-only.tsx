'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { getCurrentUser, profilePath } from '../lib/auth';

/**
 * For guest-only pages (/login, /register).
 * Shows a visible loading status while checking session (never blank);
 * redirects auth users to /u/[slug].
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
    return (
      <div
        className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-8"
        aria-busy="true"
      >
        <p className="text-[0.95rem] text-muted" role="status">
          Загрузка…
        </p>
      </div>
    );
  }

  return children;
}
