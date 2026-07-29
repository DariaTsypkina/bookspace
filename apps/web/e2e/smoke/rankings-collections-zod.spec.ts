import { expect, test } from '@playwright/test';

test.describe('Rankings/Collections Zod stubs (bd-0t0.10)', () => {
  test('guest sees rankings stub without forms', async ({ page }) => {
    await page.goto('/rankings');
    await expect(page.getByRole('heading', { name: 'Рейтинги' })).toBeVisible();
    await expect(
      page.getByText('Публичные рейтинги скоро появятся.'),
    ).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('button')).toHaveCount(0);
    const nav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(nav.getByRole('link', { name: 'Рейтинги' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('guest sees collections stub without forms', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.getByRole('heading', { name: 'Подборки' })).toBeVisible();
    await expect(
      page.getByText('Подборки приложения скоро появятся.'),
    ).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('button')).toHaveCount(0);
    const nav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(nav.getByRole('link', { name: 'Подборки' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
