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
  test('admin sees context queue page on Tailwind+shadcn stack', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/context');
    await expect(
      page.getByRole('heading', { name: 'ContextReading' }),
    ).toBeVisible();
    await expect(
      page.getByText('Очередь недавних auto-published записей'),
    ).toBeVisible();
    // Stack signal: shadcn Button (accent) and Card (surface/border) utilities
    const saveOrEmpty = page
      .getByRole('button', { name: 'Сохранить' })
      .or(page.getByText('Нет свежих auto-published записей'));
    await expect(saveOrEmpty.first()).toBeVisible();
  });

  test('admin can edit and unpublish a recent reading', async ({ page }) => {
    const prefix = `pw-admin-context-${Date.now()}-${test.info().project.name}`;
    runFixture(prefix, 'seed');

    try {
      await loginAsAdmin(page);
      await page.goto('/admin/context');

      const subjectByHref = page.locator(`a[href="/books/${prefix}-subject"]`);
      const recByHref = page.locator(`a[href="/books/${prefix}-rec"]`);
      await expect(subjectByHref).toBeVisible();
      await expect(recByHref).toBeVisible();

      const card = page.locator('li').filter({ has: subjectByHref });
      const whyField = card.getByLabel('Почему (RU)');
      await whyField.fill('Обновлено в Playwright');
      await card.getByRole('button', { name: 'Сохранить' }).click();
      await expect(whyField).toHaveValue('Обновлено в Playwright');

      await card.getByRole('button', { name: 'Снять с публикации' }).click();
      await expect(subjectByHref).toHaveCount(0);
    } finally {
      runFixture(prefix, 'cleanup');
    }
  });

  test('guest is redirected from admin context', async ({ page }) => {
    await page.goto('/admin/context');
    await expect(page).toHaveURL('/login');
  });
});
