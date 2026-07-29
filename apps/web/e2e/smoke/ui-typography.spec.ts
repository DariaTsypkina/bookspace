import { expect, test } from '@playwright/test';

test.describe('UI typography Roboto (bd-82j)', () => {
  test('body and home heading use Roboto; no fonts.googleapis.com link', async ({
    page,
  }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { name: 'Главная', level: 1 });
    await expect(heading).toBeVisible();

    const bodyFont = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(bodyFont.toLowerCase()).toContain('roboto');
    expect(bodyFont.toLowerCase()).not.toMatch(/georgia/);

    const headingFont = await heading.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(headingFont.toLowerCase()).toContain('roboto');

    const googleFontsLinks = page.locator(
      'link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]',
    );
    await expect(googleFontsLinks).toHaveCount(0);
  });

  test('login heading uses Roboto', async ({ page }) => {
    await page.goto('/login');

    const heading = page.getByRole('heading', { name: 'Вход', level: 1 });
    await expect(heading).toBeVisible();

    const headingFont = await heading.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(headingFont.toLowerCase()).toContain('roboto');

    const bodyFont = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(bodyFont.toLowerCase()).toContain('roboto');
  });

  test('app nav labels remain readable with Roboto', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Главная' })).toBeVisible();

    const navFont = await nav.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(navFont.toLowerCase()).toContain('roboto');
  });
});
