import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(path.join(__dirname, 'layout.tsx'), 'utf8');
const globalsSource = readFileSync(path.join(__dirname, 'globals.css'), 'utf8');

describe('Root layout shell Tailwind migration (bd-wus.18)', () => {
  it('does not use legacy app-shell / app-content class names', () => {
    expect(layoutSource).not.toMatch(/className=["']app-shell["']/);
    expect(layoutSource).not.toMatch(/className=["']app-content["']/);
    expect(layoutSource).not.toMatch(/\bapp-shell\b/);
    expect(layoutSource).not.toMatch(/\bapp-content\b/);
  });

  it('styles shell with flex column Tailwind utilities', () => {
    expect(layoutSource).toMatch(/\bflex\b/);
    expect(layoutSource).toMatch(/\bmin-h-full\b/);
    expect(layoutSource).toMatch(/\bflex-1\b/);
    expect(layoutSource).toMatch(/\bflex-col\b/);
  });

  it('reserves mobile bottom padding under fixed nav; clears at md+', () => {
    expect(layoutSource).toMatch(/pb-\[4\.25rem\]/);
    expect(layoutSource).toMatch(/\bmd:pb-0\b/);
  });

  it('keeps AppNav in the root shell', () => {
    expect(layoutSource).toMatch(/from ['"]\.\.\/components\/app-nav['"]/);
    expect(layoutSource).toMatch(/<AppNav\s*\/>/);
  });

  it('removes .app-shell and .app-content rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.app-shell\b/);
    expect(globalsSource).not.toMatch(/\.app-content\b/);
  });
});
