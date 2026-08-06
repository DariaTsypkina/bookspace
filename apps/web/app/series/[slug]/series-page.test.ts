import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const notFoundSource = readFileSync(
  path.join(__dirname, 'not-found.tsx'),
  'utf8',
);

describe('Series page (bd-azl.1)', () => {
  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card for series works', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
  });

  it('keeps series page UX: RU copy, works region, position, catalog fetch', () => {
    expect(pageSource).toMatch(/series\.nameRu/);
    expect(pageSource).toMatch(/series\.nameOrig/);
    expect(pageSource).toMatch(/Книги/);
    expect(pageSource).toMatch(/aria-label=["']Книги серии["']/);
    expect(pageSource).toMatch(/fetchCatalogSeries/);
    expect(pageSource).toMatch(/positionInSeries/);
    expect(pageSource).toMatch(/книга \$\{work\.positionInSeries\}/);
    expect(pageSource).toMatch(/В каталоге пока нет опубликованных книг/);
    expect(notFoundSource).toMatch(/Серия не найдена/);
    expect(notFoundSource).toMatch(/Вернуться к поиску/);
  });

  it('shows reading order behind SpoilerGate as numbered steps (bd-azl.3)', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/spoiler-gate['"]/);
    expect(pageSource).toMatch(/\bSpoilerGate\b/);
    expect(pageSource).toMatch(/aria-label=["']Порядок чтения["']/);
    expect(pageSource).toMatch(/Порядок чтения/);
    expect(pageSource).toMatch(/series\.readingOrder\.length > 0/);
    expect(pageSource).toMatch(/Шаг \{step\.step\}/);
    expect(pageSource).toMatch(/href=\{`\/books\/\$\{step\.slug\}`\}/);
    expect(pageSource).toMatch(/hasSpoilersConsent/);
    expect(pageSource).toMatch(/SPOILERS_OK_COOKIE/);
    // Distinct from books inventory list
    expect(pageSource).toMatch(/aria-label=["']Книги серии["']/);
  });
});
