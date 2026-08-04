import { expect, test } from '@playwright/test';

async function expectPasswordToggle(page: import('@playwright/test').Page) {
  const password = page.getByLabel('Пароль', { exact: true });
  await expect(password).toBeVisible();
  await expect(password).toHaveAttribute('type', 'password');

  const show = page.getByRole('button', { name: 'Показать пароль' });
  await expect(show).toBeVisible();

  const box = await show.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(40);
  expect(box!.height).toBeGreaterThanOrEqual(40);

  await password.fill('Secret123!');
  await show.click();

  await expect(password).toHaveAttribute('type', 'text');
  await expect(password).toHaveValue('Secret123!');
  await expect(
    page.getByRole('button', { name: 'Скрыть пароль' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Скрыть пароль' }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await expect(
    page.getByRole('button', { name: 'Показать пароль' }),
  ).toBeVisible();
}

test.describe('Password visibility toggle (bd-957.5)', () => {
  test('toggles password on /login', async ({ page }) => {
    await page.goto('/login');
    await expectPasswordToggle(page);
  });

  test('toggles password on /register', async ({ page }) => {
    await page.goto('/register');
    await expectPasswordToggle(page);
  });
});
