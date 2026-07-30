import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const globalsSource = readFileSync(
  path.join(__dirname, '../globals.css'),
  'utf8',
);

describe('Library page Tailwind+shadcn migration (S12 / bd-wus.15)', () => {
  it('does not use legacy library-stub class name on the page', () => {
    expect(pageSource).not.toMatch(/className=["']library-stub["']/);
    expect(pageSource).not.toMatch(/\blibrary-stub\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card on the page', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
    expect(pageSource).toMatch(/\bCardContent\b/);
  });

  it('keeps library stub UX: RU copy', () => {
    expect(pageSource).toMatch(/Моя библиотека/);
    expect(pageSource).toMatch(/Коллекция и полки скоро появятся/);
  });

  it('shows LogoutButton for signed-in profile destination (bd-6b7.8)', () => {
    expect(pageSource).toMatch(/LogoutButton/);
    expect(pageSource).toMatch(/from ['"]@\/components\/logout-button['"]/);
  });

  it('mounts AddLibraryItemForm (RHF + Zod migration)', () => {
    expect(pageSource).toMatch(/AddLibraryItemForm/);
    expect(pageSource).toMatch(/from ['"]\.\/add-library-item-form['"]/);
  });

  it('removes orphan .library-stub rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.library-stub\b/);
  });
});
