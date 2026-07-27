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
});
