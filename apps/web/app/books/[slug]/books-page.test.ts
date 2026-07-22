import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const notFoundSource = readFileSync(
  path.join(__dirname, 'not-found.tsx'),
  'utf8',
);
const contextSectionSource = readFileSync(
  path.join(__dirname, '../../../components/work-context-reading-section.tsx'),
  'utf8',
);
const globalsSource = readFileSync(
  path.join(__dirname, '../../globals.css'),
  'utf8',
);

describe('Books page Tailwind+shadcn migration (S6 / bd-wus.9)', () => {
  it('does not use legacy work-* / edition-* class names on the page', () => {
    expect(pageSource).not.toMatch(/className=["']work-page["']/);
    expect(pageSource).not.toMatch(/\bwork-header\b/);
    expect(pageSource).not.toMatch(/\bwork-authors\b/);
    expect(pageSource).not.toMatch(/\bwork-year\b/);
    expect(pageSource).not.toMatch(/\bwork-series\b/);
    expect(pageSource).not.toMatch(/\bwork-editions\b/);
    expect(pageSource).not.toMatch(/\bedition-language\b/);
    expect(pageSource).not.toMatch(/\bedition-translator\b/);
    expect(pageSource).not.toMatch(/\bedition-isbn\b/);
    expect(pageSource).not.toMatch(/\bedition-publisher\b/);
    expect(pageSource).not.toMatch(/\bedition-year\b/);
  });

  it('does not use legacy work-* class names on not-found', () => {
    expect(notFoundSource).not.toMatch(/className=["'][^"']*work-page/);
    expect(notFoundSource).not.toMatch(/\bwork-not-found\b/);
  });

  it('does not use legacy work-context-reading class names', () => {
    expect(contextSectionSource).not.toMatch(/\bwork-context-reading\b/);
    expect(contextSectionSource).not.toMatch(
      /\bwork-context-reading-disclaimer\b/,
    );
    expect(contextSectionSource).not.toMatch(/\bwork-context-reading-title\b/);
    expect(contextSectionSource).not.toMatch(/\bwork-context-reading-why\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card for editions and ContextReading items', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
    expect(contextSectionSource).toMatch(
      /from ['"]@\/components\/ui\/card['"]/,
    );
    expect(contextSectionSource).toMatch(/\bCard\b/);
  });

  it('keeps work page UX: RU copy, editions region, ContextReading wiring', () => {
    expect(pageSource).toMatch(/work\.titleRu/);
    expect(pageSource).toMatch(/Год первого издания/);
    expect(pageSource).toMatch(/Издания и переводы/);
    expect(pageSource).toMatch(/aria-label=["']Издания и переводы["']/);
    expect(pageSource).toMatch(/WorkContextReadingSection/);
    expect(pageSource).toMatch(/fetchCatalogContextReadings/);
    expect(pageSource).toMatch(/fetchCatalogWork/);
    expect(notFoundSource).toMatch(/Произведение не найдено/);
    expect(notFoundSource).toMatch(/Вернуться к поиску/);
    expect(contextSectionSource).toMatch(/aria-label=["']Для понимания["']/);
    expect(contextSectionSource).toMatch(/Для понимания/);
    expect(contextSectionSource).toMatch(/CONTEXT_READING_DISCLAIMER/);
  });

  it('removes orphan .work-* / .edition-* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.work-page\b/);
    expect(globalsSource).not.toMatch(/\.work-header\b/);
    expect(globalsSource).not.toMatch(/\.work-authors\b/);
    expect(globalsSource).not.toMatch(/\.work-year\b/);
    expect(globalsSource).not.toMatch(/\.work-series\b/);
    expect(globalsSource).not.toMatch(/\.work-editions\b/);
    expect(globalsSource).not.toMatch(/\.work-context-reading\b/);
    expect(globalsSource).not.toMatch(/\.work-context-reading-disclaimer\b/);
    expect(globalsSource).not.toMatch(/\.work-context-reading-title\b/);
    expect(globalsSource).not.toMatch(/\.work-context-reading-why\b/);
    expect(globalsSource).not.toMatch(/\.work-not-found\b/);
    expect(globalsSource).not.toMatch(/\.edition-language\b/);
    expect(globalsSource).not.toMatch(/\.edition-translator\b/);
    expect(globalsSource).not.toMatch(/\.edition-isbn\b/);
    expect(globalsSource).not.toMatch(/\.edition-publisher\b/);
    expect(globalsSource).not.toMatch(/\.edition-year\b/);
  });
});
