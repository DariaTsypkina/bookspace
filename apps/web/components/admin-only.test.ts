import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(path.join(__dirname, 'admin-only.tsx'), 'utf8');

describe('AdminOnly (bd-3h3 — no setState-in-effect)', () => {
  it('does not call setState synchronously inside useEffect (eslint react-hooks/set-state-in-effect)', () => {
    expect(source).not.toMatch(/useState\s*\(/);
    expect(source).not.toMatch(/setReady\s*\(/);
    // effect may redirect, but must not set ready via setState
    const effectBody = source.match(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,/,
    )?.[1];
    expect(effectBody).toBeDefined();
    expect(effectBody).not.toMatch(/set[A-Z]\w*\s*\(/);
  });

  it('derives admin-ready gate from Auth status/user (pending → null, ADMIN → children)', () => {
    expect(source).toMatch(/useAuth\s*\(/);
    expect(source).toMatch(/status/);
    expect(source).toMatch(
      /user\.role\s*!==\s*['"]ADMIN['"]|user\.role\s*===\s*['"]ADMIN['"]/,
    );
    expect(source).toMatch(/return\s+null/);
    expect(source).toMatch(/return\s+children/);
  });

  it('redirects non-admin via router.replace (guest → /login, user → /)', () => {
    expect(source).toMatch(/router\.replace\s*\(\s*['"]\/login['"]\s*\)/);
    expect(source).toMatch(/router\.replace\s*\(\s*['"]\/['"]\s*\)/);
    expect(source).not.toMatch(/getCurrentUser/);
  });
});
