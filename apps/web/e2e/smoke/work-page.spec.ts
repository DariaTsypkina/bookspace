import { expect, test } from '@playwright/test';

test.describe('Work page smoke', () => {
  test('published work shows title, authors and editions', async ({ page }) => {
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Дж. К. Роулинг' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Издания и переводы' }),
    ).toBeVisible();
    await expect(page.getByText('Русский')).toBeVisible();
    await expect(page.getByText(/М\. Спивак/)).toBeVisible();
    await expect(page.getByText(/ISBN 9785171234567/)).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Гарри Поттер' }),
    ).toBeVisible();
  });

  test('draft work returns not found for guest', async ({ page }) => {
    await page.goto('/books/garri-potter-draft');
    await expect(
      page.getByRole('heading', { name: 'Произведение не найдено' }),
    ).toBeVisible();
  });

  test('search result links to work page', async ({ page }) => {
    await page.goto('/search?q=гарри');
    await page
      .getByRole('link', { name: /гарри поттер и философский камень/i })
      .click();
    await expect(page).toHaveURL(/\/books\/garri-potter-filosofskiy-kamen/);
    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();
  });
});
