import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@bookspace.local');
  await page.getByLabel('Пароль', { exact: true }).fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Admin catalog CRUD smoke', () => {
  test('admin creates DRAFT, sets ExternalId, publishes; soft-delete hides from public', async ({
    page,
  }) => {
    const suffix = `${Date.now()}-${test.info().project.name}`;
    const title = `PW Каталог ${suffix}`;
    const externalKey = `pw-ol-${suffix}`;

    await loginAsAdmin(page);
    await page.goto('/admin/catalog');

    await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();

    await page.getByLabel('Название (RU)').fill(title);
    await page.getByRole('button', { name: 'Создать черновик' }).click();

    await expect(
      page.getByRole('button', { name: new RegExp(title) }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText('Статус: Черновик')).toBeVisible();

    await page.getByLabel('Ключ ExternalId').fill(externalKey);
    await page.getByRole('button', { name: 'Добавить' }).click();
    await expect(page.getByText(externalKey)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Опубликовать' }).click();
    await expect(page.getByText('Статус: Опубликовано')).toBeVisible({
      timeout: 10_000,
    });

    const publicLink = page.getByRole('link', { name: 'Открыть публично' });
    await expect(publicLink).toBeVisible();
    const href = await publicLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    await expect(page.getByRole('heading', { name: title })).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/admin/catalog');
    await page.getByRole('button', { name: new RegExp(title) }).click();
    await page.getByRole('button', { name: 'Скрыть (soft-delete)' }).click();
    await page.getByRole('button', { name: 'Подтвердить скрытие' }).click();

    await expect(
      page.getByRole('button', { name: new RegExp(title) }),
    ).toHaveCount(0, { timeout: 10_000 });

    await page.goto(href!);
    await expect(page.getByText('Произведение не найдено')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('guest is redirected from /admin/catalog to /login', async ({
    page,
  }) => {
    await page.goto('/admin/catalog');
    await expect(page).toHaveURL('/login');
  });
});
