import { expect, test } from '@playwright/test';

test.describe('Place page smoke', () => {
  test('published place shows name, world link and clickable books', async ({
    page,
  }) => {
    await page.goto('/places/hogvarts');
    await expect(page.getByRole('heading', { name: 'Хогвартс' })).toBeVisible();
    await expect(page.getByText('Hogwarts')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Мир локации' }),
    ).toBeVisible();
    const worldLink = page.getByRole('link', { name: 'Волшебный мир' });
    await expect(worldLink).toBeVisible();
    await worldLink.click();
    await expect(page).toHaveURL(/\/worlds\/volshebnyy-mir/);

    await page.goto('/places/hogvarts');
    await expect(
      page.getByRole('region', { name: 'Книги локации' }),
    ).toBeVisible();
    const bookLink = page.getByRole('link', {
      name: 'Гарри Поттер и философский камень',
    });
    await expect(bookLink).toBeVisible();
    await bookLink.click();
    await expect(page).toHaveURL(/\/books\/garri-potter-filosofskiy-kamen/);
  });

  test('place with world but no books shows empty books section', async ({
    page,
  }) => {
    await page.goto('/places/kosoy-pereulok');
    await expect(
      page.getByRole('heading', { name: 'Косой переулок' }),
    ).toBeVisible();
    await expect(page.getByText('Diagon Alley')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Мир локации' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Волшебный мир' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Книги локации' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'В каталоге пока нет опубликованных книг, связанных с этой локацией.',
      ),
    ).toBeVisible();
  });

  test('place page has SEO title without login', async ({ page }) => {
    await page.goto('/places/hogvarts');
    await expect(page).toHaveTitle(/Хогвартс — Книжная вселенная/);
  });

  test('unknown place returns not found for guest', async ({ page }) => {
    await page.goto('/places/unknown-place-slug');
    await expect(
      page.getByRole('heading', { name: 'Локация не найдена' }),
    ).toBeVisible();
  });
});
