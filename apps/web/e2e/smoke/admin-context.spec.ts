import { execSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../../..');
const fixtureScript = path.join(
  repoRoot,
  'apps/api/test/fixtures/admin-context-fixture.ts',
);

function runFixture(prefix: string, action: 'seed' | 'cleanup') {
  execSync(
    `pnpm --filter api exec tsx "${fixtureScript}" ${prefix} ${action}`,
    { cwd: repoRoot, stdio: 'inherit' },
  );
}

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@bookspace.local');
  await page.getByLabel('Пароль').fill('Admin123!');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Admin context smoke', () => {
  test('admin sees context queue page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/context');
    await expect(
      page.getByRole('heading', { name: 'ContextReading' }),
    ).toBeVisible();
    await expect(
      page.getByText('Очередь недавних auto-published записей'),
    ).toBeVisible();
  });

  test('admin can edit and unpublish a recent reading', async ({ page }) => {
    const prefix = `pw-admin-context-${Date.now()}`;
    runFixture(prefix, 'seed');

    try {
      await loginAsAdmin(page);
      await page.goto('/admin/context');
      await expect(page.getByText('PW Subject')).toBeVisible();
      await expect(page.getByText('PW Rec')).toBeVisible();

      const whyField = page.getByLabel('Почему (RU)').first();
      await whyField.fill('Обновлено в Playwright');
      await page.getByRole('button', { name: 'Сохранить' }).first().click();
      await expect(whyField).toHaveValue('Обновлено в Playwright');

      await page
        .getByRole('button', { name: 'Снять с публикации' })
        .first()
        .click();
      await expect(page.getByText('PW Subject')).not.toBeVisible();
    } finally {
      runFixture(prefix, 'cleanup');
    }
  });

  test('guest is redirected from admin context', async ({ page }) => {
    await page.goto('/admin/context');
    await expect(page).toHaveURL('/login');
  });
});
