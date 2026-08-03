import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { redirectAfterLogout } from './logout-button';

const logoutButtonSource = readFileSync(
  path.join(__dirname, 'logout-button.tsx'),
  'utf8',
);

describe('redirectAfterLogout (bd-6b7.9)', () => {
  it('navigates to /login via full page load (not App Router soft-nav)', () => {
    const assign = vi.fn();
    vi.stubGlobal('window', { location: { assign } });

    redirectAfterLogout();

    expect(assign).toHaveBeenCalledWith('/login');
    vi.unstubAllGlobals();
  });
});

describe('LogoutButton logout redirect (bd-6b7.9)', () => {
  it('uses redirectAfterLogout after successful logout, not router.push+refresh', () => {
    expect(logoutButtonSource).toMatch(/redirectAfterLogout\(\)/);
    expect(logoutButtonSource).not.toMatch(/router\.push\(['"]\/login['"]\)/);
    expect(logoutButtonSource).not.toMatch(/router\.refresh\(\)/);
    expect(logoutButtonSource).not.toMatch(/useRouter/);
  });

  it('keeps RU labels and loading state', () => {
    expect(logoutButtonSource).toMatch(/Выйти/);
    expect(logoutButtonSource).toMatch(/Выход…/);
  });
});
