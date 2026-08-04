import { expect, test, type Page } from '@playwright/test';

function uniqueEmail() {
  return `ubook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
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

test.describe('User book status/rating (bd-cq7.1)', () => {
  test('auth user sets status+rating on work; guest sees them on profile', async ({
    page,
  }) => {
    const { slug } = await registerAndLogin(page);

    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();

    const section = page.getByRole('region', { name: 'Статус и оценка' });
    await expect(section).toBeVisible();
    await section.getByLabel('Статус книги').selectOption('READ');
    await section.getByLabel('Оценка книги').fill('9');
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
    const list = page.getByRole('list', { name: 'Книги в коллекции' });
    await expect(list).toBeVisible();
    await expect(
      list.getByRole('link', { name: 'Гарри Поттер и философский камень' }),
    ).toBeVisible();
    await expect(list.getByText(/Прочитано/)).toBeVisible();
    await expect(list.getByText(/9\/10/)).toBeVisible();
  });

  test('guest on work page sees login prompt for status form', async ({
    page,
  }) => {
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    const section = page.getByRole('region', { name: 'Статус и оценка' });
    await expect(section).toBeVisible();
    await expect(
      section.getByRole('link', { name: 'Войдите' }),
    ).toHaveAttribute('href', '/login');
  });
});
