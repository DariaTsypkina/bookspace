import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(__dirname, 'catalog-search-form.tsx'),
  'utf8',
);

describe('CatalogSearchForm RHF + shadcn Form pattern', () => {
  it('uses react-hook-form with zodResolver', () => {
    expect(source).toMatch(/useForm/);
    expect(source).toMatch(/zodResolver/);
  });

  it('uses shadcn Form primitives for reusable pattern', () => {
    expect(source).toMatch(/from ['"]@\/components\/ui\/form['"]/);
    expect(source).toMatch(/\bFormField\b/);
    expect(source).toMatch(/\bFormMessage\b/);
  });

  it('uses friendly/localized validation message mapping', () => {
    expect(source).toMatch(/getFriendlyZodIssueMessage/);
  });
});
