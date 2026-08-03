'use client';

import { useEffect } from 'react';
import {
  registerServiceWorker,
  shouldRegisterServiceWorker,
  unregisterAllServiceWorkers,
} from '@/lib/pwa/register-sw';

/**
 * Registers the PWA service worker once on the client (production only).
 * In development, unregisters any existing SW so stale `/_next/static` caches
 * cannot hydrate AppNav with outdated Button asChild bundles (bd-6b7.10).
 */
export function PwaSwRegister() {
  useEffect(() => {
    if (!shouldRegisterServiceWorker(process.env.NODE_ENV)) {
      void unregisterAllServiceWorkers();
      return;
    }
    void registerServiceWorker();
  }, []);

  return null;
}
