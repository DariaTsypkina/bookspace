import { expect, test } from '@playwright/test';

import {
  CANONICAL_E2E_BASE_URL,
  resolveSpoilerCookieDomain,
} from '../helpers/spoiler-cookie-domain';

const SPOILERS_OK_COOKIE = 'spoilers_ok';
const SPOILERS_OK_VALUE = '1';

async function clearSpoilersConsent(page: import('@playwright/test').Page) {
  await page.context().clearCookies();
  await page.goto('/characters/garri-potter');
  await page.evaluate(() => {
    try {
      localStorage.removeItem('spoilers_ok');
    } catch {
      /* ignore */
    }
  });
  await page.reload();
}

async function setSpoilersCookie(page: import('@playwright/test').Page) {
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

test.describe('Spoiler gate smoke (bd-azl.4)', () => {
  test('hides spoiler content until accept; opens and persists after reload', async ({
    page,
  }) => {
    await clearSpoilersConsent(page);

    await expect(
      page.getByRole('region', { name: 'Предупреждение о спойлерах' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Показать' }).click();

    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();

    const cookieHeader = await page.evaluate(() => document.cookie);
    expect(cookieHeader).toMatch(/(?:^|;\s*)spoilers_ok=1(?:;|$)/);

    const storageValue = await page.evaluate(() =>
      localStorage.getItem('spoilers_ok'),
    );
    expect(storageValue).toBe('1');

    await page.reload();
    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('pre-set spoilers_ok cookie opens content without gate', async ({
    page,
  }) => {
    await setSpoilersCookie(page);
    await page.goto('/characters/garri-potter');

    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });

  test('localStorage alone keeps gate open after cookies cleared (fallback)', async ({
    page,
  }) => {
    await clearSpoilersConsent(page);
    await page.getByRole('button', { name: 'Показать' }).click();
    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();

    await page.context().clearCookies();
    await page.reload();

    await expect(
      page.getByRole('link', { name: 'Гермиона Грейнджер' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();

    const storageValue = await page.evaluate(() =>
      localStorage.getItem('spoilers_ok'),
    );
    expect(storageValue).toBe('1');
  });

  test('gate hides work relations on book page until accept', async ({
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
      page.getByRole('region', { name: 'Связи произведений' }),
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Показать' }).click();

    await expect(
      page.getByRole('region', { name: 'Связи произведений' }),
    ).toBeVisible();
    await expect(page.getByText('Могут быть спойлеры')).not.toBeVisible();
  });
});
