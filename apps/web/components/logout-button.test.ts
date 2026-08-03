import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const logoutButtonSource = readFileSync(
  path.join(__dirname, 'logout-button.tsx'),
  'utf8',
);

describe('LogoutButton progressive logout (bd-6b7.11)', () => {
  it('posts a native form to /logout so mobile works without JS click handlers', () => {
    expect(logoutButtonSource).toMatch(/<form[\s\S]*action=["']\/logout["']/);
    expect(logoutButtonSource).toMatch(/method=["']post["']/);
    expect(logoutButtonSource).toMatch(/type=["']submit["']/);
    expect(logoutButtonSource).toMatch(/Выйти/);
  });

  it('does not rely on App Router soft-nav or client onClick-only logout', () => {
    expect(logoutButtonSource).not.toMatch(/router\.push\(['"]\/login['"]\)/);
    expect(logoutButtonSource).not.toMatch(/useRouter/);
    expect(logoutButtonSource).not.toMatch(/onClick/);
    expect(logoutButtonSource).not.toMatch(/['"]use client['"]/);
  });
});
