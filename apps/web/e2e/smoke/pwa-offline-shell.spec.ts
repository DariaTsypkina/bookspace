import { expect, type Page, test } from '@playwright/test';

async function waitForActiveServiceWorker(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    return Boolean(reg?.active);
  });
  // Second load under SW control so static assets enter Cache Storage.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => navigator.serviceWorker.controller != null);
}

test.describe('PWA offline shell smoke (bd-6b7.2)', () => {
  test('service worker script is served', async ({ request }) => {
    const res = await request.get('/sw.js');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('bookspace-shell-v2');
    expect(body).toContain('/offline');
  });

  test('/offline renders Russian fallback UI online', async ({ page }) => {
    await page.goto('/offline');
    await expect(
      page.getByRole('heading', { name: 'Нет сети', level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'На главную' })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Основное меню' }),
    ).toBeVisible();
  });

  test('offline reload of visited shell is not a white-screen', async ({
    page,
    context,
  }) => {
    await waitForActiveServiceWorker(page);
    await expect(
      page.getByRole('heading', { name: 'Главная', level: 1 }),
    ).toBeVisible();

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(0);

    const shellOrOffline = page
      .getByRole('navigation', { name: 'Основное меню' })
      .or(page.getByRole('heading', { name: 'Нет сети', level: 1 }));
    await expect(shellOrOffline).toBeVisible();
  });

  test('uncached navigation offline falls back to /offline', async ({
    page,
    context,
  }) => {
    await waitForActiveServiceWorker(page);

    await context.setOffline(true);
    const response = await page.goto('/books/never-cached-offline-bd-6b7-2', {
      waitUntil: 'domcontentloaded',
    });

    // SW serves /offline HTML (may keep requested URL or rewrite).
    expect(response?.status()).toBeLessThan(500);
    await expect(
      page.getByRole('heading', { name: 'Нет сети', level: 1 }),
    ).toBeVisible();
    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('API route abort + offline still avoids white-screen on miss', async ({
    page,
    context,
  }) => {
    await waitForActiveServiceWorker(page);

    // Playwright page.route bypasses SW for matched requests; abort API only.
    await page.route('**/api/**', (route) => route.abort('failed'));
    await context.setOffline(true);

    const response = await page.goto('/places/never-cached-offline-bd-6b7-2', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBeLessThan(500);

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(0);
    await expect(
      page.getByRole('heading', { name: 'Нет сети', level: 1 }),
    ).toBeVisible();
  });
});
