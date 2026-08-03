export type RegisterServiceWorkerResult =
  | { ok: true; scope: string }
  | {
      ok: false;
      reason: 'no-window' | 'unsupported' | 'error' | 'skipped-env';
      error?: string;
    };

export type UnregisterServiceWorkersResult =
  | { ok: true; unregistered: number }
  | {
      ok: false;
      reason: 'no-window' | 'unsupported' | 'error';
      error?: string;
    };

/**
 * Register SW in production, or in dev when e2e / explicit flag is on.
 * Plain `next dev` skips registration and unregisters stale SW (bd-6b7.10).
 */
export function shouldRegisterServiceWorker(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  options: {
    enableSw?: string | undefined;
    e2eBypass?: string | undefined;
  } = {},
): boolean {
  if (nodeEnv === 'production') return true;
  const enableSw = options.enableSw ?? process.env.NEXT_PUBLIC_ENABLE_SW;
  const e2eBypass = options.e2eBypass ?? process.env.E2E_THROTTLE_BYPASS;
  return enableSw === '1' || e2eBypass === 'true';
}

/**
 * Registers the native service worker from the browser only.
 * Safe to call from a client component; no-ops on the server.
 */
export async function registerServiceWorker(
  scriptUrl = '/sw.js',
): Promise<RegisterServiceWorkerResult> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { ok: false, reason: 'no-window' };
  }

  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    return { ok: false, reason: 'unsupported' };
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptUrl, {
      scope: '/',
    });
    return { ok: true, scope: registration.scope };
  } catch (error) {
    return {
      ok: false,
      reason: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Drop all service worker registrations (dev cleanup after stale `/_next` caches).
 */
export async function unregisterAllServiceWorkers(): Promise<UnregisterServiceWorkersResult> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { ok: false, reason: 'no-window' };
  }

  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    return { ok: false, reason: 'unsupported' };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
    return { ok: true, unregistered: registrations.length };
  } catch (error) {
    return {
      ok: false,
      reason: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
