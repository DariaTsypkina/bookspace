import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(path.join(__dirname, 'guest-only.tsx'), 'utf8');

describe('GuestOnly (bd-cq7.6 — no blank gate)', () => {
  it('does not return null while the session check is pending', () => {
    expect(source).not.toMatch(
      /if\s*\(\s*!ready\s*\)\s*\{\s*return\s+null\s*;/,
    );
    expect(source).not.toMatch(/return\s+null\s*;/);
  });

  it('shows a visible RU loading status while checking session', () => {
    expect(source).toMatch(/role=["']status["']/);
    expect(source).toMatch(/Загрузка/);
    expect(source).toMatch(/aria-busy/);
  });

  it('still redirects authenticated users away from guest pages', () => {
    expect(source).toMatch(/getCurrentUser/);
    expect(source).toMatch(/router\.replace/);
    expect(source).toMatch(/profilePath/);
  });
});
