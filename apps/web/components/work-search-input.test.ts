import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'work-search-input.tsx'),
  'utf8',
);

describe('WorkSearchInput (bd-k7i — no setState-in-effect)', () => {
  it('defers empty-query reset out of useEffect sync body (react-hooks/set-state-in-effect)', () => {
    expect(source).toMatch(/queueMicrotask\s*\(\s*\(\s*\)\s*=>\s*\{/);
    expect(source).not.toMatch(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*if\s*\(\s*!hasValue\s*\)\s*\{\s*setSuggestions\s*\(/,
    );
  });

  it('keeps debounced catalog search and suggestion UX', () => {
    expect(source).toMatch(/fetchCatalogSearch/);
    expect(source).toMatch(/getWorkSuggestions/);
    expect(source).toMatch(/setTimeout/);
    expect(source).toMatch(/250/);
    expect(source).toMatch(/Введите название книги или slug/);
    expect(source).toMatch(/Подсказки произведений/);
  });
});
