import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'user-book-status-form.tsx'),
  'utf8',
);

describe('UserBookStatusForm (bd-cq7.1)', () => {
  it('uses RHF + PutUserBookBySlugInputSchema and BFF PUT', () => {
    expect(source).toMatch(/useForm/);
    expect(source).toMatch(/zodResolver/);
    expect(source).toMatch(/PutUserBookBySlugInputSchema/);
    expect(source).toMatch(/\/api\/me\/library\/works\//);
    expect(source).toMatch(/\bapi\.put\b/);
  });

  it('defers setLoaded out of useEffect sync body (react-hooks/set-state-in-effect)', () => {
    expect(source).toMatch(/queueMicrotask\s*\(\s*\(\s*\)\s*=>\s*\{/);
    expect(source).not.toMatch(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*if\s*\([\s\S]*?\)\s*\{\s*setLoaded\s*\(/,
    );
  });

  it('shows RU status labels and guest login prompt', () => {
    expect(source).toMatch(/USER_BOOK_STATUS_LABELS/);
    expect(source).toMatch(/Войдите/);
    expect(source).toMatch(/Статус и оценка сохранены/);
    expect(source).toMatch(/aria-label=["']Статус книги["']/);
    expect(source).toMatch(/aria-label=["']Оценка книги["']/);
  });

  it('uses Tailwind/shadcn primitives and Baskerville-safe font-sans', () => {
    expect(source).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(source).toMatch(/from ['"]@\/components\/ui\/form['"]/);
    expect(source).toMatch(/\bfont-sans\b/);
    expect(source).not.toMatch(/globals\.css/);
  });

  it('uses shadcn Select for status, not native <select> (bd-a12.2)', () => {
    expect(source).toMatch(/from ['"]@\/components\/ui\/select['"]/);
    expect(source).toMatch(/\bSelectTrigger\b/);
    expect(source).toMatch(/\bSelectItem\b/);
    expect(source).not.toMatch(/<select[\s>]/);
  });
});
