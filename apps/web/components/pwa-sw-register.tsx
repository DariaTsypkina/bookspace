'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register-sw';

/**
 * Registers the PWA service worker once on the client.
 */
export function PwaSwRegister() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return null;
}
