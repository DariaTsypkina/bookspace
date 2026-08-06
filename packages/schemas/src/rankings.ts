import { z } from 'zod';

/** Ranking.status (docs/tech/database-schema.md). Public list = PUBLISHED only. */
export const RankingStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);

export type RankingStatus = z.infer<typeof RankingStatusSchema>;

/** Status shown on public rankings list when Ranking ships. */
export const PUBLIC_RANKING_STATUS = RankingStatusSchema.enum.PUBLISHED;

/** Path params for future public `/rankings/[slug]`. */
export const RankingSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export type RankingSlugParam = z.infer<typeof RankingSlugParamSchema>;

/** ExternalRankingEntry.matchStatus. */
export const ExternalRankingMatchStatusSchema = z.enum([
  'MATCHED',
  'UNMATCHED',
  'IGNORED',
]);

export type ExternalRankingMatchStatus = z.infer<
  typeof ExternalRankingMatchStatusSchema
>;

/**
 * Future admin job trigger: rankings.import.source.
 * Not backed by API runtime yet (no Ranking Prisma models).
 */
export const RankingsImportSourceInputSchema = z.object({
  sourceKey: z.string().trim().min(1).max(128),
});

export type RankingsImportSourceInput = z.infer<
  typeof RankingsImportSourceInputSchema
>;

/**
 * Future admin job trigger: rankings.aggregate.publish.
 * Not backed by API runtime yet.
 */
export const RankingsAggregatePublishInputSchema = z.object({
  themeKey: z.string().trim().min(1).max(128),
  topN: z.coerce.number().int().min(1).max(1000).optional(),
});

export type RankingsAggregatePublishInput = z.infer<
  typeof RankingsAggregatePublishInputSchema
>;
