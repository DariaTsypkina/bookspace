import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const libSource = readFileSync(
  path.join(__dirname, '../../../../../lib/public-library.ts'),
  'utf8',
);

describe('Public user book page (bd-cq7.5)', () => {
  it('fetches owner UserBook via public API and shows status/rating/tags', () => {
    expect(pageSource).toMatch(/fetchPublicUserBook/);
    expect(pageSource).toMatch(/Статус и оценка владельца/);
    expect(pageSource).toMatch(/formatUserBookStatus/);
    expect(pageSource).toMatch(/formatUserBookRating/);
    expect(pageSource).toMatch(/Книга не найдена в коллекции/);
    expect(pageSource).toMatch(/Страница в каталоге/);
    expect(pageSource).toMatch(/\/books\/\$\{book\.workSlug\}/);
    expect(libSource).toMatch(/library\/works\//);
  });

  it('only renders notes section when PUBLIC notes exist', () => {
    expect(pageSource).toMatch(/Публичные заметки к книге/);
    expect(pageSource).toMatch(/book\.notes\.length/);
  });
});
