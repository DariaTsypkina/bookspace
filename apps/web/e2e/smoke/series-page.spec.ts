import { expect, test } from '@playwright/test';

test.describe('Series page smoke', () => {
  test('published series shows name, position and clickable books', async ({
    page,
  }) => {
    await page.goto('/series/garri-potter');
    await expect(
      page.getByRole('heading', { name: 'Гарри Поттер' }),
    ).toBeVisible();
    await expect(page.getByText('Harry Potter')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Книги серии' }),
    ).toBeVisible();
    await expect(page.getByText('книга 1')).toBeVisible();
    const bookLink = page.getByRole('link', {
      name: 'Гарри Поттер и философский камень',
    });
    await expect(bookLink).toBeVisible();
    await bookLink.click();
    await expect(page).toHaveURL(/\/books\/garri-potter-filosofskiy-kamen/);
    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();
  });

  test('series page has SEO title without login', async ({ page }) => {
    await page.goto('/series/garri-potter');
    await expect(page).toHaveTitle(/Гарри Поттер — Книжная вселенная/);
  });

  test('unknown series returns not found for guest', async ({ page }) => {
    await page.goto('/series/unknown-series-slug');
    await expect(
      page.getByRole('heading', { name: 'Серия не найдена' }),
    ).toBeVisible();
  });

  test('work page series link navigates to series page', async ({ page }) => {
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await page.getByRole('link', { name: 'Гарри Поттер' }).click();
    await expect(page).toHaveURL(/\/series\/garri-potter/);
    await expect(
      page.getByRole('heading', { name: 'Гарри Поттер' }),
    ).toBeVisible();
  });
});
