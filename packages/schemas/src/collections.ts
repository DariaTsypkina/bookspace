import { z } from 'zod';

/** Collection.status (docs/tech/database-schema.md). Public list = PUBLISHED only. */
export const CollectionStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);

export type CollectionStatus = z.infer<typeof CollectionStatusSchema>;

/** Status shown on public collections list when Collection ships. */
export const PUBLIC_COLLECTION_STATUS = CollectionStatusSchema.enum.PUBLISHED;

/** Path params for future public `/collections/[slug]`. */
export const CollectionSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export type CollectionSlugParam = z.infer<typeof CollectionSlugParamSchema>;
