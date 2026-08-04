'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from './auth-provider';

export function AdminOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();
  const ready = status !== 'pending' && user?.role === 'ADMIN';

  useEffect(() => {
    if (status === 'pending') {
      return;
    }
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [status, user, router]);

  if (!ready) {
    return null;
  }

  return children;
}
