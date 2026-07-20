import { expect, test } from '@playwright/test';

test.describe('Auth pages smoke', () => {
  test('login page renders Russian UI for guest', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Пароль')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Зарегистрироваться' }),
    ).toBeVisible();
  });

  test('register page renders Russian UI for guest', async ({ page }) => {
    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: 'Регистрация' }),
    ).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Пароль')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Зарегистрироваться' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
  });

  test('profile stub page renders Russian placeholder', async ({ page }) => {
    await page.goto('/u/demo-reader');
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    await expect(page.getByText('demo-reader')).toBeVisible();
    await expect(page.getByText(/скоро появится/i)).toBeVisible();
  });
});
