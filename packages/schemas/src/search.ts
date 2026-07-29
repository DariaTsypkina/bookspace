import { z } from 'zod';

export const SearchBooksInputSchema = z.object({
  query: z.string().trim().min(3).max(200),
  limit: z.number().int().min(1).max(50).optional(),
});

export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;

/** Web form: empty query clears search; non-empty requires min 3 chars. */
export const SearchQueryFormSchema = z.object({
  query: z.union([z.literal(''), z.string().trim().min(3).max(200)]),
});

export type SearchQueryForm = z.infer<typeof SearchQueryFormSchema>;

/** API GET /catalog/search query params. */
export const CatalogSearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value ?? '')
    .pipe(z.union([z.literal(''), z.string().min(3)])),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type CatalogSearchQuery = z.infer<typeof CatalogSearchQuerySchema>;
