import { describe, expect, it } from 'vitest';
import {
  AdminContextPublishInputSchema,
  CatalogSearchQuerySchema,
  LoginInputSchema,
  SearchBooksInputSchema,
  SearchQueryFormSchema,
} from '@bookspace/schemas';

describe('@bookspace/schemas export contract', () => {
  it('exports auth/search/admin-context input schemas', () => {
    expect(
      LoginInputSchema.safeParse({
        email: 'user@example.com',
        password: 'Strong123!',
      }).success,
    ).toBe(true);
    expect(
      SearchBooksInputSchema.safeParse({
        query: 'Мастер и Маргарита',
        limit: 10,
      }).success,
    ).toBe(true);
    expect(
      AdminContextPublishInputSchema.safeParse({
        workId: 'work_123',
        sourceUrl: 'https://example.org/context',
        model: 'gpt-5-mini',
      }).success,
    ).toBe(true);
    expect(SearchQueryFormSchema.safeParse({ query: '' }).success).toBe(true);
    expect(
      CatalogSearchQuerySchema.safeParse({ q: 'гарри', limit: 10 }).success,
    ).toBe(true);
  });

  it('rejects invalid payloads', () => {
    expect(
      LoginInputSchema.safeParse({ email: 'not-email', password: '123' })
        .success,
    ).toBe(false);
    expect(SearchBooksInputSchema.safeParse({ query: 'ab' }).success).toBe(
      false,
    );
    expect(SearchQueryFormSchema.safeParse({ query: 'ab' }).success).toBe(
      false,
    );
    expect(CatalogSearchQuerySchema.safeParse({ q: 'ab' }).success).toBe(false);
    expect(
      AdminContextPublishInputSchema.safeParse({
        workId: '',
        sourceUrl: 'notaurl',
        model: '',
      }).success,
    ).toBe(false);
  });
});
