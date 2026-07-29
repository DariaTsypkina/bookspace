import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'add-library-item-form.tsx'),
  'utf8',
);

describe('AddLibraryItemForm RHF + Zod (bd-0t0.8)', () => {
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

  it('posts through first-party BFF /api/me/library/items', () => {
    expect(source).toMatch(/\/api\/me\/library\/items/);
  });
});
