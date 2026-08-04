import { expect, test, type Page } from '@playwright/test';

async function expectMainNav(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Основное меню' });
  await expect(nav).toBeVisible();
  return nav;
}

function uniqueEmail() {
  return `library-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe('Library page smoke (S12 / bd-wus.15)', () => {
  test('guest: /library stub without legacy library-stub class', async ({
    page,
  }) => {
    await page.goto('/library');

    const heading = page.getByRole('heading', {
      name: 'Моя библиотека',
      level: 1,
    });
    await expect(heading).toBeVisible();
    await expect(
      page.getByText('Коллекция и полки скоро появятся.'),
    ).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('library-stub');
    expect(className).toMatch(/\bflex\b/);

    const nav = await expectMainNav(page);
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  test('guest: keeps reading-room foreground color on heading', async ({
    page,
  }) => {
    await page.goto('/library');

    const heading = page.getByRole('heading', {
      name: 'Моя библиотека',
      level: 1,
    });
    await expect(heading).toBeVisible();

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // --foreground #1c1917
    expect(color).toBe('rgb(28, 25, 23)');
  });

  test('authenticated user: Профиль → /library stub, aria-current', async ({
    page,
  }) => {
    const email = uniqueEmail();
    const password = 'Secure123!';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль', { exact: true }).fill(password);
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
      page.getByRole('heading', { name: 'Моя библиотека', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText('Коллекция и полки скоро появятся.'),
    ).toBeVisible();

    const main = page.locator('main');
    const className = (await main.getAttribute('class')) ?? '';
    expect(className.split(/\s+/)).not.toContain('library-stub');

    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('authenticated user: add library item form via BFF', async ({
    page,
  }) => {
    const email = uniqueEmail();
    const password = 'Secure123!';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/library');
    await page
      .getByLabel('Слаг произведения')
      .fill('garri-potter-filosofskiy-kamen');
    await page.getByLabel('Статус книги').selectOption('READING');
    await page.getByRole('button', { name: 'Сохранить в библиотеку' }).click();
    await expect(
      page.getByRole('status').filter({
        hasText: 'Статус сохранён',
      }),
    ).toBeVisible();
  });

  test('guest: add library item form asks to log in', async ({ page }) => {
    await page.goto('/library');
    await page
      .getByLabel('Слаг произведения')
      .fill('garri-potter-filosofskiy-kamen');
    await page.getByRole('button', { name: 'Сохранить в библиотеку' }).click();
    await expect(
      page.getByRole('status').filter({
        hasText: 'Войдите, чтобы добавить книгу в библиотеку',
      }),
    ).toBeVisible();
  });
});

test.describe('Library / Profile empty-page fix (bd-cq7.6)', () => {
  test('slow /api/auth/me: /login shows loading status then guest form (never blank)', async ({
    page,
  }) => {
    await page.route('**/api/auth/me', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.goto('/login');

    await expect(page.getByRole('status')).toContainText('Загрузка');
    await expect(page.locator('body')).not.toBeEmpty();

    await expect(
      page.getByRole('heading', { name: 'Вход', level: 1 }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
  });

  test('slow /api/auth/me: Профиль pending → /library stub visible in viewport', async ({
    page,
  }) => {
    await page.route('**/api/auth/me', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.goto('/');
    const nav = await expectMainNav(page);
    // Pending auth must not send users to a blank GuestOnly gate
    await expect(nav.getByRole('link', { name: 'Профиль' })).toHaveAttribute(
      'href',
      '/library',
    );
    await nav.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL('/library');

    const heading = page.getByRole('heading', {
      name: 'Моя библиотека',
      level: 1,
    });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (box && viewport) {
      expect(box.height).toBeGreaterThan(8);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThan(viewport.height);
    }
    await expect(
      page.getByText('Коллекция и полки скоро появятся.'),
    ).toBeVisible();
  });

  test('iPhone viewport: /library stub heading and body stay visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 }); // iPhone 17-ish
    await page.goto('/library');

    const heading = page.getByRole('heading', {
      name: 'Моя библиотека',
      level: 1,
    });
    await expect(heading).toBeVisible();
    await expect(
      page.getByText('Коллекция и полки скоро появятся.'),
    ).toBeVisible();

    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThan(8);
      expect(box.y).toBeLessThan(200);
    }
  });
});
