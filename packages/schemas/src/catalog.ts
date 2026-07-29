import { z } from 'zod';

/** Path params for public catalog entity pages (work/author/character/world/place). */
export const CatalogEntitySlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export type CatalogEntitySlugParam = z.infer<
  typeof CatalogEntitySlugParamSchema
>;

/** API PATCH /admin/works/:workId/needs-context body. */
export const AdminWorkNeedsContextPatchInputSchema = z.object({
  needsContext: z.enum(['UNKNOWN', 'YES', 'NO']),
});

export type AdminWorkNeedsContextPatchInput = z.infer<
  typeof AdminWorkNeedsContextPatchInputSchema
>;
