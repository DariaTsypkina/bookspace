import { describe, expect, it } from 'vitest';

import {
  CANONICAL_E2E_BASE_URL,
  resolveSpoilerCookieDomain,
} from './spoiler-cookie-domain';

describe('resolveSpoilerCookieDomain', () => {
  it('uses hostname from an already-navigated page URL (127.0.0.1)', () => {
    expect(
      resolveSpoilerCookieDomain(
        'http://127.0.0.1:3000/characters/garri-potter',
        CANONICAL_E2E_BASE_URL,
      ),
    ).toBe('127.0.0.1');
  });

  it('uses hostname from an already-navigated page URL (localhost)', () => {
    expect(
      resolveSpoilerCookieDomain(
        'http://localhost:3000/characters/garri-potter',
        'http://127.0.0.1:3000',
      ),
    ).toBe('localhost');
  });

  it('falls back to BASE_URL hostname when page is about:blank (cookie before goto)', () => {
    expect(
      resolveSpoilerCookieDomain('about:blank', 'http://127.0.0.1:3000'),
    ).toBe('127.0.0.1');
  });

  it('falls back to canonical localhost BASE_URL when page is about:blank', () => {
    expect(
      resolveSpoilerCookieDomain('about:blank', CANONICAL_E2E_BASE_URL),
    ).toBe('localhost');
  });

  it('treats empty page URL like about:blank and uses fallback', () => {
    expect(resolveSpoilerCookieDomain('', 'http://127.0.0.1:3000')).toBe(
      '127.0.0.1',
    );
  });
});
