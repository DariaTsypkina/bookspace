import { expect, test } from '@playwright/test';

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@bookspace.local`;

test.describe('Auth redirect to profile', () => {
  test('authenticated user is redirected from /login and /register to /u/[slug]', async ({
    page,
  }) => {
    const email = uniqueEmail();
    const password = 'Secure123!';
    const expectedSlug = email.split('@')[0]!;

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/login');
    await expect(page).toHaveURL(`/u/${expectedSlug}`);
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    await expect(page.getByText(expectedSlug)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Вход' })).toHaveCount(0);

    await page.goto('/register');
    await expect(page).toHaveURL(`/u/${expectedSlug}`);
    await expect(
      page.getByRole('heading', { name: 'Регистрация' }),
    ).toHaveCount(0);
  });
});
