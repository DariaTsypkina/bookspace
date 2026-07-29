import { z } from 'zod';

/** Path params for `/admin/works/:workId/...`. */
export const AdminWorkIdParamSchema = z.object({
  workId: z.string().trim().min(1).max(128),
});

export type AdminWorkIdParam = z.infer<typeof AdminWorkIdParamSchema>;

/** Path params for `/admin/context/:id/...`. */
export const AdminContextReadingIdParamSchema = z.object({
  id: z.string().trim().min(1).max(128),
});

export type AdminContextReadingIdParam = z.infer<
  typeof AdminContextReadingIdParamSchema
>;
