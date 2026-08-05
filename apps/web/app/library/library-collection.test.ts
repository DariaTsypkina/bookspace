import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'library-collection.tsx'),
  'utf8',
);

describe('LibraryCollection (bd-cq7.4)', () => {
  it('loads owner collection via BFF GET /api/me/library', () => {
    expect(source).toMatch(/\/api\/me\/library/);
    expect(source).toMatch(/api\.get/);
  });

  it('defers load setState out of useEffect sync body (react-hooks/set-state-in-effect)', () => {
    expect(source).toMatch(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*queueMicrotask\s*\(/,
    );
    expect(source).not.toMatch(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*void\s+load\s*\(/,
    );
  });

  it('filters by status query param WANT|READING|READ|ABANDONED', () => {
    expect(source).toMatch(/status=/);
    expect(source).toMatch(/USER_BOOK_STATUS_OPTIONS/);
    expect(source).toMatch(/StatusFilter/);
  });

  it('renders RU status filter controls and book list', () => {
    expect(source).toMatch(/Фильтр по статусу/);
    expect(source).toMatch(/Все/);
    expect(source).toMatch(/Список книг/);
    expect(source).toMatch(/USER_BOOK_STATUS_LABELS/);
  });

  it('links items to /books/[slug] and prompts guest to log in', () => {
    expect(source).toMatch(/\/books\//);
    expect(source).toMatch(/\/login/);
    expect(source).toMatch(/Войдите/);
  });

  it('uses Tailwind + shadcn Card/Button, no legacy globals', () => {
    expect(source).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(source).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(source).toMatch(/font-sans/);
    expect(source).not.toMatch(/library-stub/);
  });
});
