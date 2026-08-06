import { expect, test, type Page } from '@playwright/test';
import { selectUserBookStatus } from '../helpers/select-user-book-status';

function uniqueEmail() {
  return `pubprof-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
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

test.describe('Public profile (bd-cq7.5)', () => {
  test('guest opens profile and user-context book without login; no goal without toggle', async ({
    page,
  }) => {
    const { slug } = await registerAndLogin(page);

    await page.goto('/books/garri-potter-filosofskiy-kamen');
    const section = page.getByRole('region', { name: 'Статус и оценка' });
    await selectUserBookStatus(page, 'READ', section);
    await section.getByLabel('Оценка книги').fill('8');
    await section.getByRole('button', { name: 'Сохранить' }).click();
    await expect(
      section
        .getByRole('status')
        .filter({ hasText: 'Статус и оценка сохранены' }),
    ).toBeVisible();

    await page.context().clearCookies();
    await page.goto(`/u/${slug}`);
    await expect(
      page.getByRole('heading', { name: 'Профиль', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('Публичная коллекция')).toBeVisible();
    await expect(page.getByLabel('Цель чтения на год')).toHaveCount(0);

    const list = page.getByRole('list', { name: 'Книги в коллекции' });
    const bookLink = list.getByRole('link', {
      name: 'Гарри Поттер и философский камень',
    });
    await expect(bookLink).toHaveAttribute(
      'href',
      `/u/${slug}/books/garri-potter-filosofskiy-kamen`,
    );
    await bookLink.click();

    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и философский камень',
        level: 1,
      }),
    ).toBeVisible();
    await expect(page.getByLabel('Статус и оценка владельца')).toContainText(
      /Прочитано/,
    );
    await expect(page.getByLabel('Статус и оценка владельца')).toContainText(
      /8\/10/,
    );
    await expect(
      page.getByRole('link', { name: 'Страница в каталоге' }),
    ).toHaveAttribute('href', '/books/garri-potter-filosofskiy-kamen');
  });

  test('guest sees not-found for unknown profile and missing book', async ({
    page,
  }) => {
    await page.goto('/u/нет-такого-пользователя-cq75');
    await expect(page.getByText('Профиль не найден.')).toBeVisible();

    await page.goto('/u/user/books/нет-такой-книги-cq75');
    await expect(page.getByText('Книга не найдена в коллекции.')).toBeVisible();
  });
});
