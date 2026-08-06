import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@bookspace.local');
  await page.getByLabel('Пароль', { exact: true }).fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Admin work merge smoke', () => {
  test('shows irreversibility warning and merges two works', async ({
    page,
  }) => {
    const suffix = `${Date.now()}-${test.info().project.name}`;
    const canonTitle = `PW Merge Canon ${suffix}`;
    const dupTitle = `PW Merge Dup ${suffix}`;

    await loginAsAdmin(page);

    await page.goto('/admin/catalog');
    await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();

    await page.getByLabel('Название (RU)').fill(canonTitle);
    await page.getByRole('button', { name: 'Создать черновик' }).click();
    await expect(
      page.getByRole('button', { name: new RegExp(canonTitle) }),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByLabel('Название (RU)').fill(dupTitle);
    await page.getByRole('button', { name: 'Создать черновик' }).click();
    await expect(
      page.getByRole('button', { name: new RegExp(dupTitle) }),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: 'Объединить дубли' }).click();
    await expect(page).toHaveURL(/\/admin\/catalog\/merge/);
    await expect(
      page.getByRole('heading', { name: 'Объединение дублей' }),
    ).toBeVisible();

    await expect(page.getByTestId('merge-irreversible-warning')).toContainText(
      'Операция необратима',
    );

    await page.getByLabel('Канон (останется)').click();
    await page.getByRole('option', { name: new RegExp(canonTitle) }).click();

    await page.getByLabel('Дубликат (будет объединён)').click();
    await page.getByRole('option', { name: new RegExp(dupTitle) }).click();

    await expect(page.getByText(canonTitle).first()).toBeVisible();
    await expect(page.getByText(dupTitle).first()).toBeVisible();

    const mergeBtn = page.getByTestId('merge-confirm-button');
    await mergeBtn.click();
    await expect(mergeBtn).toHaveText('Подтвердить необратимое объединение');
    await mergeBtn.click();

    await expect(page.getByTestId('merge-success')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('merge-success')).toContainText('Объединено');
  });

  test('guest is redirected from /admin/catalog/merge to /login', async ({
    page,
  }) => {
    await page.goto('/admin/catalog/merge');
    await expect(page).toHaveURL('/login');
  });
});
