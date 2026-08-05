import { expect, test } from '@playwright/test';

/** English Nest/Zod leftovers that must never appear in visible UI errors. */
const EN_ERROR_LEAK =
  /Unauthorized|Forbidden|Not Found|Bad Request|Too small:|Too big:|Invalid email|Invalid option:|Internal Server Error|Something went wrong/i;

async function expectNoEnglishErrorText(page: import('@playwright/test').Page) {
  const alerts = page.locator('main [role="alert"], main [role="status"]');
  const count = await alerts.count();
  for (let i = 0; i < count; i += 1) {
    const text = (await alerts.nth(i).innerText()).trim();
    if (!text) continue;
    expect(text, `alert/status #${i}`).not.toMatch(EN_ERROR_LEAK);
    expect(text, `alert/status #${i} must be RU`).toMatch(/[А-Яа-яЁё]/);
  }
}

test.describe('RU user-facing errors (bd-a12.1)', () => {
  test('login: Zod validation shows Russian, not English Zod text', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Пароль').fill('short');
    await page.getByRole('button', { name: 'Войти' }).click();

    const alerts = page.locator('main [role="alert"]');
    await expect(alerts.first()).toBeVisible();
    await expectNoEnglishErrorText(page);
    await expect(page.getByText(/email|символ/i).first()).toBeVisible();
  });

  test('login: invalid credentials show Russian API message', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('missing@bookspace.local');
    await page.getByLabel('Пароль').fill('Wrong123!');
    await page.getByRole('button', { name: 'Войти' }).click();

    const alert = page.locator('main [role="alert"]');
    await expect(alert).toContainText('Неверный email или пароль');
    await expectNoEnglishErrorText(page);
  });

  test('login: mocked Nest Unauthorized maps to Russian', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('user@bookspace.local');
    await page.getByLabel('Пароль').fill('Secure123!');
    await page.getByRole('button', { name: 'Войти' }).click();

    const alert = page.locator('main [role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Необходима авторизация');
    await expect(alert).not.toContainText('Unauthorized');
    await expectNoEnglishErrorText(page);
  });

  test('register: weak password shows Russian min length', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Email').fill('e2e-ru@bookspace.local');
    await page.getByLabel('Пароль').fill('weak');
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page.locator('main [role="alert"]').first()).toBeVisible();
    await expect(page.getByText(/8 символ/)).toBeVisible();
    await expectNoEnglishErrorText(page);
  });

  test('library: empty workSlug shows Russian, not Too small', async ({
    page,
  }) => {
    await page.goto('/library');
    await page.getByLabel('Книга для библиотеки').fill('');
    await page.getByRole('button', { name: 'Сохранить в библиотеку' }).click();

    await expect(page.getByText('Укажите слаг произведения')).toBeVisible();
    await expect(
      page.getByText('Too small: expected string to have >=1 characters'),
    ).toHaveCount(0);
    await expectNoEnglishErrorText(page);
  });

  test('auth/error page keeps Russian OAuth messages', async ({ page }) => {
    await page.goto('/auth/error?reason=oauth_failed&provider=yandex');
    const alert = page.locator('main [role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Не удалось войти через Яндекс');
    await expectNoEnglishErrorText(page);
  });
});
