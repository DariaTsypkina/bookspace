'use client';

import { useEffect } from 'react';
import {
  registerServiceWorker,
  shouldRegisterServiceWorker,
  unregisterAllServiceWorkers,
} from '@/lib/pwa/register-sw';

/**
 * Registers the PWA service worker once on the client.
 * SW must not cache-first `/_next/static` (see offline-cache-policy / bd-6b7.10).
 */
export function PwaSwRegister() {
  useEffect(() => {
    if (shouldRegisterServiceWorker()) {
      void registerServiceWorker();
      return;
    }
    void unregisterAllServiceWorkers();
  }, []);

  return null;
}
