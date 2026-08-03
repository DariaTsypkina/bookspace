import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSpoilersOkCookie,
  CHARACTER_RELATION_LABELS,
  hasClientSpoilersConsent,
  hasSpoilersConsent,
  parseSpoilersOkCookieValue,
  persistSpoilersConsent,
  readSpoilersConsentFromStorage,
  SPOILERS_OK_COOKIE,
  SPOILERS_OK_MAX_AGE_SECONDS,
  SPOILERS_OK_STORAGE_KEY,
  SPOILERS_OK_VALUE,
} from './spoiler-gate';

const spoilerGateLibSource = readFileSync(
  path.join(__dirname, 'spoiler-gate.ts'),
  'utf8',
);
const spoilerGateComponentSource = readFileSync(
  path.join(__dirname, '../components/spoiler-gate.tsx'),
  'utf8',
);

describe('spoiler gate helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts spoilers_ok=1 cookie value', () => {
    expect(hasSpoilersConsent(SPOILERS_OK_VALUE)).toBe(true);
  });

  it('rejects missing or invalid cookie values', () => {
    expect(hasSpoilersConsent(undefined)).toBe(false);
    expect(hasSpoilersConsent('0')).toBe(false);
    expect(hasSpoilersConsent('yes')).toBe(false);
  });

  it('builds cookie with 30-day max age and SameSite=Lax', () => {
    const cookie = buildSpoilersOkCookie({ secure: false });

    expect(cookie).toContain(`${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}`);
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain(`Max-Age=${SPOILERS_OK_MAX_AGE_SECONDS}`);
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).not.toContain('Secure');
  });

  it('adds Secure attribute when building cookie for HTTPS (bd-azl.5)', () => {
    const cookie = buildSpoilersOkCookie({ secure: true });

    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toMatch(/(?:^|;\s*)Secure(?:;|$)/);
  });

  it('parses spoilers_ok from document.cookie with or without spaces', () => {
    expect(
      parseSpoilersOkCookieValue(`${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}`),
    ).toBe(SPOILERS_OK_VALUE);
    expect(
      parseSpoilersOkCookieValue(
        `theme=dark; ${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}; other=1`,
      ),
    ).toBe(SPOILERS_OK_VALUE);
    expect(
      parseSpoilersOkCookieValue(
        `theme=dark;${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}`,
      ),
    ).toBe(SPOILERS_OK_VALUE);
    expect(parseSpoilersOkCookieValue('theme=dark')).toBeUndefined();
  });

  it('mirrors consent in localStorage as iOS cookie fallback (bd-azl.5)', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    } as Storage;

    expect(readSpoilersConsentFromStorage(storage)).toBe(false);

    persistSpoilersConsent({
      cookieSetter: () => {
        /* cookie write may fail on iOS — storage must still work */
      },
      storage,
      secure: true,
    });

    expect(store.get(SPOILERS_OK_STORAGE_KEY)).toBe(SPOILERS_OK_VALUE);
    expect(readSpoilersConsentFromStorage(storage)).toBe(true);
  });

  it('hasClientSpoilersConsent accepts cookie or localStorage (bd-azl.5)', () => {
    expect(
      hasClientSpoilersConsent({
        cookieHeader: '',
        storage: null,
      }),
    ).toBe(false);

    expect(
      hasClientSpoilersConsent({
        cookieHeader: `${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}`,
        storage: null,
      }),
    ).toBe(true);

    const store = new Map<string, string>([
      [SPOILERS_OK_STORAGE_KEY, SPOILERS_OK_VALUE],
    ]);
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: () => undefined,
      removeItem: () => undefined,
    } as Storage;

    expect(
      hasClientSpoilersConsent({
        cookieHeader: '',
        storage,
      }),
    ).toBe(true);
  });

  it('auto-detects Secure from location.protocol when option omitted', () => {
    vi.stubGlobal('location', { protocol: 'https:' });
    expect(buildSpoilersOkCookie()).toMatch(/(?:^|;\s*)Secure(?:;|$)/);

    vi.stubGlobal('location', { protocol: 'http:' });
    expect(buildSpoilersOkCookie()).not.toContain('Secure');
  });

  it('validates cookie via shared Zod schemas (bd-0t0.9)', () => {
    expect(spoilerGateLibSource).toMatch(/from ['"]@bookspace\/schemas['"]/);
    expect(spoilerGateLibSource).toMatch(/SpoilersOkCookieValueSchema/);
    expect(CHARACTER_RELATION_LABELS.FRIEND).toBe('Друг');
    expect(CHARACTER_RELATION_LABELS.ENEMY).toBe('Враг');
    expect(CHARACTER_RELATION_LABELS.FAMILY).toBe('Семья');
    expect(CHARACTER_RELATION_LABELS.RELATED).toBe('Связан');
  });

  it('SpoilerGate accepts optimistically and uses touch-safe button (bd-azl.5)', () => {
    expect(spoilerGateComponentSource).toMatch(/persistSpoilersConsent/);
    expect(spoilerGateComponentSource).toMatch(/hasClientSpoilersConsent/);
    expect(spoilerGateComponentSource).toMatch(/cursor-pointer/);
    expect(spoilerGateComponentSource).toMatch(/font-sans/);
    // Hydration-safe: client consent via useSyncExternalStore (no setState-in-effect)
    expect(spoilerGateComponentSource).toMatch(/useSyncExternalStore/);
    expect(spoilerGateComponentSource).toMatch(/getServerSnapshot/);
    expect(spoilerGateComponentSource).not.toMatch(/useEffect/);
    // Optimistic UI: setAccepted(true) before persist
    const acceptHandler = spoilerGateComponentSource.match(
      /onClick=\{\(\)\s*=>\s*\{([\s\S]*?)\}\}/,
    );
    expect(acceptHandler?.[1]).toBeTruthy();
    const body = acceptHandler![1];
    expect(body.indexOf('setAccepted(true)')).toBeLessThan(
      body.indexOf('persistSpoilersConsent'),
    );
  });
});
