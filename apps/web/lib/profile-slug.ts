import { ProfileSlugParamSchema } from '@bookspace/schemas';

function decodeSlug(slug: string): string | null {
  try {
    return decodeURIComponent(slug);
  } catch {
    return null;
  }
}

/** Validate profile slug via shared Zod. */
export function parseProfileSlug(slug: string): string {
  const decoded = decodeSlug(slug);
  if (decoded === null) {
    throw new Error('Invalid profile slug encoding');
  }
  return ProfileSlugParamSchema.parse({ slug: decoded }).slug;
}

/** Safe variant for UI pages — null when slug is invalid. */
export function tryParseProfileSlug(slug: string): string | null {
  const decoded = decodeSlug(slug);
  if (decoded === null) {
    return null;
  }
  const result = ProfileSlugParamSchema.safeParse({ slug: decoded });
  return result.success ? result.data.slug : null;
}
