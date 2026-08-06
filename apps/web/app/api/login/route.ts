import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function stripCookieDomain(setCookie: string): string {
  return setCookie
    .split(';')
    .map((part) => part.trim())
    .filter((part) => !/^Domain=/i.test(part))
    .join('; ');
}

function redirectTo(path: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const upstream = await fetch(new URL('/auth/login', API_URL), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    redirect: 'manual',
  });

  const response = upstream.ok
    ? redirectTo('/', request)
    : redirectTo('/login', request);

  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];
  for (const raw of setCookies) {
    response.headers.append('set-cookie', stripCookieDomain(raw));
  }

  return response;
}
