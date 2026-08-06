import { expect, test } from '@playwright/test';

test.describe('UI typography Baskerville (bd-23j)', () => {
  test('body and home heading use Baskerville; no fonts.googleapis.com link', async ({
    page,
  }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { name: 'Главная', level: 1 });
    await expect(heading).toBeVisible();

    const bodyFont = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(bodyFont.toLowerCase()).toContain('baskerville');
    expect(bodyFont.toLowerCase()).not.toMatch(/georgia/);
    expect(bodyFont.toLowerCase()).not.toMatch(/roboto/);

    const headingFont = await heading.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(headingFont.toLowerCase()).toContain('baskerville');

    const googleFontsLinks = page.locator(
      'link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]',
    );
    await expect(googleFontsLinks).toHaveCount(0);
  });

  test('login heading uses Baskerville', async ({ page }) => {
    await page.goto('/login');

    const heading = page.getByRole('heading', { name: 'Вход', level: 1 });
    await expect(heading).toBeVisible();

    const headingFont = await heading.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(headingFont.toLowerCase()).toContain('baskerville');

    const bodyFont = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(bodyFont.toLowerCase()).toContain('baskerville');
  });

  test('login button and input use Baskerville (bd-p3l)', async ({ page }) => {
    await page.goto('/login');

    const email = page.getByLabel('Email');
    await expect(email).toBeVisible();
    const emailFont = await email.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(emailFont.toLowerCase()).toContain('baskerville');

    const submit = page.getByRole('button', { name: 'Войти' });
    await expect(submit).toBeVisible();
    const submitFont = await submit.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(submitFont.toLowerCase()).toContain('baskerville');
  });

  test('app nav labels remain readable with Baskerville', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Главная' })).toBeVisible();

    const navFont = await nav.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(navFont.toLowerCase()).toContain('baskerville');
  });
});
