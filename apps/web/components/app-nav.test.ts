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

describe('AppNav auth action (bd-6b7.5)', () => {
  it('uses getNavAuthAction for guest login / auth logout visibility', () => {
    expect(appNavSource).toMatch(/getNavAuthAction/);
    expect(appNavSource).toMatch(/authAction\.label/);
    expect(appNavSource).toMatch(/authAction\.kind === ['"]login['"]/);
  });

  it('guest login is a link to /login inside Основное меню', () => {
    expect(appNavSource).toMatch(/authAction\.kind === ['"]login['"]/);
    expect(appNavSource).toMatch(/href=\{authAction\.href\}/);
  });

  it('logout reuses lib/auth logout (BFF) and does not invent a new endpoint', () => {
    expect(appNavSource).toMatch(
      /from ['"].*\/lib\/auth['"]|from ['"]\.\.\/lib\/auth['"]/,
    );
    expect(appNavSource).toMatch(/\blogout\b/);
    expect(appNavSource).not.toMatch(/\/api\/auth\/signout|\/auth\/sign-out/);
  });

  it('keeps five tab items via getNavItems (auth is not a tab-id)', () => {
    expect(appNavSource).toMatch(/getNavItems\(/);
    expect(appNavSource).not.toMatch(
      /id:\s*['"]login['"]|id:\s*['"]logout['"]/,
    );
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

  it('uses shadcn Button and cn helper', () => {
    expect(appNavSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(appNavSource).toMatch(/\bcn\(/);
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
