import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const appNavSource = readFileSync(path.join(__dirname, 'app-nav.tsx'), 'utf8');
const globalsSource = readFileSync(
  path.join(__dirname, '../app/globals.css'),
  'utf8',
);

describe('AppNav Tailwind+shadcn migration (N1 / bd-wus.3)', () => {
  it('does not use legacy app-nav* class names', () => {
    expect(appNavSource).not.toMatch(/className=["']app-nav/);
    expect(appNavSource).not.toMatch(/['"]app-nav-list['"]/);
    expect(appNavSource).not.toMatch(/app-nav-link/);
  });

  it('uses Lucide icons for nav items', () => {
    expect(appNavSource).toMatch(/from ['"]lucide-react['"]/);
    expect(appNavSource).toMatch(/\bHome\b/);
    expect(appNavSource).toMatch(/\bSearch\b/);
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
