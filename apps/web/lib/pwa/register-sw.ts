export type RegisterServiceWorkerResult =
  | { ok: true; scope: string }
  | {
      ok: false;
      reason: 'no-window' | 'unsupported' | 'error';
      error?: string;
    };

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
