import { expect, test, type Page } from '@playwright/test';

function uniqueEmail() {
  return `user-lib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
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
  return { email };
}

test.describe('User library cabinet (bd-cq7.4)', () => {
  test('owner sees collection, filters by status, opens shelves and goal', async ({
    page,
  }) => {
    await registerAndLogin(page);
    await page.goto('/library');

    await expect(
      page.getByRole('heading', { name: 'Моя библиотека', level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Мои полки' })).toHaveAttribute(
      'href',
      '/library/shelves',
    );
    await expect(
      page.getByRole('link', { name: 'Цель на год' }),
    ).toHaveAttribute('href', '/library/goal');

    await expect(
      page.getByText('В коллекции пока пусто', { exact: false }),
    ).toBeVisible();

    await page
      .getByLabel('Слаг произведения')
      .fill('garri-potter-filosofskiy-kamen');
    await page.getByLabel('Статус книги').selectOption('READING');
    await page.getByRole('button', { name: 'Сохранить в библиотеку' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Статус сохранён' }),
    ).toBeVisible();

    const list = page.getByRole('list', { name: 'Список книг' });
    await expect(
      list.getByRole('link', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();
    await expect(list.getByText('Читаю')).toBeVisible();

    const filters = page.getByRole('group', { name: 'Фильтр по статусу' });
    await filters.getByRole('button', { name: 'Хочу прочитать' }).click();
    await expect(
      page.getByText('В коллекции пока пусто', { exact: false }),
    ).toBeVisible();

    await filters.getByRole('button', { name: 'Читаю' }).click();
    await expect(
      list.getByRole('link', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();

    await filters.getByRole('button', { name: 'Все' }).click();
    await expect(
      list.getByRole('link', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Мои полки' }).click();
    await expect(page).toHaveURL('/library/shelves');
    await expect(
      page.getByRole('heading', { name: 'Полки', level: 1 }),
    ).toBeVisible();

    await page.goto('/library');
    await page.getByRole('link', { name: 'Цель на год' }).click();
    await expect(page).toHaveURL('/library/goal');
    await expect(
      page.getByRole('heading', { name: 'Цель на год', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText('Цель чтения на год появится', { exact: false }),
    ).toBeVisible();
  });

  test('guest on /library sees login prompt for collection', async ({
    page,
  }) => {
    await page.goto('/library');
    await expect(
      page.getByRole('heading', { name: 'Моя библиотека', level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Войдите' })).toHaveAttribute(
      'href',
      '/login',
    );
    await expect(page.getByRole('link', { name: 'Мои полки' })).toHaveAttribute(
      'href',
      '/library/shelves',
    );
    await expect(
      page.getByRole('link', { name: 'Цель на год' }),
    ).toHaveAttribute('href', '/library/goal');
  });
});
