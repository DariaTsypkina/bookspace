import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@bookspace.local');
  await page.getByLabel('Пароль', { exact: true }).fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Admin catalog import smoke', () => {
  test('admin starts isbn_list job, sees report and MatchQueue link', async ({
    page,
  }) => {
    const isbn = `978${String(Date.now()).slice(-10)}`.slice(0, 13);
    // Pad/fix to 13 digits for unique-ish ISBN-like string
    const padded = (isbn + '0000000000000').slice(0, 13);

    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.getByRole('link', { name: /Импорт каталога/ }).click();
    await expect(page).toHaveURL('/admin/import');

    await expect(
      page.getByRole('heading', { name: 'Импорт каталога' }),
    ).toBeVisible();

    // Default source is isbn_list
    await page.getByLabel('Список ISBN').fill(padded);
    await page.getByRole('button', { name: 'Запустить' }).click();

    await expect(page.getByText(/Job id:/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('created')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Открыть MatchQueue' }),
    ).toHaveAttribute('href', '/admin/match-queue');
  });

  test('guest is redirected from /admin/import to /login', async ({ page }) => {
    await page.goto('/admin/import');
    await expect(page).toHaveURL('/login');
  });
});
