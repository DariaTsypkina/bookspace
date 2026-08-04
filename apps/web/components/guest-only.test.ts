import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(path.join(__dirname, 'guest-only.tsx'), 'utf8');

describe('GuestOnly (bd-cq7.6 / bd-957.6 — Auth Context)', () => {
  it('renders guest page content immediately (no loading-only gate)', () => {
    expect(source).not.toMatch(/useState\(\s*false\s*\)/);
    expect(source).not.toMatch(/if\s*\(\s*!ready\s*\)/);
    expect(source).not.toMatch(/return\s+null\s*;/);
    expect(source).not.toMatch(/Загрузка/);
  });

  it('redirects authenticated users via Auth Context (no own /me fetch)', () => {
    expect(source).toMatch(/useAuth\s*\(/);
    expect(source).not.toMatch(/getCurrentUser/);
    expect(source).toMatch(/router\.replace/);
    expect(source).toMatch(/profilePath/);
    expect(source).toMatch(/authenticated|status/);
    expect(source).toMatch(/sawGuest/);
  });

  it('does not race its own /api/auth/me (session owned by AuthProvider)', () => {
    expect(source).not.toMatch(/GUEST_ONLY_TIMEOUT_MS/);
    expect(source).not.toMatch(/Promise\.race/);
  });
});
