import { z } from 'zod';

export const AdminContextPublishInputSchema = z.object({
  workId: z.string().trim().min(1).max(128),
  sourceUrl: z.url(),
  model: z.string().trim().min(1).max(128),
});

export type AdminContextPublishInput = z.infer<typeof AdminContextPublishInputSchema>;
