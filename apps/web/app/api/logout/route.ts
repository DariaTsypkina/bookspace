import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const SESSION_COOKIE = 'session';

function stripCookieDomain(setCookie: string): string {
  return setCookie
    .split(';')
    .map((part) => part.trim())
    .filter((part) => !/^Domain=/i.test(part))
    .join('; ');
}

function clearSessionAndRedirect(request: NextRequest): NextResponse {
  const redirect = NextResponse.redirect(new URL('/login', request.url), 303);
  redirect.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
  return redirect;
}

/**
 * Progressive logout endpoint for form POST (bd-6b7.11).
 * Clears Nest session via upstream, then 303 → /login.
 * Lives under app/api/** so native fetch is allowed (ADR 0005).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookie = request.headers.get('cookie');
  const headers = new Headers();
  if (cookie) {
    headers.set('cookie', cookie);
  }

  try {
    const upstream = await fetch(new URL('/auth/logout', API_URL), {
      method: 'POST',
      headers,
    });

    const redirect = clearSessionAndRedirect(request);
    const setCookies =
      typeof upstream.headers.getSetCookie === 'function'
        ? upstream.headers.getSetCookie()
        : [];
    for (const raw of setCookies) {
      redirect.headers.append('set-cookie', stripCookieDomain(raw));
    }
    return redirect;
  } catch {
    return clearSessionAndRedirect(request);
  }
}
