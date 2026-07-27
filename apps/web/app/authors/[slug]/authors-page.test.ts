import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const notFoundSource = readFileSync(
  path.join(__dirname, 'not-found.tsx'),
  'utf8',
);
const globalsSource = readFileSync(
  path.join(__dirname, '../../globals.css'),
  'utf8',
);

describe('Authors page Tailwind+shadcn migration (S7 / bd-wus.10)', () => {
  it('does not use legacy author-* class names on the page', () => {
    expect(pageSource).not.toMatch(/className=["']author-page["']/);
    expect(pageSource).not.toMatch(/\bauthor-header\b/);
    expect(pageSource).not.toMatch(/\bauthor-name-orig\b/);
    expect(pageSource).not.toMatch(/\bauthor-works\b/);
    expect(pageSource).not.toMatch(/\bauthor-work-link\b/);
    expect(pageSource).not.toMatch(/\bauthor-work-year\b/);
    expect(pageSource).not.toMatch(/\bauthor-works-empty\b/);
  });

  it('does not use legacy author-* class names on not-found', () => {
    expect(notFoundSource).not.toMatch(/className=["'][^"']*author-page/);
    expect(notFoundSource).not.toMatch(/\bauthor-not-found\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card for author works', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
  });

  it('keeps author page UX: RU copy, works region, catalog fetch', () => {
    expect(pageSource).toMatch(/author\.nameRu/);
    expect(pageSource).toMatch(/author\.nameOrig/);
    expect(pageSource).toMatch(/Книги/);
    expect(pageSource).toMatch(/aria-label=["']Книги автора["']/);
    expect(pageSource).toMatch(/fetchCatalogAuthor/);
    expect(pageSource).toMatch(/В каталоге пока нет опубликованных книг/);
    expect(notFoundSource).toMatch(/Автор не найден/);
    expect(notFoundSource).toMatch(/Вернуться к поиску/);
  });

  it('removes orphan .author-* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.author-page\b/);
    expect(globalsSource).not.toMatch(/\.author-header\b/);
    expect(globalsSource).not.toMatch(/\.author-name-orig\b/);
    expect(globalsSource).not.toMatch(/\.author-works\b/);
    expect(globalsSource).not.toMatch(/\.author-work-link\b/);
    expect(globalsSource).not.toMatch(/\.author-work-year\b/);
    expect(globalsSource).not.toMatch(/\.author-works-empty\b/);
    expect(globalsSource).not.toMatch(/\.author-not-found\b/);
  });
});
