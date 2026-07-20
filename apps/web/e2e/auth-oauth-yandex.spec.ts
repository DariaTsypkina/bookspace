import { expect, test } from '@playwright/test';

test.describe('Yandex OAuth', () => {
  test('login page shows Yandex button', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('link', { name: 'Войти через Яндекс' }),
    ).toBeVisible();
  });

  test('register page shows Yandex button', async ({ page }) => {
    await page.goto('/register');
    await expect(
      page.getByRole('link', { name: 'Войти через Яндекс' }),
    ).toBeVisible();
  });

  test('successful Yandex login via test mode sets session cookie', async ({
    page,
    context,
  }) => {
    const email = `pw-yandex-${Date.now()}@bookspace.local`;
    const id = `pw-ya-${Date.now()}`;
    const code = `oauth_test:${email}:${id}`;

    const response = await page.goto(
      `/api/auth/yandex/callback?code=${encodeURIComponent(code)}`,
    );
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/$/);

    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === 'session');
    expect(session).toBeTruthy();
    expect(session?.httpOnly).toBe(true);
  });

  test('cancel redirects to auth error with Russian message', async ({
    page,
  }) => {
    await page.goto('/api/auth/yandex/callback?error=access_denied');
    await expect(page).toHaveURL(/\/auth\/error/);
    await expect(
      page.getByRole('heading', { name: 'Ошибка входа' }),
    ).toBeVisible();
    await expect(page.locator('.auth-error')).toContainText(
      'Вход через Яндекс отменён',
    );
    await expect(
      page.getByRole('link', { name: 'Вернуться ко входу' }),
    ).toBeVisible();
  });
});
