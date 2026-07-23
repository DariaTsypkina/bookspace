import { expect, test } from '@playwright/test';

type WebManifest = {
  name?: string;
  short_name?: string;
  start_url?: string;
  display?: string;
  theme_color?: string;
  background_color?: string;
  icons?: Array<{ src: string; sizes: string; type?: string }>;
};

test.describe('PWA install smoke (bd-6b7.1)', () => {
  test('HTML links to web app manifest', async ({ page }) => {
    await page.goto('/');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    const href = await manifestLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href!).toMatch(/manifest\.webmanifest/);
  });

  test('manifest is valid and installable', async ({ request, baseURL }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type'] ?? '').toMatch(/json|webmanifest/);

    const manifest = (await res.json()) as WebManifest;
    expect(manifest.name).toBe('Книжная вселенная');
    expect(manifest.short_name).toBe('Книжная');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);

    const sizes = (manifest.icons ?? []).map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    for (const icon of manifest.icons ?? []) {
      const iconUrl = new URL(icon.src, baseURL).pathname;
      const iconRes = await request.get(iconUrl);
      expect(iconRes.ok(), `icon ${icon.src}`).toBeTruthy();
      expect(iconRes.headers()['content-type'] ?? '').toMatch(/image\/png/);
    }
  });

  test('start_url opens app shell with nav', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Книжная вселенная/);
    await expect(
      page.getByRole('navigation', { name: 'Основное меню' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Главная', level: 1 }),
    ).toBeVisible();
  });

  test('apple touch icon is present for iOS A2HS', async ({ page }) => {
    await page.goto('/');
    const apple = page.locator('link[rel="apple-touch-icon"]');
    await expect(apple.first()).toHaveAttribute('href', /icons\/icon-192\.png/);
  });
});
