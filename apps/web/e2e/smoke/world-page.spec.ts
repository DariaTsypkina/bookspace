import { expect, test } from '@playwright/test';

test.describe('World page smoke', () => {
  test('published world shows name, description and clickable places', async ({
    page,
  }) => {
    await page.goto('/worlds/volshebnyy-mir');
    await expect(
      page.getByRole('heading', { name: 'Волшебный мир' }),
    ).toBeVisible();
    await expect(page.getByText('Wizarding World')).toBeVisible();
    await expect(page.getByText('Мир волшебников и магии.')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Локации мира' }),
    ).toBeVisible();
    const placeLink = page.getByRole('link', { name: 'Хогвартс' });
    await expect(placeLink).toBeVisible();
    await placeLink.click();
    await expect(page).toHaveURL(/\/places\/hogvarts/);
  });

  test('world page shows related books when present', async ({ page }) => {
    await page.goto('/worlds/volshebnyy-mir');
    await expect(
      page.getByRole('region', { name: 'Книги мира' }),
    ).toBeVisible();
    const bookLink = page.getByRole('link', {
      name: 'Гарри Поттер и философский камень',
    });
    await expect(bookLink).toBeVisible();
    await bookLink.click();
    await expect(page).toHaveURL(/\/books\/garri-potter-filosofskiy-kamen/);
  });

  test('world page has SEO title without login', async ({ page }) => {
    await page.goto('/worlds/volshebnyy-mir');
    await expect(page).toHaveTitle(/Волшебный мир — Книжная вселенная/);
  });

  test('unknown world returns not found for guest', async ({ page }) => {
    await page.goto('/worlds/unknown-world-slug');
    await expect(
      page.getByRole('heading', { name: 'Мир не найден' }),
    ).toBeVisible();
  });
});
