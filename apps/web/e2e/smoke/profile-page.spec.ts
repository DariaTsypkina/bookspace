import { expect, test } from '@playwright/test';

test.describe('Profile page smoke (S11 / bd-wus.14 + bd-cq7.1)', () => {
  test('renders RU Профиль for seeded user without legacy profile-stub class', async ({
    page,
  }) => {
    await page.goto('/u/user');

    const heading = page.getByRole('heading', { name: 'Профиль', level: 1 });
    await expect(heading).toBeVisible();
    await expect(page.getByText('Публичная коллекция')).toBeVisible();
    await expect(page.getByText('user').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('profile-stub');
    expect(className).toMatch(/\bflex\b/);
  });

  test('keeps reading-room foreground color on heading', async ({ page }) => {
    await page.goto('/u/user');

    const heading = page.getByRole('heading', { name: 'Профиль', level: 1 });
    await expect(heading).toBeVisible();

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // --foreground #1c1917
    expect(color).toBe('rgb(28, 25, 23)');
  });

  test('shell nav remains on profile after migration', async ({ page }) => {
    await page.goto('/u/user');
    await expect(
      page.getByRole('navigation', { name: 'Основное меню' }),
    ).toBeVisible();
  });

  test('invalid empty-ish slug shows Профиль не найден', async ({ page }) => {
    await page.goto('/u/%20%20%20');
    await expect(
      page.getByRole('heading', { name: 'Профиль', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('Профиль не найден.')).toBeVisible();
  });

  test('oversized slug shows Профиль не найден', async ({ page }) => {
    const oversized = 'a'.repeat(201);
    await page.goto(`/u/${oversized}`);
    await expect(
      page.getByRole('heading', { name: 'Профиль', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('Профиль не найден.')).toBeVisible();
  });

  test('unknown user slug shows Профиль не найден', async ({ page }) => {
    await page.goto('/u/demo-reader-missing-xyz');
    await expect(page.getByText('Профиль не найден.')).toBeVisible();
  });
});
