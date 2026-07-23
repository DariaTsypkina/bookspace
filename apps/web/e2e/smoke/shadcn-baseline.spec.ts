import { expect, test } from '@playwright/test';

test.describe('shadcn baseline smoke', () => {
  test('home keeps reading-room CSS variables after F2', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('navigation', { name: 'Основное меню' }),
    ).toBeVisible();

    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const read = (name: string) => styles.getPropertyValue(name).trim();
      return {
        background: read('--background'),
        accent: read('--accent'),
        surface: read('--surface'),
        border: read('--border'),
      };
    });

    expect(tokens.background.toLowerCase()).toBe('#f7f5f0');
    expect(tokens.accent.toLowerCase()).toBe('#292524');
    expect(['#ffffff', '#fff']).toContain(tokens.surface.toLowerCase());
    expect(tokens.border.toLowerCase()).toBe('#d6d3d1');
  });

  test('button default utility classes resolve to Bookspace accent', async ({
    page,
  }) => {
    await page.goto('/');

    const resolved = await page.evaluate(() => {
      const el = document.createElement('button');
      el.className = 'bg-accent text-foreground border border-border';
      el.textContent = 'Probe';
      el.setAttribute('data-testid', 'shadcn-button-probe');
      document.body.appendChild(el);
      const styles = getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderTopColor: styles.borderTopColor,
      };
    });

    // #292524 → rgb(41, 37, 36); #d6d3d1 → rgb(214, 211, 209)
    expect(resolved.backgroundColor).toBe('rgb(41, 37, 36)');
    expect(resolved.borderTopColor).toBe('rgb(214, 211, 209)');
  });

  test('surface card utility resolves to Bookspace surface', async ({
    page,
  }) => {
    await page.goto('/');

    const resolved = await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'bg-surface border border-border';
      document.body.appendChild(el);
      return getComputedStyle(el).backgroundColor;
    });

    expect(resolved).toBe('rgb(255, 255, 255)');
  });
});
