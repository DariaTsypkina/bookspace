import { expect, test } from '@playwright/test';

test.describe('Auth error page smoke (S4 / bd-wus.7)', () => {
  test('renders RU Oшибка входа without legacy auth-page class', async ({
    page,
  }) => {
    await page.goto('/auth/error?reason=access_denied&provider=google');

    const heading = page.getByRole('heading', {
      name: 'Ошибка входа',
      level: 1,
    });
    await expect(heading).toBeVisible();
    await expect(page.locator('main [role=alert]')).toContainText(
      'Вход через Google отменён',
    );
    await expect(
      page.getByRole('link', { name: 'Вернуться ко входу' }),
    ).toHaveAttribute('href', '/login');

    const main = page.locator('main');
    await expect(main).toBeVisible();
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('auth-page');
    expect(className).toMatch(/\bflex\b/);
  });

  test('keeps reading-room foreground color on heading', async ({ page }) => {
    await page.goto('/auth/error?reason=oauth_failed&provider=yandex');

    const heading = page.getByRole('heading', {
      name: 'Ошибка входа',
      level: 1,
    });
    await expect(heading).toBeVisible();

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // --foreground #1c1917
    expect(color).toBe('rgb(28, 25, 23)');
  });

  test('shows RU message for Yandex access_denied', async ({ page }) => {
    await page.goto('/auth/error?reason=access_denied&provider=yandex');

    await expect(page.locator('main [role=alert]')).toContainText(
      'Вход через Яндекс отменён',
    );
  });
});
