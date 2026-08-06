import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'shelf-detail-manager.tsx'),
  'utf8',
);

describe('ShelfDetailManager title search support (bd-cq7.8)', () => {
  it('supports title input with autocomplete and slug fallback', () => {
    expect(source).toMatch(/WorkSearchInput/);
    expect(source).toMatch(/resolveWorkSelectionPayload/);
    expect(source).toMatch(/Книга \(название или slug\)/);
    expect(source).toMatch(/Введите название книги или slug/);
  });
});
