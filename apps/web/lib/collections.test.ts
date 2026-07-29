import { describe, expect, it } from 'vitest';
import { CollectionStatusSchema } from '@bookspace/schemas';
import {
  COLLECTIONS_STUB_COPY,
  PUBLIC_COLLECTION_STATUS,
} from '@/lib/collections';

describe('collections shared Zod helpers (bd-0t0.10)', () => {
  it('exposes public PUBLISHED status from shared schema', () => {
    expect(PUBLIC_COLLECTION_STATUS).toBe('PUBLISHED');
    expect(
      CollectionStatusSchema.safeParse(PUBLIC_COLLECTION_STATUS).success,
    ).toBe(true);
    expect(CollectionStatusSchema.safeParse('DRAFT').success).toBe(true);
    expect(CollectionStatusSchema.safeParse('REJECTED').success).toBe(false);
  });

  it('keeps stub copy for collections page without inventing CRUD forms', () => {
    expect(COLLECTIONS_STUB_COPY).toMatch(/подборк/i);
  });
});
