import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerServiceWorker } from './register-sw';

describe('PWA service worker registration (bd-6b7.2)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('registers /sw.js when serviceWorker is available', async () => {
    const register = vi.fn().mockResolvedValue({ scope: '/' });
    vi.stubGlobal('navigator', {
      serviceWorker: { register },
    });
    vi.stubGlobal('window', { location: { protocol: 'https:' } });

    await expect(registerServiceWorker()).resolves.toEqual({
      ok: true,
      scope: '/',
    });
    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  it('skips registration when serviceWorker is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', { location: { protocol: 'https:' } });

    await expect(registerServiceWorker()).resolves.toEqual({
      ok: false,
      reason: 'unsupported',
    });
  });

  it('skips registration outside browser globals', async () => {
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('window', undefined);

    await expect(registerServiceWorker()).resolves.toEqual({
      ok: false,
      reason: 'no-window',
    });
  });
});
