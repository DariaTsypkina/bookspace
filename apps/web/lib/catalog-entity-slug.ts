import { CatalogEntitySlugParamSchema } from '@bookspace/schemas';

/** Validate catalog entity slug via shared Zod before calling API. */
export function parseCatalogEntitySlug(slug: string): string {
  return CatalogEntitySlugParamSchema.parse({ slug }).slug;
}
