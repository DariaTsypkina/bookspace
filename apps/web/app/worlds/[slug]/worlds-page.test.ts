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

describe('Worlds page Tailwind+shadcn migration (S9 / bd-wus.12)', () => {
  it('does not use legacy world-* class names on the page', () => {
    expect(pageSource).not.toMatch(/className=["']world-page["']/);
    expect(pageSource).not.toMatch(/\bworld-header\b/);
    expect(pageSource).not.toMatch(/\bworld-name-orig\b/);
    expect(pageSource).not.toMatch(/\bworld-description\b/);
    expect(pageSource).not.toMatch(/\bworld-places\b/);
    expect(pageSource).not.toMatch(/\bworld-place-link\b/);
    expect(pageSource).not.toMatch(/\bworld-place-orig\b/);
    expect(pageSource).not.toMatch(/\bworld-places-empty\b/);
    expect(pageSource).not.toMatch(/\bworld-works\b/);
    expect(pageSource).not.toMatch(/\bworld-work-link\b/);
    expect(pageSource).not.toMatch(/\bworld-work-year\b/);
    expect(pageSource).not.toMatch(/\bworld-works-empty\b/);
  });

  it('does not use legacy world-* class names on not-found', () => {
    expect(notFoundSource).not.toMatch(/className=["'][^"']*world-page/);
    expect(notFoundSource).not.toMatch(/\bworld-not-found\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card for places and works', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
  });

  it('keeps world page UX: RU copy, regions, catalog fetch', () => {
    expect(pageSource).toMatch(/world\.nameRu/);
    expect(pageSource).toMatch(/world\.nameOrig/);
    expect(pageSource).toMatch(/world\.descriptionRu/);
    expect(pageSource).toMatch(/Локации/);
    expect(pageSource).toMatch(/aria-label=["']Локации мира["']/);
    expect(pageSource).toMatch(/Книги/);
    expect(pageSource).toMatch(/aria-label=["']Книги мира["']/);
    expect(pageSource).toMatch(/fetchCatalogWorld/);
    expect(pageSource).toMatch(
      /В каталоге пока нет опубликованных локаций этого мира/,
    );
    expect(pageSource).toMatch(
      /В каталоге пока нет опубликованных книг, связанных с этим миром/,
    );
    expect(notFoundSource).toMatch(/Мир не найден/);
    expect(notFoundSource).toMatch(/Вернуться к поиску/);
  });

  it('removes orphan .world-* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.world-page\b/);
    expect(globalsSource).not.toMatch(/\.world-header\b/);
    expect(globalsSource).not.toMatch(/\.world-name-orig\b/);
    expect(globalsSource).not.toMatch(/\.world-description\b/);
    expect(globalsSource).not.toMatch(/\.world-places\b/);
    expect(globalsSource).not.toMatch(/\.world-place-link\b/);
    expect(globalsSource).not.toMatch(/\.world-place-orig\b/);
    expect(globalsSource).not.toMatch(/\.world-places-empty\b/);
    expect(globalsSource).not.toMatch(/\.world-works\b/);
    expect(globalsSource).not.toMatch(/\.world-work-link\b/);
    expect(globalsSource).not.toMatch(/\.world-work-year\b/);
    expect(globalsSource).not.toMatch(/\.world-works-empty\b/);
    expect(globalsSource).not.toMatch(/\.world-not-found\b/);
  });
});
