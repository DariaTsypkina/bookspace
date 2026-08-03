import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  registerServiceWorker,
  shouldRegisterServiceWorker,
  unregisterAllServiceWorkers,
} from './register-sw';

describe('PWA service worker registration (bd-6b7.2)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('skips plain development but allows e2e/explicit SW (bd-6b7.10)', () => {
    expect(shouldRegisterServiceWorker('development', {})).toBe(false);
    expect(shouldRegisterServiceWorker('production')).toBe(true);
    expect(shouldRegisterServiceWorker('test')).toBe(false);
    expect(
      shouldRegisterServiceWorker('development', { e2eBypass: 'true' }),
    ).toBe(true);
    expect(shouldRegisterServiceWorker('development', { enableSw: '1' })).toBe(
      true,
    );
  });

  it('unregisterAllServiceWorkers clears existing registrations (bd-6b7.10)', async () => {
    const unregister = vi.fn().mockResolvedValue(true);
    const getRegistrations = vi
      .fn()
      .mockResolvedValue([{ unregister }, { unregister }]);
    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistrations },
    });
    vi.stubGlobal('window', { location: { protocol: 'https:' } });

    await expect(unregisterAllServiceWorkers()).resolves.toEqual({
      ok: true,
      unregistered: 2,
    });
    expect(unregister).toHaveBeenCalledTimes(2);
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
