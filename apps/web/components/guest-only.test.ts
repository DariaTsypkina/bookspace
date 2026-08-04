import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(path.join(__dirname, 'guest-only.tsx'), 'utf8');

describe('GuestOnly (bd-cq7.6 — no blank gate)', () => {
  it('renders guest page content immediately (no loading-only gate)', () => {
    expect(source).not.toMatch(/useState\(\s*false\s*\)/);
    expect(source).not.toMatch(/if\s*\(\s*!ready\s*\)/);
    expect(source).not.toMatch(/return\s+null\s*;/);
    expect(source).not.toMatch(/Загрузка/);
  });

  it('still redirects authenticated users away from guest pages', () => {
    expect(source).toMatch(/getCurrentUser/);
    expect(source).toMatch(/router\.replace/);
    expect(source).toMatch(/profilePath/);
  });

  it('does not block guest UI when /api/auth/me fails', () => {
    expect(source).toMatch(/catch\s*\{/);
  });

  it('has timeout fallback for hanging /api/auth/me requests', () => {
    expect(source).toMatch(/GUEST_ONLY_TIMEOUT_MS/);
    expect(source).toMatch(/setTimeout/);
    expect(source).toMatch(/Promise\.race/);
  });
});
