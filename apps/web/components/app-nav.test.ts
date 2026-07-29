import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const appNavSource = readFileSync(path.join(__dirname, 'app-nav.tsx'), 'utf8');
const globalsSource = readFileSync(
  path.join(__dirname, '../app/globals.css'),
  'utf8',
);

describe('AppNav equal font-weight (bd-6b7.6)', () => {
  it('puts font-semibold on shared navItemClassName for all menu controls', () => {
    const shared = appNavSource.match(
      /const navItemClassName = cn\(([\s\S]*?)\);/,
    );
    expect(shared?.[1]).toMatch(/font-semibold/);
  });

  it('does not gate font-semibold on isActive; active uses underline/color only', () => {
    const activeBranch = appNavSource.match(
      /isActive\s*&&\s*\n?\s*['"`]([^'"`]+)['"`]/,
    );
    expect(activeBranch?.[1]).toBeTruthy();
    expect(activeBranch?.[1]).not.toMatch(
      /font-semibold|font-medium|font-bold/,
    );
    expect(activeBranch?.[1]).toMatch(/underline/);
    expect(activeBranch?.[1]).toMatch(/text-foreground/);
  });
});

describe('AppNav auth placement (bd-6b7.8)', () => {
  it('does not render Войти/Выйти in the tab-bar (auth lives in profile/library)', () => {
    expect(appNavSource).not.toMatch(/getNavAuthAction/);
    expect(appNavSource).not.toMatch(/authAction/);
    expect(appNavSource).not.toMatch(/['"]Войти['"]|['"]Выйти['"]/);
    expect(appNavSource).not.toMatch(/\blogout\b/);
  });

  it('keeps five tab items via getNavItems only', () => {
    expect(appNavSource).toMatch(/getNavItems\(/);
    expect(appNavSource).not.toMatch(
      /id:\s*['"]login['"]|id:\s*['"]logout['"]/,
    );
  });
});

describe('AppNav hydration-safe links (bd-6b7.7)', () => {
  it('does not wrap nav Links in Button asChild (Slot SSR mismatch on Next 16.2)', () => {
    expect(appNavSource).toMatch(/buttonVariants/);
    expect(appNavSource).not.toMatch(/\basChild\b\s*=/);
  });
});

describe('AppNav Tailwind+shadcn migration (N1 / bd-wus.3)', () => {
  it('does not use legacy app-nav* class names', () => {
    expect(appNavSource).not.toMatch(/className=["']app-nav/);
    expect(appNavSource).not.toMatch(/['"]app-nav-list['"]/);
    expect(appNavSource).not.toMatch(/app-nav-link/);
  });

  it('uses Lucide icons for all five nav items', () => {
    expect(appNavSource).toMatch(/from ['"]lucide-react['"]/);
    expect(appNavSource).toMatch(/\bHome\b/);
    expect(appNavSource).toMatch(/\bSearch\b/);
    expect(appNavSource).toMatch(/\bTrophy\b/);
    expect(appNavSource).toMatch(/\bLayers\b/);
    expect(appNavSource).toMatch(/\bUser\b/);
  });

  it('uses buttonVariants and cn helper (no Button wrapper on links)', () => {
    expect(appNavSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(appNavSource).toMatch(/buttonVariants/);
    expect(appNavSource).toMatch(/\bcn\(/);
    expect(appNavSource).not.toMatch(/\bButton\b/);
  });

  it('styles nav with Tailwind token utilities (fixed mobile / sticky desktop)', () => {
    expect(appNavSource).toMatch(/\bfixed\b/);
    expect(appNavSource).toMatch(/\bmd:sticky\b|\bsticky\b/);
    expect(appNavSource).toMatch(/bg-surface|border-border|text-muted/);
  });

  it('removes .app-nav* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.app-nav\b/);
    expect(globalsSource).not.toMatch(/\.app-nav-list\b/);
    expect(globalsSource).not.toMatch(/\.app-nav-link\b/);
  });
});
