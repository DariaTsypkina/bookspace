import { expect, test } from '@playwright/test';

test.describe('Login page smoke (S2 / bd-wus.5)', () => {
  test('renders RU Вход without legacy auth-page class', async ({ page }) => {
    await page.goto('/login');

    const heading = page.getByRole('heading', { name: 'Вход', level: 1 });
    await expect(heading).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Пароль')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти через Google' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти через Яндекс' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Зарегистрироваться' }),
    ).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('auth-page');
    expect(className).toMatch(/\bflex\b/);
  });

  test('keeps reading-room foreground color on heading', async ({ page }) => {
    await page.goto('/login');

    const heading = page.getByRole('heading', { name: 'Вход', level: 1 });
    await expect(heading).toBeVisible();

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // --foreground #1c1917
    expect(color).toBe('rgb(28, 25, 23)');
  });

  test('OAuth links keep BFF hrefs for full navigation', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('link', { name: 'Войти через Google' }),
    ).toHaveAttribute('href', '/api/auth/google');
    await expect(
      page.getByRole('link', { name: 'Войти через Яндекс' }),
    ).toHaveAttribute('href', '/api/auth/yandex');
  });
});
