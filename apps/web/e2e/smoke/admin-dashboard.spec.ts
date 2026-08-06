import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@bookspace.local');
  await page.getByLabel('Пароль', { exact: true }).fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

async function loginAsUser(page: import('@playwright/test').Page) {
  const email = `pw-admin-dash-user-${Date.now()}-${test.info().project.name}@example.com`;
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
}

test.describe('Admin dashboard smoke', () => {
  test('admin sees dashboard counters and quick actions', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await expect(
      page.getByRole('heading', { name: 'Админ-дашборд' }),
    ).toBeVisible();
    await expect(page.getByText('MatchQueue OPEN')).toBeVisible();
    await expect(page.getByText(/ContextReading за \d+ дн\./)).toBeVisible();
    await expect(page.getByText('Failed jobs')).toBeVisible();

    const counters = page.getByRole('region', { name: 'Счётчики' });
    await expect(counters).toBeVisible();
    // Numeric values (or em-dash while loading finishes) render as text
    await expect(counters.locator('.tabular-nums').first()).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Быстрые действия' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Импорт каталога/ }),
    ).toHaveAttribute('href', '/admin/import');
    await expect(
      page.getByRole('link', { name: /Агрегация рейтингов/ }),
    ).toHaveAttribute('href', '/admin/rankings');
    await expect(
      page.getByRole('link', { name: /LLM context batch/ }),
    ).toHaveAttribute('href', '/admin/context');
  });

  test('guest is redirected from /admin to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });

  test('non-admin user is redirected from /admin to home', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/admin');
    await expect(page).toHaveURL('/');
  });
});
