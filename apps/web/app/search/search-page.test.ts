import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const formSource = readFileSync(
  path.join(__dirname, 'catalog-search-form.tsx'),
  'utf8',
);
const globalsSource = readFileSync(
  path.join(__dirname, '../globals.css'),
  'utf8',
);

describe('Search page Tailwind+shadcn migration (S5 / bd-wus.8)', () => {
  it('does not use legacy search-* class names on the page', () => {
    expect(pageSource).not.toMatch(/className=["']search-page["']/);
    expect(pageSource).not.toMatch(/\bsearch-header\b/);
    expect(pageSource).not.toMatch(/\bsearch-hints\b/);
    expect(pageSource).not.toMatch(/\bsearch-empty\b/);
    expect(pageSource).not.toMatch(/\bsearch-demo-queries\b/);
    expect(pageSource).not.toMatch(/\bsearch-error\b/);
    expect(pageSource).not.toMatch(/\bsearch-results\b/);
    expect(pageSource).not.toMatch(/\bsearch-result\b/);
    expect(pageSource).not.toMatch(/\bsearch-result-type\b/);
    expect(pageSource).not.toMatch(/\bsearch-result-link\b/);
  });

  it('does not use legacy search-form class names in CatalogSearchForm', () => {
    expect(formSource).not.toMatch(/className=["']search-form["']/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card on the page and Input/Label/Button in the form', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
    expect(formSource).toMatch(/from ['"]@\/components\/ui\/input['"]/);
    expect(formSource).toMatch(/from ['"]@\/components\/ui\/label['"]/);
    expect(formSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(formSource).toMatch(/\bInput\b/);
    expect(formSource).toMatch(/\bLabel\b/);
    expect(formSource).toMatch(/\bButton\b/);
  });

  it('keeps FTS UX: RU copy, search role, and result semantics', () => {
    expect(pageSource).toMatch(/<h1[^>]*>\s*Поиск\s*<\/h1>/);
    expect(pageSource).toMatch(/Ничего не найдено/);
    expect(pageSource).toMatch(/Начните с названия книги/);
    expect(pageSource).toMatch(/aria-label=["']Результаты поиска["']/);
    expect(pageSource).toMatch(/aria-label=["']Подсказки поиска["']/);
    expect(pageSource).toMatch(/role=["']alert["']/);
    expect(pageSource).toMatch(/CATALOG_ENTITY_TYPE_LABELS/);
    expect(pageSource).toMatch(/fetchCatalogSearch/);
    expect(pageSource).toMatch(/DEMO_SEARCH_QUERIES/);
    expect(formSource).toMatch(/role=["']search["']/);
    expect(formSource).toMatch(/Поисковый запрос/);
    expect(formSource).toMatch(/Найти/);
    expect(formSource).toMatch(/type=["']search["']/);
    expect(formSource).toMatch(/router\.push/);
  });

  it('removes orphan .search-* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.search-page\b/);
    expect(globalsSource).not.toMatch(/\.search-header\b/);
    expect(globalsSource).not.toMatch(/\.search-form\b/);
    expect(globalsSource).not.toMatch(/\.search-hints\b/);
    expect(globalsSource).not.toMatch(/\.search-empty\b/);
    expect(globalsSource).not.toMatch(/\.search-demo-queries\b/);
    expect(globalsSource).not.toMatch(/\.search-error\b/);
    expect(globalsSource).not.toMatch(/\.search-results\b/);
    expect(globalsSource).not.toMatch(/\.search-result\b/);
    expect(globalsSource).not.toMatch(/\.search-result-type\b/);
    expect(globalsSource).not.toMatch(/\.search-result-link\b/);
  });
});
