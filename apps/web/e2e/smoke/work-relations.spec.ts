import { expect, test } from '@playwright/test';

import {
  CANONICAL_E2E_BASE_URL,
  resolveSpoilerCookieDomain,
} from '../helpers/spoiler-cookie-domain';

const SPOILERS_OK_COOKIE = 'spoilers_ok';
const SPOILERS_OK_VALUE = '1';

/** Sets spoilers_ok for the current page host (or BASE_URL before first goto). */
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

test.describe('Work relations smoke (bd-azl.2)', () => {
  test('relations are hidden until spoiler gate is accepted', async ({
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

    await expect(
      page.getByRole('region', { name: 'Связи произведений' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Гарри Поттер и Тайная комната' }),
    ).not.toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).toBeVisible();

    await page.getByRole('button', { name: 'Показать' }).click();

    await expect(
      page.getByRole('link', { name: 'Гарри Поттер и Тайная комната' }),
    ).toBeVisible();
    await expect(page.getByText('Продолжение')).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('relations stay visible when spoilers_ok cookie is set', async ({
    page,
  }) => {
    await acceptSpoilers(page);
    await page.goto('/books/garri-potter-filosofskiy-kamen');

    await expect(
      page.getByRole('link', { name: 'Гарри Поттер и Тайная комната' }),
    ).toBeVisible();
    await expect(page.getByText('Продолжение')).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('relation link navigates to published related work', async ({
    page,
  }) => {
    await acceptSpoilers(page);
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await page
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
