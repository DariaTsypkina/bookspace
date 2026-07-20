import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function stripCookieDomain(setCookie: string): string {
  return setCookie
    .split(';')
    .map((part) => part.trim())
    .filter((part) => !/^Domain=/i.test(part))
    .join('; ');
}

async function proxyAuth(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = pathSegments.join('/');
  const targetUrl = new URL(`/auth/${path}`, API_URL);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: 'manual',
  });

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) {
    responseHeaders.set('content-type', upstreamType);
  }

  const location = upstream.headers.get('location');
  if (location) {
    responseHeaders.set('location', location);
  }

  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];
  for (const raw of setCookies) {
    responseHeaders.append('set-cookie', stripCookieDomain(raw));
  }

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAuth(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAuth(request, path);
}
