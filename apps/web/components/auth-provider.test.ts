import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const providerSource = readFileSync(
  path.join(__dirname, 'auth-provider.tsx'),
  'utf8',
);
const layoutSource = readFileSync(
  path.join(__dirname, '../app/layout.tsx'),
  'utf8',
);
const appNavSource = readFileSync(path.join(__dirname, 'app-nav.tsx'), 'utf8');
const guestOnlySource = readFileSync(
  path.join(__dirname, 'guest-only.tsx'),
  'utf8',
);
const adminOnlySource = readFileSync(
  path.join(__dirname, 'admin-only.tsx'),
  'utf8',
);
const loginPageSource = readFileSync(
  path.join(__dirname, '../app/login/page.tsx'),
  'utf8',
);
const registerPageSource = readFileSync(
  path.join(__dirname, '../app/register/page.tsx'),
  'utf8',
);

describe('AuthProvider (bd-957.6)', () => {
  it('exposes AuthProvider + useAuth with user | null and pending status', () => {
    expect(providerSource).toMatch(/export function AuthProvider/);
    expect(providerSource).toMatch(/export function useAuth/);
    expect(providerSource).toMatch(/['"]pending['"]/);
    expect(providerSource).toMatch(/['"]authenticated['"]/);
    expect(providerSource).toMatch(/['"]guest['"]/);
    expect(providerSource).toMatch(/\bsetUser\b/);
    expect(providerSource).toMatch(/\brefresh\b/);
    expect(providerSource).toMatch(/createContext/);
  });

  it('fetches getCurrentUser once on mount (empty effect deps)', () => {
    expect(providerSource).toMatch(/getCurrentUser\s*\(/);
    expect(providerSource).toMatch(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[\s*\]\s*\)/,
    );
  });

  it('is wired in root layout around AppNav and children', () => {
    expect(layoutSource).toMatch(/AuthProvider/);
    expect(layoutSource).toMatch(/from ['"].*auth-provider['"]/);
    expect(layoutSource).toMatch(
      /<AuthProvider>[\s\S]*<AppNav\s*\/>[\s\S]*\{children\}[\s\S]*<\/AuthProvider>/,
    );
  });
});

describe('Consumers use Auth Context (bd-957.6)', () => {
  it('AppNav reads useAuth and does not call getCurrentUser or refetch on pathname', () => {
    expect(appNavSource).toMatch(/useAuth\s*\(/);
    expect(appNavSource).not.toMatch(/getCurrentUser/);
    expect(appNavSource).not.toMatch(
      /useEffect\s*\(\s*\(\s*\)\s*=>[\s\S]*pathname/,
    );
  });

  it('AppNav treats pending as undefined for getNavItems (no blank Profile flash)', () => {
    expect(appNavSource).toMatch(/getNavItems\s*\(/);
    expect(appNavSource).toMatch(/pending/);
  });

  it('GuestOnly uses useAuth instead of own getCurrentUser', () => {
    expect(guestOnlySource).toMatch(/useAuth\s*\(/);
    expect(guestOnlySource).not.toMatch(/getCurrentUser/);
    expect(guestOnlySource).toMatch(/router\.replace/);
    expect(guestOnlySource).toMatch(/profilePath/);
  });

  it('GuestOnly still renders children immediately (no loading-only gate)', () => {
    expect(guestOnlySource).not.toMatch(/if\s*\(\s*!ready\s*\)/);
    expect(guestOnlySource).not.toMatch(/return\s+null\s*;/);
    expect(guestOnlySource).not.toMatch(/Загрузка/);
  });

  it('AdminOnly uses useAuth instead of own getCurrentUser', () => {
    expect(adminOnlySource).toMatch(/useAuth\s*\(/);
    expect(adminOnlySource).not.toMatch(/getCurrentUser/);
  });

  it('login updates Auth Context via setUser after success', () => {
    expect(loginPageSource).toMatch(/useAuth\s*\(/);
    expect(loginPageSource).toMatch(/setUser/);
  });

  it('register refreshes or updates Auth Context after success', () => {
    expect(registerPageSource).toMatch(/useAuth\s*\(/);
    expect(registerPageSource).toMatch(/refresh|setUser/);
  });
});
