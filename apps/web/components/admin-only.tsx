'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';

export function AdminOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const user = await getCurrentUser();
      if (cancelled) {
        return;
      }
      if (!user) {
        router.replace('/login');
        return;
      }
      if (user.role !== 'ADMIN') {
        router.replace('/');
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
