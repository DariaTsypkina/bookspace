import { expect, test } from '@playwright/test';

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@bookspace.local`;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

test.describe('Auth session and guards', () => {
  test('login sets first-party session cookie via BFF; logout clears access', async ({
    page,
    context,
  }) => {
    const email = uniqueEmail();
    const password = 'Secure123!';
    const slug = email.split('@')[0]!;

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');

    const webCookies = await context.cookies();
    const sessionCookie = webCookies.find(
      (cookie) => cookie.name === 'session',
    );
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);

    await page.goto(`/u/${slug}`);
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();

    const afterLogout = await context.cookies();
    const cleared = afterLogout.find((cookie) => cookie.name === 'session');
    expect(cleared === undefined || cleared.value === '').toBe(true);

    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  });

  test('guest cannot mutate library; authenticated request succeeds', async ({
    request,
  }) => {
    const guest = await request.post(`${API_URL}/me/library/items`, {
      data: { workId: 'guest-work' },
    });
    expect(guest.status()).toBe(401);

    const email = uniqueEmail();
    const password = 'Secure123!';

    const register = await request.post(`${API_URL}/auth/register`, {
      data: { email, password },
    });
    expect(register.status()).toBe(201);

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    });
    expect(login.status()).toBe(200);

    const authed = await request.post(`${API_URL}/me/library/items`, {
      data: { workId: 'authed-work' },
    });
    expect(authed.status()).toBe(201);
    const body = (await authed.json()) as { ok: boolean; workId: string };
    expect(body).toMatchObject({ ok: true, workId: 'authed-work' });
  });
});
