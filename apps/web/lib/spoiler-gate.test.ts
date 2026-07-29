import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildSpoilersOkCookie,
  CHARACTER_RELATION_LABELS,
  hasSpoilersConsent,
  SPOILERS_OK_COOKIE,
  SPOILERS_OK_MAX_AGE_SECONDS,
  SPOILERS_OK_VALUE,
} from './spoiler-gate';

const spoilerGateLibSource = readFileSync(
  path.join(__dirname, 'spoiler-gate.ts'),
  'utf8',
);

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

  it('validates cookie via shared Zod schemas (bd-0t0.9)', () => {
    expect(spoilerGateLibSource).toMatch(/from ['"]@bookspace\/schemas['"]/);
    expect(spoilerGateLibSource).toMatch(/SpoilersOkCookieValueSchema/);
    expect(CHARACTER_RELATION_LABELS.FRIEND).toBe('Друг');
    expect(CHARACTER_RELATION_LABELS.ENEMY).toBe('Враг');
    expect(CHARACTER_RELATION_LABELS.FAMILY).toBe('Семья');
    expect(CHARACTER_RELATION_LABELS.RELATED).toBe('Связан');
  });
});
