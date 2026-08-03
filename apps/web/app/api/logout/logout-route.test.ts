import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST, loginRedirectUrl } from './route';

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

describe('logout redirect host (bd-6b7.12)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { getSetCookie: () => [] },
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loginRedirectUrl uses Host when request.url is localhost', () => {
    const request = new NextRequest('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: { host: '192.168.1.71:3000' },
    });
    expect(loginRedirectUrl(request).href).toBe(
      'http://192.168.1.71:3000/login',
    );
  });

  it('loginRedirectUrl prefers first x-forwarded-host/proto', () => {
    const request = new NextRequest('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        'x-forwarded-host': 'books.example.com, other.example.com',
        'x-forwarded-proto': 'https, http',
      },
    });
    expect(loginRedirectUrl(request).href).toBe(
      'https://books.example.com/login',
    );
  });

  it('loginRedirectUrl falls back to request.url without Host', () => {
    const request = new NextRequest('http://localhost:3000/api/logout', {
      method: 'POST',
    });
    request.headers.delete('host');
    expect(loginRedirectUrl(request).href).toBe('http://localhost:3000/login');
  });

  it('POST 303 Location uses client Host, not server request.url localhost', async () => {
    const request = new NextRequest('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: { host: '192.168.1.71:3000' },
    });
    const response = await POST(request);
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'http://192.168.1.71:3000/login',
    );
  });

  it('POST 303 Location uses forwarded host/proto', async () => {
    const request = new NextRequest('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        'x-forwarded-host': '192.168.1.71:3000',
        'x-forwarded-proto': 'https',
      },
    });
    const response = await POST(request);
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'https://192.168.1.71:3000/login',
    );
  });

  it('POST 303 Location falls back to request.url when Host headers missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/logout', {
      method: 'POST',
    });
    request.headers.delete('host');
    const response = await POST(request);
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login',
    );
  });
});
