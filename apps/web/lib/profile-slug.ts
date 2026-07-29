import { ProfileSlugParamSchema } from '@bookspace/schemas';

/** Validate profile slug via shared Zod. */
export function parseProfileSlug(slug: string): string {
  return ProfileSlugParamSchema.parse({ slug }).slug;
}

/** Safe variant for UI pages — null when slug is invalid. */
export function tryParseProfileSlug(slug: string): string | null {
  const result = ProfileSlugParamSchema.safeParse({ slug });
  return result.success ? result.data.slug : null;
}
