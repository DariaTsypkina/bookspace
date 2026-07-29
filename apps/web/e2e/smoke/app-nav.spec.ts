import { expect, test, type Page } from '@playwright/test';

const TAB_LABELS = [
  'Главная',
  'Поиск',
  'Рейтинги',
  'Подборки',
  'Профиль',
] as const;

async function expectMainNav(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Основное меню' });
  await expect(nav).toBeVisible();
  for (const label of TAB_LABELS) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
  await expect(nav.getByRole('link', { name: /админ/i })).toHaveCount(0);
  return nav;
}

async function expectMigratedNavChrome(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Основное меню' });
  await expect(nav).toBeVisible();

  const className = (await nav.getAttribute('class')) ?? '';
  expect(className.split(/\s+/)).not.toContain('app-nav');
  expect(className).toMatch(/fixed|sticky/);

  // Lucide icons render as inline SVG next to RU labels (5 tabs)
  await expect(nav.locator('svg')).toHaveCount(5);

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

  test('guest sees five tabs; Профиль → /login', async ({ page }) => {
    await page.goto('/');
    const nav = await expectMainNav(page);
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'href',
      '/login',
    );
    await nav.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('guest has no Войти in menu; Профиль → /login', async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on('pageerror', (error) => {
      if (/hydration/i.test(error.message)) {
        hydrationErrors.push(error.message);
      }
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /hydration/i.test(msg.text())) {
        hydrationErrors.push(msg.text());
      }
    });

    await page.goto('/');
    const nav = await expectMainNav(page);
    await expect(nav.getByRole('link', { name: 'Войти' })).toHaveCount(0);
    await expect(nav.getByRole('button', { name: 'Выйти' })).toHaveCount(0);
    await page.waitForTimeout(400);
    expect(hydrationErrors).toEqual([]);
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'href',
      '/login',
    );
    await nav.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('all main-menu links share the same computed font-weight; active uses underline', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = await expectMainNav(page);

    const weights = await nav
      .locator('a')
      .evaluateAll((anchors) =>
        anchors.map((a) => getComputedStyle(a).fontWeight),
      );
    expect(weights.length).toBeGreaterThanOrEqual(5);
    expect(new Set(weights).size).toBe(1);

    const home = nav.getByRole('link', { name: 'Главная' });
    await expect(home).toHaveAttribute('aria-current', 'page');
    const decoration = await home.evaluate(
      (el) => getComputedStyle(el).textDecorationLine,
    );
    expect(decoration).toContain('underline');

    const search = nav.getByRole('link', { name: 'Поиск' });
    await expect(search).not.toHaveAttribute('aria-current', 'page');
    const searchDecoration = await search.evaluate(
      (el) => getComputedStyle(el).textDecorationLine,
    );
    expect(searchDecoration).not.toContain('underline');
  });

  test('active item is highlighted across tabs including rankings and collections', async ({
    page,
  }) => {
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

    await nav.getByRole('link', { name: 'Рейтинги' }).click();
    await expect(page).toHaveURL('/rankings');
    await expect(page.getByRole('heading', { name: 'Рейтинги' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Рейтинги' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await nav.getByRole('link', { name: 'Подборки' }).click();
    await expect(page).toHaveURL('/collections');
    await expect(page.getByRole('heading', { name: 'Подборки' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Подборки' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('authenticated user: Профиль → /library; Выйти on library clears session', async ({
    page,
    context,
  }) => {
    // Seeded admin avoids flaky register under parallel / rate-limit pressure
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@bookspace.local');
    await page.getByLabel('Пароль').fill('Admin123!');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');

    const nav = await expectMainNav(page);
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'href',
      '/library',
    );
    await expect(nav.getByRole('link', { name: 'Войти' })).toHaveCount(0);
    await expect(nav.getByRole('button', { name: 'Выйти' })).toHaveCount(0);

    await nav.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL('/library');
    await expect(
      page.getByRole('heading', { name: 'Моя библиотека' }),
    ).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    const logoutButton = page.getByRole('button', { name: 'Выйти' });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();

    const afterLogout = await context.cookies();
    const session = afterLogout.find((cookie) => cookie.name === 'session');
    expect(session === undefined || session.value === '').toBe(true);

    const guestNav = await expectMainNav(page);
    await expect(
      guestNav.getByRole('link', { name: 'Профиль' }),
    ).toHaveAttribute('href', '/login');
    await expect(guestNav.getByRole('button', { name: 'Выйти' })).toHaveCount(
      0,
    );
  });

  test('nav has no /admin entry; on /admin* no tab is active', async ({
    page,
  }) => {
    await page.goto('/search');
    const nav = await expectMainNav(page);
    const hrefs = await nav
      .locator('a')
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
    expect(hrefs.every((href) => href && !href.startsWith('/admin'))).toBe(
      true,
    );

    // Guest would be redirected to /login; use seeded admin to stay on /admin*
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@bookspace.local');
    await page.getByLabel('Пароль').fill('Admin123!');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/admin/context');
    await expect(
      page.getByRole('heading', { name: 'ContextReading' }),
    ).toBeVisible();
    const adminNav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(adminNav).toBeVisible();
    for (const label of TAB_LABELS) {
      await expect(
        adminNav.getByRole('link', { name: label }),
      ).not.toHaveAttribute('aria-current', 'page');
    }
    await expect(adminNav.getByRole('link', { name: /админ/i })).toHaveCount(0);
  });
});
