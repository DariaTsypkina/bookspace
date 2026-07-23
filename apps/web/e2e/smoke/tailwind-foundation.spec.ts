import { expect, test } from '@playwright/test';

test.describe('Tailwind foundation smoke', () => {
  test('home keeps shell and reading-room CSS variables', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('navigation', { name: 'Основное меню' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();
    await expect(page).toHaveTitle(/Книжная вселенная/);

    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const read = (name: string) => styles.getPropertyValue(name).trim();
      return {
        background: read('--background'),
        foreground: read('--foreground'),
        muted: read('--muted'),
        border: read('--border'),
        surface: read('--surface'),
        accent: read('--accent'),
      };
    });

    expect(tokens.background.toLowerCase()).toBe('#f7f5f0');
    expect(tokens.foreground.toLowerCase()).toBe('#1c1917');
    expect(tokens.muted.toLowerCase()).toBe('#57534e');
    expect(tokens.border.toLowerCase()).toBe('#d6d3d1');
    // Browsers may serialize #ffffff as #fff
    expect(['#ffffff', '#fff']).toContain(tokens.surface.toLowerCase());
    expect(tokens.accent.toLowerCase()).toBe('#292524');
  });

  test('login page still renders after Tailwind foundation', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
  });

  test('theme utility class resolves to token background', async ({ page }) => {
    await page.goto('/');

    const resolved = await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'bg-background text-foreground';
      el.setAttribute('data-testid', 'token-probe');
      document.body.appendChild(el);
      const styles = getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    // #f7f5f0 → rgb(247, 245, 240); #1c1917 → rgb(28, 25, 23)
    expect(resolved.backgroundColor).toBe('rgb(247, 245, 240)');
    expect(resolved.color).toBe('rgb(28, 25, 23)');
  });
});
