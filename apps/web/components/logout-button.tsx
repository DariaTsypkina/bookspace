'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '../lib/auth';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleLogout();
      }}
      disabled={loading}
      className="logout-button"
    >
      {loading ? 'Выход…' : 'Выйти'}
    </button>
  );
}
