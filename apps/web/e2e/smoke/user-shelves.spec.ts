import { expect, test, type Page } from '@playwright/test';

function uniqueEmail() {
  return `shelves-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerAndLogin(page: Page) {
  const email = uniqueEmail();
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

  const me = await page.request.get('/api/auth/me');
  expect(me.ok()).toBeTruthy();
  const body = (await me.json()) as { slug: string };
  return { email, slug: body.slug };
}

test.describe('User shelves (bd-cq7.2)', () => {
  test('owner creates shelf, sees empty state, adds book; guest sees shelf on profile', async ({
    page,
  }) => {
    const { slug } = await registerAndLogin(page);

    await page.goto('/library');
    await page
      .getByLabel('Книга для библиотеки')
      .fill('Гарри Поттер и философский камень');
    await page
      .getByRole('button', { name: 'Гарри Поттер и философский камень' })
      .click();
    await page.getByLabel('Статус книги').selectOption('READING');
    await page.getByRole('button', { name: 'Сохранить в библиотеку' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Статус сохранён' }),
    ).toBeVisible();

    await page.goto('/library/shelves');
    await expect(
      page.getByRole('heading', { name: 'Полки', level: 1 }),
    ).toBeVisible();
    await page.getByLabel('Название полки').fill('Любимое');
    await page.getByRole('button', { name: 'Создать полку' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Полка создана' }),
    ).toBeVisible();

    const list = page.getByRole('list', { name: 'Список полок' });
    await expect(list.getByRole('link', { name: 'Любимое' })).toBeVisible();
    await list.getByRole('link', { name: 'Любимое' }).click();

    await expect(
      page.getByText('На полке пока пусто. Добавьте книгу из коллекции.'),
    ).toBeVisible();

    await page
      .getByLabel('Книга для полки')
      .fill('Гарри Поттер и философский камень');
    await page
      .getByRole('button', { name: 'Гарри Поттер и философский камень' })
      .click();
    await page.getByRole('button', { name: 'Добавить на полку' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Книга добавлена на полку' }),
    ).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Книги на полке' }).getByRole('link', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();

    await page.context().clearCookies();
    await page.goto(`/u/${slug}`);
    await expect(
      page.getByRole('heading', { name: 'Профиль', level: 1 }),
    ).toBeVisible();
    const shelves = page.getByRole('list', { name: 'Полки пользователя' });
    await expect(shelves.getByRole('link', { name: 'Любимое' })).toBeVisible();
    await shelves.getByRole('link', { name: 'Любимое' }).click();
    await expect(
      page.getByRole('heading', { name: 'Любимое', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();
  });

  test('guest on /library/shelves sees login prompt', async ({ page }) => {
    await page.goto('/library/shelves');
    await expect(
      page.getByRole('heading', { name: 'Полки', level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Войдите' })).toHaveAttribute(
      'href',
      '/login',
    );
  });
});
