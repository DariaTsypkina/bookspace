import { expect, test } from '@playwright/test';

test.describe('Catalog search smoke', () => {
  test('empty search shows hints without dumping catalog', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('heading', { name: 'Поиск' })).toBeVisible();
    await expect(
      page.getByRole('searchbox', { name: 'Поисковый запрос' }),
    ).toBeVisible();
    await expect(page.getByText(/начните с названия книги/i)).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Результаты поиска' }),
    ).toHaveCount(0);
  });

  test('search finds published work with entity type label', async ({
    page,
  }) => {
    await page.goto('/search?q=гарри');
    await expect(
      page.getByRole('list', { name: 'Результаты поиска' }),
    ).toBeVisible();
    await expect(page.getByText('Произведение')).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: /гарри поттер и философский камень/i,
      }),
    ).toBeVisible();
  });

  test('search does not show draft works', async ({ page }) => {
    await page.goto('/search?q=черновик');
    await expect(page.getByText(/ничего не найдено/i)).toBeVisible();
  });

  test('search form submits new query', async ({ page }) => {
    await page.goto('/search');
    await page
      .getByRole('searchbox', { name: 'Поисковый запрос' })
      .fill('роулинг');
    await page.getByRole('button', { name: 'Найти' }).click();
    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(page.getByText('Автор')).toBeVisible();
  });

  test('prefix query finds full author name (роул → Роулинг)', async ({
    page,
  }) => {
    await page.goto('/search?q=роул');
    await expect(
      page.getByRole('list', { name: 'Результаты поиска' }),
    ).toBeVisible();
    await expect(page.getByText('Автор')).toBeVisible();
    await expect(page.getByRole('link', { name: /роулинг/i })).toBeVisible();
  });

  test('legacy query param still shows results (bd-6v0.11)', async ({
    page,
  }) => {
    await page.goto('/search?query=роулинг');
    await expect(
      page.getByRole('list', { name: 'Результаты поиска' }),
    ).toBeVisible();
    await expect(page.getByText('Автор')).toBeVisible();
    await expect(page.getByRole('link', { name: /роулинг/i })).toBeVisible();
  });

  test('native form submit works without JavaScript (bd-6v0.11)', async ({
    page,
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await context.newPage();
    await noJsPage.goto('/search');
    await noJsPage
      .getByRole('searchbox', { name: 'Поисковый запрос' })
      .fill('роулинг');
    await noJsPage.getByRole('button', { name: 'Найти' }).click();
    await expect(noJsPage).toHaveURL(/\/search\?q=/);
    await expect(noJsPage.getByText('Автор')).toBeVisible();
    await context.close();
  });
});
