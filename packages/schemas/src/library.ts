import { z } from 'zod';

/** API POST /me/library/items body (stub UserBook mutation). */
export const AddLibraryItemInputSchema = z.object({
  workId: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().trim().max(128).optional(),
  ),
});

export type AddLibraryItemInput = z.infer<typeof AddLibraryItemInputSchema>;

/** Path params for public profile `/u/[slug]`. */
export const ProfileSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export type ProfileSlugParam = z.infer<typeof ProfileSlugParamSchema>;
