import { expect, test } from '@playwright/test';

test.describe('Author page smoke', () => {
  test('published author shows name and clickable books', async ({ page }) => {
    await page.goto('/authors/dzh-k-rouling');
    await expect(
      page.getByRole('heading', { name: 'Дж. К. Роулинг' }),
    ).toBeVisible();
    await expect(page.getByText('J. K. Rowling')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Книги автора' }),
    ).toBeVisible();
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

  test('author page has SEO title without login', async ({ page }) => {
    await page.goto('/authors/dzh-k-rouling');
    await expect(page).toHaveTitle(/Дж\. К\. Роулинг — Книжная вселенная/);
  });

  test('unknown author returns not found for guest', async ({ page }) => {
    await page.goto('/authors/unknown-author-slug');
    await expect(
      page.getByRole('heading', { name: 'Автор не найден' }),
    ).toBeVisible();
  });

  test('work page author link navigates to author page', async ({ page }) => {
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await page.getByRole('link', { name: 'Дж. К. Роулинг' }).click();
    await expect(page).toHaveURL(/\/authors\/dzh-k-rouling/);
    await expect(
      page.getByRole('heading', { name: 'Дж. К. Роулинг' }),
    ).toBeVisible();
  });
});
