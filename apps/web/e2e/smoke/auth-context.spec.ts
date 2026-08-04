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

test.describe('Auth Context — single /api/auth/me (bd-957.6)', () => {
  test('guest: one /me on load; nav clicks do not refetch', async ({
    page,
  }) => {
    const meOnLoad = await countMeDuring(page, async () => {
      await page.goto('/');
      await expect(
        page.getByRole('navigation', { name: 'Основное меню' }),
      ).toBeVisible();
      // wait for session resolve (Профиль → /login for guest)
      await expect(
        page
          .getByRole('navigation', { name: 'Основное меню' })
          .getByRole('link', { name: 'Профиль' }),
      ).toHaveAttribute('href', '/login');
    });
    expect(meOnLoad).toBe(1);

    const nav = page.getByRole('navigation', { name: 'Основное меню' });
    const meOnNav = await countMeDuring(page, async () => {
      await nav.getByRole('link', { name: 'Поиск' }).click();
      await expect(page).toHaveURL('/search');
      await nav.getByRole('link', { name: 'Рейтинги' }).click();
      await expect(page).toHaveURL('/rankings');
      await nav.getByRole('link', { name: 'Подборки' }).click();
      await expect(page).toHaveURL('/collections');
      await nav.getByRole('link', { name: 'Главная' }).click();
      await expect(page).toHaveURL('/');
    });
    expect(meOnNav).toBe(0);
  });

  test('GuestOnly: authenticated user is redirected away from /login', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@bookspace.local');
    await page.getByLabel('Пароль').fill('Admin123!');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/login');
    // GuestOnly + Auth Context → profile redirect
    await expect(page).not.toHaveURL('/login');
    await expect(page).toHaveURL(/\/u\//);
  });

  test('authed nav + logout: guest without /me on every menu click', async ({
    page,
  }) => {
    const meOnLoginFlow = await countMeDuring(page, async () => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
      await page.getByLabel('Email').fill('admin@bookspace.local');
      await page.getByLabel('Пароль').fill('Admin123!');
      await page.getByRole('button', { name: 'Войти' }).click();
      await expect(page).toHaveURL('/');
      const nav = page.getByRole('navigation', { name: 'Основное меню' });
      await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
        'href',
        '/library',
      );
    });
    // Initial mount /me (+ possible remount after progressive login path).
    // After setUser from login, client nav must not add more /me for menu.
    expect(meOnLoginFlow).toBeGreaterThanOrEqual(1);
    expect(meOnLoginFlow).toBeLessThanOrEqual(2);

    const nav = page.getByRole('navigation', { name: 'Основное меню' });
    const meOnAuthedNav = await countMeDuring(page, async () => {
      await nav.getByRole('link', { name: 'Поиск' }).click();
      await expect(page).toHaveURL('/search');
      await nav.getByRole('link', { name: 'Профиль' }).click();
      await expect(page).toHaveURL('/library');
    });
    expect(meOnAuthedNav).toBe(0);

    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();

    const guestNav = page.getByRole('navigation', { name: 'Основное меню' });
    await expect(
      guestNav.getByRole('link', { name: 'Профиль' }),
    ).toHaveAttribute('href', '/login');

    const meAfterLogoutNav = await countMeDuring(page, async () => {
      await guestNav.getByRole('link', { name: 'Главная' }).click();
      await expect(page).toHaveURL('/');
      await guestNav.getByRole('link', { name: 'Поиск' }).click();
      await expect(page).toHaveURL('/search');
      await guestNav.getByRole('link', { name: 'Рейтинги' }).click();
      await expect(page).toHaveURL('/rankings');
    });
    expect(meAfterLogoutNav).toBe(0);
  });
});
