import { expect, test } from '@playwright/test';

const SPOILERS_OK_COOKIE = 'spoilers_ok';
const SPOILERS_OK_VALUE = '1';

async function acceptSpoilers(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    {
      name: SPOILERS_OK_COOKIE,
      value: SPOILERS_OK_VALUE,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
  ]);
}

test.describe('Character page smoke', () => {
  test('published character shows name and clickable appearances', async ({
    page,
  }) => {
    await page.goto('/characters/garri-potter');
    await expect(
      page.getByRole('heading', { name: 'Гарри Поттер' }),
    ).toBeVisible();
    await expect(page.getByText('Harry Potter')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Книги появления' }),
    ).toBeVisible();
    const bookLink = page.getByRole('link', {
      name: 'Гарри Поттер и философский камень',
    });
    await expect(bookLink).toBeVisible();
    await bookLink.click();
    await expect(page).toHaveURL(/\/books\/garri-potter-filosofskiy-kamen/);
  });

  test('character page has SEO title without login', async ({ page }) => {
    await page.goto('/characters/garri-potter');
    await expect(page).toHaveTitle(/Гарри Поттер — Книжная вселенная/);
  });

  test('unknown character returns not found for guest', async ({ page }) => {
    await page.goto('/characters/unknown-character-slug');
    await expect(
      page.getByRole('heading', { name: 'Персонаж не найден' }),
    ).toBeVisible();
  });

  test('relations are hidden until spoiler gate is accepted', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('/characters/garri-potter');

    await expect(
      page.getByRole('region', { name: 'Связи персонажа' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).not.toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).toBeVisible();

    await page.getByRole('button', { name: 'Показать' }).click();

    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('relations stay visible when spoilers_ok cookie is set', async ({
    page,
  }) => {
    await acceptSpoilers(page);
    await page.goto('/characters/garri-potter');

    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('relation link navigates to another character page', async ({
    page,
  }) => {
    await acceptSpoilers(page);
    await page.goto('/characters/garri-potter');
    await page.getByRole('link', { name: 'Гермиона Грейнджер' }).click();
    await expect(page).toHaveURL(/\/characters\/germiona-greindzher/);
    await expect(
      page.getByRole('heading', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();
  });
});
