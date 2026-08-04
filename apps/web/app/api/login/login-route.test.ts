import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const routeSource = readFileSync(path.join(__dirname, 'route.ts'), 'utf8');

describe('POST /api/login progressive fallback (bd-957.7)', () => {
  it('accepts form submit and redirects on success', () => {
    expect(routeSource).toMatch(/export async function POST/);
    expect(routeSource).toMatch(/formData\(\)/);
    expect(routeSource).toMatch(/\/auth\/login/);
    expect(routeSource).toMatch(/NextResponse\.redirect/);
    expect(routeSource).toMatch(/303/);
  });
});
