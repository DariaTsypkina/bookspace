import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@bookspace.local');
  await page.getByLabel('Пароль', { exact: true }).fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Admin match queue smoke', () => {
  test('admin opens match queue page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/match-queue');

    await expect(
      page.getByRole('heading', { name: 'Очередь не сматченного' }),
    ).toBeVisible();
    await expect(page.getByText('Статус')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Обновить' })).toBeVisible();
  });

  test('guest is redirected from /admin/match-queue', async ({ page }) => {
    await page.goto('/admin/match-queue');
    await expect(page).toHaveURL('/login');
  });
});
