import { expect, test, type Page, type Request } from '@playwright/test';

function isAuthMeRequest(request: Request): boolean {
  const url = request.url();
  try {
    const path = new URL(url).pathname;
    return path === '/api/auth/me' || path.endsWith('/auth/me');
  } catch {
    return /\/api\/auth\/me(?:\?|$)/.test(url);
  }
}

async function countMeDuring(
  page: Page,
  action: () => Promise<void>,
): Promise<number> {
  let count = 0;
  const onRequest = (request: Request) => {
    if (request.method() === 'GET' && isAuthMeRequest(request)) {
      count += 1;
    }
  };
  page.on('request', onRequest);
  try {
    await action();
  } finally {
    page.off('request', onRequest);
  }
  return count;
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  await page.getByLabel('Email').fill('admin@bookspace.local');
  // exact: avoid PasswordInput toggle aria-label «Показать пароль» (bd-957.5)
  await page.getByLabel('Пароль', { exact: true }).fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

async function clickNav(page: Page, label: string, url: string) {
  const nav = page.getByRole('navigation', { name: 'Основное меню' });
  await nav.getByRole('link', { name: label }).click();
  await expect(page).toHaveURL(url);
}

test.describe('Auth Context — single /api/auth/me (bd-957.6)', () => {
  test('guest: one /me on load; nav clicks do not refetch', async ({
    page,
  }) => {
    const meOnLoad = await countMeDuring(page, async () => {
      await page.goto('/');
      await expect(
        page.getByRole('navigation', { name: 'Основное меню' }),
      ).toBeVisible();
      await expect(
        page
          .getByRole('navigation', { name: 'Основное меню' })
          .getByRole('link', { name: 'Профиль' }),
      ).toHaveAttribute('href', '/login');
    });
    expect(meOnLoad).toBe(1);

    const meOnNav = await countMeDuring(page, async () => {
      await clickNav(page, 'Поиск', '/search');
      await clickNav(page, 'Рейтинги', '/rankings');
      await clickNav(page, 'Поиск', '/search');
    });
    expect(meOnNav).toBe(0);
  });

  test('GuestOnly: authenticated user is redirected away from /login', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto('/login');
    await expect(page).not.toHaveURL('/login');
    await expect(page).toHaveURL(/\/u\//);
  });

  test('authed nav + logout: guest without /me on every menu click', async ({
    page,
  }) => {
    const meOnLoginFlow = await countMeDuring(page, async () => {
      await loginAsAdmin(page);
      const nav = page.getByRole('navigation', { name: 'Основное меню' });
      await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
        'href',
        '/library',
      );
    });
    expect(meOnLoginFlow).toBeGreaterThanOrEqual(1);
    expect(meOnLoginFlow).toBeLessThanOrEqual(2);

    const meOnAuthedNav = await countMeDuring(page, async () => {
      await clickNav(page, 'Поиск', '/search');
      await clickNav(page, 'Профиль', '/library');
    });
    expect(meOnAuthedNav).toBe(0);

    // Progressive logout → full remount; wait for mount /me to finish before counting.
    const meAfterLogout = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        isAuthMeRequest(response.request()),
    );
    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
    await meAfterLogout;

    const guestNav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(
      guestNav.getByRole('link', { name: 'Профиль' }),
    ).toHaveAttribute('href', '/login');

    const meAfterLogoutNav = await countMeDuring(page, async () => {
      await clickNav(page, 'Поиск', '/search');
      await clickNav(page, 'Рейтинги', '/rankings');
      await clickNav(page, 'Поиск', '/search');
    });
    expect(meAfterLogoutNav).toBe(0);
  });
});
