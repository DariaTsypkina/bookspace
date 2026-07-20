import { describe, expect, it } from 'vitest';
import {
  buildSpoilersOkCookie,
  hasSpoilersConsent,
  SPOILERS_OK_COOKIE,
  SPOILERS_OK_MAX_AGE_SECONDS,
  SPOILERS_OK_VALUE,
} from './spoiler-gate';

describe('spoiler gate helpers', () => {
  it('accepts spoilers_ok=1 cookie value', () => {
    expect(hasSpoilersConsent(SPOILERS_OK_VALUE)).toBe(true);
  });

  it('rejects missing or invalid cookie values', () => {
    expect(hasSpoilersConsent(undefined)).toBe(false);
    expect(hasSpoilersConsent('0')).toBe(false);
    expect(hasSpoilersConsent('yes')).toBe(false);
  });

  it('builds cookie with 30-day max age and SameSite=Lax', () => {
    const cookie = buildSpoilersOkCookie();

    expect(cookie).toContain(`${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}`);
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain(`Max-Age=${SPOILERS_OK_MAX_AGE_SECONDS}`);
    expect(cookie).toContain('SameSite=Lax');
  });
});
