import { describe, expect, it } from 'vitest';
import { RankingStatusSchema } from '@bookspace/schemas';
import { PUBLIC_RANKING_STATUS, RANKINGS_STUB_COPY } from '@/lib/rankings';

describe('rankings shared Zod helpers (bd-0t0.10)', () => {
  it('exposes public PUBLISHED status from shared schema', () => {
    expect(PUBLIC_RANKING_STATUS).toBe('PUBLISHED');
    expect(RankingStatusSchema.safeParse(PUBLIC_RANKING_STATUS).success).toBe(
      true,
    );
    expect(RankingStatusSchema.safeParse('DRAFT').success).toBe(true);
    expect(RankingStatusSchema.safeParse('ARCHIVED').success).toBe(false);
  });

  it('keeps stub copy for rankings page without inventing CRUD forms', () => {
    expect(RANKINGS_STUB_COPY).toMatch(/рейтинг/i);
  });
});
