import { expect, test } from '@playwright/test';

import {
  CANONICAL_E2E_BASE_URL,
  resolveSpoilerCookieDomain,
} from '../helpers/spoiler-cookie-domain';

const SPOILERS_OK_COOKIE = 'spoilers_ok';
const SPOILERS_OK_VALUE = '1';

async function acceptSpoilers(page: import('@playwright/test').Page) {
  const fallbackBaseUrl = process.env.BASE_URL ?? CANONICAL_E2E_BASE_URL;
  const domain = resolveSpoilerCookieDomain(page.url(), fallbackBaseUrl);
  await page.context().addCookies([
    {
      name: SPOILERS_OK_COOKIE,
      value: SPOILERS_OK_VALUE,
      domain,
      path: '/',
      sameSite: 'Lax',
    },
  ]);
}

test.describe('Reading order smoke (bd-azl.3)', () => {
  test('series reading order is gated and shows numbered steps', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('/series/garri-potter');
    await page.evaluate(() => {
      try {
        localStorage.removeItem('spoilers_ok');
      } catch {
        /* ignore */
      }
    });
    await page.reload();

    await expect(
      page.getByRole('region', { name: 'Книги серии' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Порядок чтения' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).toBeVisible();
    await expect(page.getByText('Шаг 1')).not.toBeVisible();
    await expect(page.getByText('Шаг 2')).not.toBeVisible();

    await page.getByRole('button', { name: 'Показать' }).click();

    await expect(page.getByText('Шаг 1')).toBeVisible();
    await expect(page.getByText('Шаг 2')).toBeVisible();
    const orderRegion = page.getByRole('region', { name: 'Порядок чтения' });
    await expect(
      orderRegion.getByRole('link', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();
    await expect(
      orderRegion.getByRole('link', {
        name: 'Гарри Поттер и Тайная комната',
      }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('series reading order stays visible with spoilers_ok cookie', async ({
    page,
  }) => {
    await acceptSpoilers(page);
    await page.goto('/series/garri-potter');

    await expect(page.getByText('Шаг 1')).toBeVisible();
    await expect(page.getByText('Шаг 2')).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('reading order is distinct from books inventory on series page', async ({
    page,
  }) => {
    await acceptSpoilers(page);
    await page.goto('/series/garri-potter');

    await expect(
      page.getByRole('region', { name: 'Книги серии' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Порядок чтения' }),
    ).toBeVisible();
    await expect(page.getByText('книга 1')).toBeVisible();
    await expect(page.getByText('Шаг 1')).toBeVisible();
  });

  test('book page shows numbered reading order behind spoiler gate', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await page.evaluate(() => {
      try {
        localStorage.removeItem('spoilers_ok');
      } catch {
        /* ignore */
      }
    });
    await page.reload();

    await expect(page.getByText('Могут быть спойлеры')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Порядок чтения' }),
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Показать' }).click();

    const orderRegion = page.getByRole('region', { name: 'Порядок чтения' });
    await expect(orderRegion).toBeVisible();
    await expect(orderRegion.getByText('Шаг 1')).toBeVisible();
    await expect(orderRegion.getByText('Шаг 2')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Связи произведений' }),
    ).toBeVisible();
    await expect(page.getByText('Продолжение')).toBeVisible();
  });

  test('reading order step link navigates to the work', async ({ page }) => {
    await acceptSpoilers(page);
    await page.goto('/series/garri-potter');
    await page
      .getByRole('region', { name: 'Порядок чтения' })
      .getByRole('link', { name: 'Гарри Поттер и Тайная комната' })
      .click();
    await expect(page).toHaveURL(/\/books\/garri-potter-taynaya-komnata/);
    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и Тайная комната',
      }),
    ).toBeVisible();
  });
});
