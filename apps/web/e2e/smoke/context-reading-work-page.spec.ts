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

test.describe('Work page context reading', () => {
  test('work without published context readings hides section', async ({
    page,
  }) => {
    await page.goto('/books/garri-potter-filosofskiy-kamen');
    await expect(
      page.getByRole('heading', {
        name: 'Гарри Поттер и философский камень',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Для понимания' }),
    ).not.toBeVisible();
  });

  test('work with published context readings shows block and disclaimer', async ({
    page,
  }) => {
    const prefix = `pw-work-context-${Date.now()}`;

    runFixture(prefix, 'seed');

    try {
      await page.goto(`/books/${prefix}-subject`);
      await expect(
        page.getByRole('region', { name: 'Для понимания' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Для понимания' }),
      ).toBeVisible();
      await expect(page.getByText(/автоматически/i)).toBeVisible();
      await expect(page.getByText('Playwright why text')).toBeVisible();
      await expect(page.getByRole('link', { name: 'PW Rec' })).toBeVisible();
      await expect(page.getByText(/https?:\/\//)).not.toBeVisible();
    } finally {
      runFixture(prefix, 'cleanup');
    }
  });
});
