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

test.describe('App nav smoke', () => {
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
