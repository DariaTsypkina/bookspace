import { z } from 'zod';

export const AdminContextPublishInputSchema = z.object({
  workId: z.string().trim().min(1).max(128),
  sourceUrl: z.url(),
  model: z.string().trim().min(1).max(128),
});

export type AdminContextPublishInput = z.infer<
  typeof AdminContextPublishInputSchema
>;

/** API GET /admin/context/recent query params. */
export const AdminContextListRecentQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional(),
});

export type AdminContextListRecentQuery = z.infer<
  typeof AdminContextListRecentQuerySchema
>;

/** API PATCH /admin/context/:id body. */
export const AdminContextPatchInputSchema = z.object({
  whyText: z.string().trim().min(1).max(8000).optional(),
  importanceRank: z.coerce.number().int().min(1).max(99).optional(),
});

export type AdminContextPatchInput = z.infer<
  typeof AdminContextPatchInputSchema
>;

/**
 * Web form on /admin/context: both fields required for save.
 * importanceRank stays a string in the form (native number input); parse on submit.
 */
export const AdminContextPatchFormSchema = z.object({
  whyText: z.string().trim().min(1).max(8000),
  importanceRank: z
    .string()
    .trim()
    .min(1)
    .refine((value) => /^\d+$/.test(value), {
      message: 'Ранг должен быть целым числом',
    })
    .refine(
      (value) => {
        const rank = Number(value);
        return rank >= 1 && rank <= 99;
      },
      { message: 'Ранг должен быть от 1 до 99' },
    ),
});

export type AdminContextPatchForm = z.infer<typeof AdminContextPatchFormSchema>;

/** Parsed patch payload after successful form validation. */
export function toAdminContextPatchInput(
  values: AdminContextPatchForm,
): { whyText: string; importanceRank: number } {
  return {
    whyText: values.whyText,
    importanceRank: Number(values.importanceRank),
  };
}
/** API POST /admin/works/:workId/context/extract body. */
export const AdminContextExtractInputSchema = z.object({
  force: z.boolean().optional(),
  async: z.boolean().optional(),
});

export type AdminContextExtractInput = z.infer<
  typeof AdminContextExtractInputSchema
>;
