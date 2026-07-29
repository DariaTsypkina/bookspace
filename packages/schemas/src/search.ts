import { z } from 'zod';

export const SearchBooksInputSchema = z.object({
  query: z.string().trim().min(3).max(200),
  limit: z.number().int().min(1).max(50).optional(),
});

export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;
