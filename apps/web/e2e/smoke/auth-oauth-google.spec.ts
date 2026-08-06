import { expect, test } from '@playwright/test';

test.describe('Google OAuth smoke', () => {
  test('login/register hide Google CTA; error page RU (bd-957.9)', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('link', { name: 'Войти через Google' }),
    ).toHaveCount(0);

    await page.goto('/register');
    await expect(
      page.getByRole('link', { name: 'Войти через Google' }),
    ).toHaveCount(0);

    await page.goto('/auth/error?reason=access_denied&provider=google');
    await expect(
      page.getByRole('heading', { name: 'Ошибка входа' }),
    ).toBeVisible();
    await expect(page.locator('main [role=alert]')).toContainText(
      'Вход через Google отменён',
    );
  });
});
