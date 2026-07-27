import { expect, test } from '@playwright/test';

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@bookspace.local`;

test.describe('Auth email/password e2e', () => {
  test('register then login sets session cookie via API', async ({
    page,
    context,
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

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === 'session');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
  });

  test('register shows error for weak password', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill('weak');
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page.locator('main').getByRole('alert')).toContainText(
      '8 символов',
    );
  });

  test('login shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('missing@bookspace.local');
    await page.getByLabel('Пароль').fill('Wrong123!');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.locator('main').getByRole('alert')).toContainText(
      'Неверный email или пароль',
    );
  });

  test('register shows error for duplicate email', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Secure123!';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/login');

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page.locator('main').getByRole('alert')).toContainText(
      'уже существует',
    );
  });
});
