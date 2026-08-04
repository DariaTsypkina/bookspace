import { expect, test, type Page } from '@playwright/test';

function uniqueEmail() {
  return `tags-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
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

test.describe('User tags (bd-cq7.3)', () => {
  test('owner assigns tag on work; guest sees tag on public profile', async ({
    page,
  }) => {
    const { slug } = await registerAndLogin(page);

    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();

    const status = page.getByRole('region', { name: 'Статус и оценка' });
    await status.getByLabel('Статус книги').selectOption('READING');
    await status.getByRole('button', { name: 'Сохранить' }).click();
    await expect(
      status
        .getByRole('status')
        .filter({ hasText: 'Статус и оценка сохранены' }),
    ).toBeVisible();

    const tags = page.getByRole('region', { name: 'Теги' });
    await expect(tags).toBeVisible();
    await tags.getByLabel('Название тега').fill('фэнтези');
    await tags.getByRole('button', { name: 'Назначить тег' }).click();
    await expect(
      tags.getByRole('status').filter({ hasText: 'Тег назначен' }),
    ).toBeVisible();
    await expect(
      tags.getByRole('list', { name: 'Назначенные теги' }).getByText('фэнтези'),
    ).toBeVisible();

    await page.context().clearCookies();
    await page.goto(`/u/${slug}`);
    await expect(
      page.getByRole('heading', { name: 'Профиль', level: 1 }),
    ).toBeVisible();
    const list = page.getByRole('list', { name: 'Книги в коллекции' });
    await expect(
      list.getByRole('link', { name: 'Гарри Поттер и философский камень' }),
    ).toBeVisible();
    await expect(list.getByText(/Теги:\s*фэнтези/)).toBeVisible();
  });

  test('guest on work page sees login prompt for tags', async ({ page }) => {
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    const tags = page.getByRole('region', { name: 'Теги' });
    await expect(tags).toBeVisible();
    await expect(tags.getByRole('link', { name: 'Войдите' })).toHaveAttribute(
      'href',
      '/login',
    );
  });
});
