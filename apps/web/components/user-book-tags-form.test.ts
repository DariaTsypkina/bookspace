import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'user-book-tags-form.tsx'),
  'utf8',
);

describe('UserBookTagsForm (bd-cq7.3)', () => {
  it('assigns tags via BFF POST and removes via DELETE', () => {
    expect(source).toMatch(/\/api\/me\/library\/works\//);
    expect(source).toMatch(/\/tags/);
    expect(source).toMatch(/\bapi\.post\b/);
    expect(source).toMatch(/\bapi\.delete\b/);
    expect(source).toMatch(/Назначить тег/);
  });

  it('shows guest login prompt and RU feedback', () => {
    expect(source).toMatch(/Войдите/);
    expect(source).toMatch(/Тег назначен/);
    expect(source).toMatch(/aria-label=["']Название тега["']/);
    expect(source).toMatch(/Назначенные теги/);
  });

  it('uses Tailwind/shadcn primitives and Baskerville-safe font-sans', () => {
    expect(source).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(source).toMatch(/from ['"]@\/components\/ui\/input['"]/);
    expect(source).toMatch(/\bfont-sans\b/);
    expect(source).not.toMatch(/globals\.css/);
  });
});
