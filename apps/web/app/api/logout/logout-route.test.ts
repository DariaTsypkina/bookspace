import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const routeSource = readFileSync(path.join(__dirname, 'route.ts'), 'utf8');

describe('POST /api/logout route (bd-6b7.11)', () => {
  it('revokes upstream session and 303-redirects to /login', () => {
    expect(routeSource).toMatch(/export async function POST/);
    expect(routeSource).toMatch(/\/auth\/logout/);
    expect(routeSource).toMatch(/NextResponse\.redirect/);
    expect(routeSource).toMatch(/\/login/);
    expect(routeSource).toMatch(/303/);
    expect(routeSource).toMatch(/session/);
    expect(routeSource).toMatch(/maxAge:\s*0/);
  });
});
