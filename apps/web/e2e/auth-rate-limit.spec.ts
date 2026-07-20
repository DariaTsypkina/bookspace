import { expect, test } from '@playwright/test';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function uniqueIp(): string {
  return `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
}

test.describe('Auth rate limit e2e', () => {
  test('register returns 429 after repeated attempts from same IP', async ({
    request,
  }) => {
    const clientIp = uniqueIp();
    const headers = { 'X-Forwarded-For': clientIp };

    for (let i = 0; i < 5; i++) {
      const response = await request.post(`${apiUrl}/auth/register`, {
        headers,
        data: {
          email: `rl-pw-${Date.now()}-${i}@bookspace.local`,
          password: 'weak',
        },
      });
      expect(response.status()).toBe(400);
    }

    const blocked = await request.post(`${apiUrl}/auth/register`, {
      headers,
      data: {
        email: `rl-pw-blocked-${Date.now()}@bookspace.local`,
        password: 'Secure123!',
      },
    });
    expect(blocked.status()).toBe(429);
    const body = (await blocked.json()) as { message?: string };
    expect(body.message).toContain('Слишком много попыток');
  });

  test('login returns 429 after repeated attempts from same IP', async ({
    request,
  }) => {
    const clientIp = uniqueIp();
    const headers = { 'X-Forwarded-For': clientIp };

    for (let i = 0; i < 10; i++) {
      const response = await request.post(`${apiUrl}/auth/login`, {
        headers,
        data: {
          email: `missing-${i}@bookspace.local`,
          password: 'Secure123!',
        },
      });
      expect(response.status()).toBe(401);
    }

    const blocked = await request.post(`${apiUrl}/auth/login`, {
      headers,
      data: {
        email: 'missing-final@bookspace.local',
        password: 'Secure123!',
      },
    });
    expect(blocked.status()).toBe(429);
    const body = (await blocked.json()) as { message?: string };
    expect(body.message).toContain('Слишком много попыток');
  });
});
