import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@bookspace.local');
  await page.getByLabel('Пароль', { exact: true }).fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Admin catalog entities CRUD smoke', () => {
  test('admin creates DRAFT series, publishes; soft-delete hides from public', async ({
    page,
  }) => {
    const suffix = `${Date.now()}-${test.info().project.name}`;
    const name = `PW Серия ${suffix}`;

    await loginAsAdmin(page);
    await page.goto('/admin/catalog');

    await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();
    await page.getByRole('tab', { name: 'Серии' }).click();

    await page.getByLabel('Название (RU)').fill(name);
    await page.getByRole('button', { name: 'Создать черновик' }).click();

    await expect(
      page.getByRole('button', { name: new RegExp(name) }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText('Статус: Черновик')).toBeVisible();

    await page.getByRole('button', { name: 'Опубликовать' }).click();
    await expect(page.getByText('Статус: Опубликовано')).toBeVisible({
      timeout: 10_000,
    });

    const publicLink = page.getByRole('link', { name: 'Открыть публично' });
    await expect(publicLink).toBeVisible();
    const href = await publicLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    await expect(page.getByRole('heading', { name: name })).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/admin/catalog');
    await page.getByRole('tab', { name: 'Серии' }).click();
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await page.getByRole('button', { name: 'Скрыть (soft-delete)' }).click();
    await page.getByRole('button', { name: 'Подтвердить скрытие' }).click();

    await expect(
      page.getByRole('button', { name: new RegExp(name) }),
    ).toHaveCount(0, { timeout: 10_000 });

    await page.goto(href!);
    await expect(page.getByText('Серия не найдена')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('admin can open Characters / Worlds / Places tabs', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/catalog');

    for (const label of ['Персонажи', 'Миры', 'Локации']) {
      await page.getByRole('tab', { name: label }).click();
      await expect(
        page.getByRole('button', { name: 'Создать черновик' }),
      ).toBeVisible();
    }
  });
});
