import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'add-library-item-form.tsx'),
  'utf8',
);

describe('AddLibraryItemForm RHF + Zod (bd-0t0.8 / bd-cq7.1)', () => {
  it('uses react-hook-form with zodResolver', () => {
    expect(source).toMatch(/useForm/);
    expect(source).toMatch(/zodResolver/);
  });

  it('uses shadcn FormField pattern', () => {
    expect(source).toMatch(/\bFormField\b/);
    expect(source).toMatch(/from ['"]@\/components\/ui\/form['"]/);
  });

  it('imports shared AddLibraryItemInputSchema from @bookspace/schemas', () => {
    expect(source).toMatch(/AddLibraryItemInputSchema/);
    expect(source).toMatch(/from ['"]@bookspace\/schemas['"]/);
  });

  it('posts through first-party BFF /api/me/library/items with status', () => {
    expect(source).toMatch(/\/api\/me\/library\/items/);
    expect(source).toMatch(/status/);
    expect(source).toMatch(/Книга \(название или slug\)/);
  });
});

describe('AddLibraryItemForm axios client (bd-707.7)', () => {
  it('posts via api from @/lib/http (no native fetch)', () => {
    expect(source).toMatch(/from ['"]@\/lib\/http['"]/);
    expect(source).toMatch(/\bapi\.post\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
  });

  it('handles errors via ApiError', () => {
    expect(source).toMatch(/\bApiError\b/);
    expect(source).toMatch(/instanceof ApiError/);
  });

  it('uses catalog work suggestions with slug fallback', () => {
    expect(source).toMatch(/WorkSearchInput/);
    expect(source).toMatch(/resolveWorkSelectionPayload/);
    expect(source).toMatch(/Введите название книги или slug/);
  });
});

describe('AddLibraryItemForm Select (bd-a12.2)', () => {
  it('uses shadcn Select, not native <select>', () => {
    expect(source).toMatch(/from ['"]@\/components\/ui\/select['"]/);
    expect(source).toMatch(/\bSelectTrigger\b/);
    expect(source).toMatch(/\bSelectItem\b/);
    expect(source).not.toMatch(/<select[\s>]/);
  });
});
