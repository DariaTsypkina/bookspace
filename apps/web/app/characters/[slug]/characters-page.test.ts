import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const notFoundSource = readFileSync(
  path.join(__dirname, 'not-found.tsx'),
  'utf8',
);
const spoilerGateSource = readFileSync(
  path.join(__dirname, '../../../components/spoiler-gate.tsx'),
  'utf8',
);
const globalsSource = readFileSync(
  path.join(__dirname, '../../globals.css'),
  'utf8',
);

describe('Characters page Tailwind+shadcn migration (S8 / bd-wus.11)', () => {
  it('does not use legacy character-* class names on the page', () => {
    expect(pageSource).not.toMatch(/className=["']character-page["']/);
    expect(pageSource).not.toMatch(/\bcharacter-header\b/);
    expect(pageSource).not.toMatch(/\bcharacter-name-orig\b/);
    expect(pageSource).not.toMatch(/\bcharacter-appearances\b/);
    expect(pageSource).not.toMatch(/\bcharacter-appearance-link\b/);
    expect(pageSource).not.toMatch(/\bcharacter-appearance-year\b/);
    expect(pageSource).not.toMatch(/\bcharacter-appearances-empty\b/);
    expect(pageSource).not.toMatch(/\bcharacter-relations\b/);
    expect(pageSource).not.toMatch(/\bcharacter-relation-link\b/);
    expect(pageSource).not.toMatch(/\bcharacter-relation-type\b/);
    expect(pageSource).not.toMatch(/\bcharacter-relations-empty\b/);
  });

  it('does not use legacy character-* class names on not-found', () => {
    expect(notFoundSource).not.toMatch(/className=["'][^"']*character-page/);
    expect(notFoundSource).not.toMatch(/\bcharacter-not-found\b/);
  });

  it('does not use legacy spoiler-gate* class names', () => {
    expect(spoilerGateSource).not.toMatch(
      /className=["'][^"']*spoiler-gate(?:-|$|["'])/,
    );
    expect(spoilerGateSource).not.toMatch(/\bspoiler-gate-warning\b/);
    expect(spoilerGateSource).not.toMatch(/\bspoiler-gate-button\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card for appearances and relations', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
  });

  it('uses shadcn Button in SpoilerGate', () => {
    expect(spoilerGateSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(spoilerGateSource).toMatch(/\bButton\b/);
    expect(spoilerGateSource).toMatch(/text-muted/);
  });

  it('keeps character page UX: RU copy, regions, SpoilerGate, catalog fetch', () => {
    expect(pageSource).toMatch(/character\.nameRu/);
    expect(pageSource).toMatch(/character\.nameOrig/);
    expect(pageSource).toMatch(/Книги появления/);
    expect(pageSource).toMatch(/aria-label=["']Книги появления["']/);
    expect(pageSource).toMatch(/Связи/);
    expect(pageSource).toMatch(/aria-label=["']Связи персонажа["']/);
    expect(pageSource).toMatch(/SpoilerGate/);
    expect(pageSource).toMatch(/hasSpoilersConsent/);
    expect(pageSource).toMatch(/SPOILERS_OK_COOKIE/);
    expect(pageSource).toMatch(/fetchCatalogCharacter/);
    expect(pageSource).toMatch(
      /В каталоге пока нет опубликованных книг с этим персонажем/,
    );
    expect(pageSource).toMatch(/Связи с другими персонажами пока не добавлены/);
    expect(notFoundSource).toMatch(/Персонаж не найден/);
    expect(notFoundSource).toMatch(/Вернуться к поиску/);
    expect(spoilerGateSource).toMatch(/Могут быть спойлеры/);
    expect(spoilerGateSource).toMatch(/Показать/);
    expect(spoilerGateSource).toMatch(
      /aria-label=["']Предупреждение о спойлерах["']/,
    );
  });

  it('removes orphan .character-* / .spoiler-gate* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.character-page\b/);
    expect(globalsSource).not.toMatch(/\.character-header\b/);
    expect(globalsSource).not.toMatch(/\.character-name-orig\b/);
    expect(globalsSource).not.toMatch(/\.character-appearances\b/);
    expect(globalsSource).not.toMatch(/\.character-appearance-link\b/);
    expect(globalsSource).not.toMatch(/\.character-appearance-year\b/);
    expect(globalsSource).not.toMatch(/\.character-appearances-empty\b/);
    expect(globalsSource).not.toMatch(/\.character-relations\b/);
    expect(globalsSource).not.toMatch(/\.character-relation-link\b/);
    expect(globalsSource).not.toMatch(/\.character-relation-type\b/);
    expect(globalsSource).not.toMatch(/\.character-relations-empty\b/);
    expect(globalsSource).not.toMatch(/\.character-not-found\b/);
    expect(globalsSource).not.toMatch(/\.spoiler-gate\b/);
    expect(globalsSource).not.toMatch(/\.spoiler-gate-warning\b/);
    expect(globalsSource).not.toMatch(/\.spoiler-gate-button\b/);
  });
});
