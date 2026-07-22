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

describe('Places page Tailwind+shadcn migration (S10 / bd-wus.13)', () => {
  it('does not use legacy place-* class names on the page', () => {
    expect(pageSource).not.toMatch(/className=["']place-page["']/);
    expect(pageSource).not.toMatch(/\bplace-header\b/);
    expect(pageSource).not.toMatch(/\bplace-name-orig\b/);
    expect(pageSource).not.toMatch(/\bplace-world\b/);
    expect(pageSource).not.toMatch(/\bplace-world-link\b/);
    expect(pageSource).not.toMatch(/\bplace-world-orig\b/);
    expect(pageSource).not.toMatch(/\bplace-works\b/);
    expect(pageSource).not.toMatch(/\bplace-work-link\b/);
    expect(pageSource).not.toMatch(/\bplace-work-year\b/);
    expect(pageSource).not.toMatch(/\bplace-works-empty\b/);
  });

  it('does not use legacy place-* class names on not-found', () => {
    expect(notFoundSource).not.toMatch(/className=["'][^"']*place-page/);
    expect(notFoundSource).not.toMatch(/\bplace-not-found\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card for world and works', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
  });

  it('keeps place page UX: RU copy, regions, catalog fetch', () => {
    expect(pageSource).toMatch(/place\.nameRu/);
    expect(pageSource).toMatch(/place\.nameOrig/);
    expect(pageSource).toMatch(/Мир/);
    expect(pageSource).toMatch(/aria-label=["']Мир локации["']/);
    expect(pageSource).toMatch(/Книги/);
    expect(pageSource).toMatch(/aria-label=["']Книги локации["']/);
    expect(pageSource).toMatch(/fetchCatalogPlace/);
    expect(pageSource).toMatch(
      /В каталоге пока нет опубликованных книг, связанных с этой локацией/,
    );
    expect(notFoundSource).toMatch(/Локация не найдена/);
    expect(notFoundSource).toMatch(/Вернуться к поиску/);
  });

  it('removes orphan .place-* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.place-page\b/);
    expect(globalsSource).not.toMatch(/\.place-header\b/);
    expect(globalsSource).not.toMatch(/\.place-name-orig\b/);
    expect(globalsSource).not.toMatch(/\.place-world\b/);
    expect(globalsSource).not.toMatch(/\.place-world-link\b/);
    expect(globalsSource).not.toMatch(/\.place-world-orig\b/);
    expect(globalsSource).not.toMatch(/\.place-works\b/);
    expect(globalsSource).not.toMatch(/\.place-work-link\b/);
    expect(globalsSource).not.toMatch(/\.place-work-year\b/);
    expect(globalsSource).not.toMatch(/\.place-works-empty\b/);
    expect(globalsSource).not.toMatch(/\.place-not-found\b/);
  });
});
