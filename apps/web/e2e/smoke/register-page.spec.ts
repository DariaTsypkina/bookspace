import { expect, test } from '@playwright/test';

test.describe('Register page smoke (S3 / bd-wus.6)', () => {
  test('renders RU Регистрация without legacy auth-page class', async ({
    page,
  }) => {
    await page.goto('/register');

    const heading = page.getByRole('heading', {
      name: 'Регистрация',
      level: 1,
    });
    await expect(heading).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Пароль', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Зарегистрироваться' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти через Google' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Войти через Яндекс' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Войти', exact: true }),
    ).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('auth-page');
    expect(className).toMatch(/\bflex\b/);
  });

  test('keeps reading-room foreground color on heading', async ({ page }) => {
    await page.goto('/register');

    const heading = page.getByRole('heading', {
      name: 'Регистрация',
      level: 1,
    });
    await expect(heading).toBeVisible();

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // --foreground #1c1917
    expect(color).toBe('rgb(28, 25, 23)');
  });

  test('does not expose OAuth BFF hrefs in page markup (bd-957.9)', async ({
    page,
  }) => {
    await page.goto('/register');

    await expect(page.locator('a[href="/api/auth/google"]')).toHaveCount(0);
    await expect(page.locator('a[href="/api/auth/yandex"]')).toHaveCount(0);
  });
});
