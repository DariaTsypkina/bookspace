import { expect, test } from '@playwright/test';

test.describe('Profile page smoke (S11 / bd-wus.14)', () => {
  test('renders RU Профиль stub without legacy profile-stub class', async ({
    page,
  }) => {
    await page.goto('/u/demo-reader');

    const heading = page.getByRole('heading', { name: 'Профиль', level: 1 });
    await expect(heading).toBeVisible();
    await expect(page.getByText('demo-reader')).toBeVisible();
    await expect(page.getByText(/скоро появится/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('profile-stub');
    expect(className).toMatch(/\bflex\b/);
  });

  test('keeps reading-room foreground color on heading', async ({ page }) => {
    await page.goto('/u/demo-reader');

    const heading = page.getByRole('heading', { name: 'Профиль', level: 1 });
    await expect(heading).toBeVisible();

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // --foreground #1c1917
    expect(color).toBe('rgb(28, 25, 23)');
  });

  test('shell nav remains on profile after migration', async ({ page }) => {
    await page.goto('/u/demo-reader');
    await expect(
      page.getByRole('navigation', { name: 'Основное меню' }),
    ).toBeVisible();
  });
});
