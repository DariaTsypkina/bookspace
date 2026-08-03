'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from '../lib/auth';

/** Full page navigation after logout — avoids App Router soft-nav race on mobile (bd-6b7.9). */
export function redirectAfterLogout(): void {
  window.location.assign('/login');
}

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      redirectAfterLogout();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void handleLogout();
      }}
      disabled={loading}
      className="self-start"
    >
      {loading ? 'Выход…' : 'Выйти'}
    </Button>
  );
}
