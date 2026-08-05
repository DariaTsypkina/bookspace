import { expect, test } from '@playwright/test';

test.describe('Auth pages smoke', () => {
  test('login page renders Russian UI for guest', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Пароль', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти через Google' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти через Яндекс' }),
    ).toBeVisible();
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
    await expect(page.getByLabel('Пароль', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Зарегистрироваться' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти через Google' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти через Яндекс' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войти', exact: true }),
    ).toBeVisible();
  });

  test('profile page renders Russian public collection for seeded user', async ({
    page,
  }) => {
    await page.goto('/u/user');
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    await expect(page.getByText('Публичная коллекция')).toBeVisible();
    await expect(page.getByText('user').first()).toBeVisible();
  });
});
