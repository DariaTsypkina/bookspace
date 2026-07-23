import { expect, test, type Page } from '@playwright/test';

const uniqueEmail = () =>
  `e2e-nav-${Date.now()}-${Math.random().toString(36).slice(2)}@bookspace.local`;

async function expectMainNav(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Основное меню' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Главная' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Поиск' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Профиль' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Рейтинги' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'Подборки' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: /админ/i })).toHaveCount(0);
  return nav;
}

async function expectMigratedNavChrome(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Основное меню' });
  await expect(nav).toBeVisible();

  const className = (await nav.getAttribute('class')) ?? '';
  expect(className.split(/\s+/)).not.toContain('app-nav');
  expect(className).toMatch(/fixed|sticky/);

  // Lucide icons render as inline SVG next to RU labels
  await expect(nav.locator('svg')).toHaveCount(3);

  const box = await nav.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!box || !viewport) {
    return;
  }

  const isMobile = viewport.width < 768;
  if (isMobile) {
    expect(box.y + box.height).toBeGreaterThan(viewport.height - 120);
  } else {
    expect(box.y).toBeLessThan(80);
  }
}

test.describe('App nav smoke', () => {
  test('migrated chrome: no legacy class, Lucide icons, mobile bottom / desktop top', async ({
    page,
  }) => {
    await page.goto('/');
    await expectMigratedNavChrome(page);
  });

  test('root content reserves mobile bottom padding; desktop clears it', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(nav).toBeVisible();

    const paddingBottomPx = await page.evaluate(() => {
      const navEl = document.querySelector('nav[aria-label="Основное меню"]');
      const content = navEl?.nextElementSibling;
      if (!content) {
        return null;
      }
      return parseFloat(getComputedStyle(content).paddingBottom);
    });

    expect(paddingBottomPx).not.toBeNull();
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (paddingBottomPx == null || !viewport) {
      return;
    }

    const isMobile = viewport.width < 768;
    if (isMobile) {
      // 4.25rem ≈ 68px at 16px root
      expect(paddingBottomPx).toBeGreaterThanOrEqual(64);
      expect(paddingBottomPx).toBeLessThanOrEqual(80);
    } else {
      expect(paddingBottomPx).toBe(0);
    }
  });

  test('guest sees Главная · Поиск · Профиль; Профиль → /login', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = await expectMainNav(page);
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'href',
      '/login',
    );
    await nav.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('active item is highlighted on home and search', async ({ page }) => {
    await page.goto('/');
    const nav = await expectMainNav(page);
    await expect(nav.getByRole('link', { name: 'Главная' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.getByRole('link', { name: 'Поиск' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );

    await nav.getByRole('link', { name: 'Поиск' }).click();
    await expect(page).toHaveURL('/search');
    await expect(nav.getByRole('link', { name: 'Поиск' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      nav.getByRole('link', { name: 'Главная' }),
    ).not.toHaveAttribute('aria-current', 'page');
  });

  test('authenticated user: Профиль → /library stub', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Secure123!';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');

    const nav = await expectMainNav(page);
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'href',
      '/library',
    );
    await nav.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL('/library');
    await expect(
      page.getByRole('heading', { name: 'Моя библиотека' }),
    ).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('nav is absent of /admin entry on public pages', async ({ page }) => {
    await page.goto('/search');
    const nav = await expectMainNav(page);
    const hrefs = await nav
      .locator('a')
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
    expect(hrefs.every((href) => href && !href.startsWith('/admin'))).toBe(
      true,
    );
  });
});
