import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const globalsSource = readFileSync(path.join(__dirname, 'globals.css'), 'utf8');

describe('Home page Tailwind+shadcn migration (S1 / bd-wus.4)', () => {
  it('does not use legacy home-page class name', () => {
    expect(pageSource).not.toMatch(/className=["']home-page["']/);
    expect(pageSource).not.toMatch(/\bhome-page\b/);
  });

  it('uses Tailwind layout utilities and theme tokens', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/\bitems-center\b/);
    expect(pageSource).toMatch(/\bjustify-center\b/);
    expect(pageSource).toMatch(/text-foreground/);
  });

  it('uses shadcn Card for the title surface', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
  });

  it('keeps RU heading Главная as semantic h1', () => {
    expect(pageSource).toMatch(/<h1[^>]*>\s*Главная\s*<\/h1>/);
  });

  it('removes .home-page rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.home-page\b/);
  });
});
