import { expect, test } from '@playwright/test';

test.describe('Home page smoke (S1 / bd-wus.4)', () => {
  test('renders RU Главная without legacy home-page class', async ({
    page,
  }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { name: 'Главная', level: 1 });
    await expect(heading).toBeVisible();
    await expect(page).toHaveTitle(/Книжная вселенная/);

    const main = page.locator('main');
    await expect(main).toBeVisible();
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('home-page');
    expect(className).toMatch(/\bflex\b/);
  });

  test('keeps centered reading-room layout on mobile and desktop', async ({
    page,
  }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { name: 'Главная', level: 1 });
    await expect(heading).toBeVisible();

    const box = await heading.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (!box || !viewport) {
      return;
    }

    const centerX = box.x + box.width / 2;
    expect(centerX).toBeGreaterThan(viewport.width * 0.35);
    expect(centerX).toBeLessThan(viewport.width * 0.65);

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // --foreground #1c1917
    expect(color).toBe('rgb(28, 25, 23)');
  });

  test('shell nav remains on home after migration', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('navigation', { name: 'Основное меню' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Основное меню' })
        .getByRole('link', {
          name: 'Главная',
        }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
