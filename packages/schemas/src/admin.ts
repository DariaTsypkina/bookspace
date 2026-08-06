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

/** API GET /admin/dashboard/summary query params (recent context window). */
export const AdminDashboardSummaryQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional(),
});

export type AdminDashboardSummaryQuery = z.infer<
  typeof AdminDashboardSummaryQuerySchema
>;

const NeedsContextSchema = z.enum(['UNKNOWN', 'YES', 'NO']);

export const ExternalIdSourceSchema = z.enum([
  'openlibrary',
  'isbn',
  'wikidata',
  'manual',
]);

export type ExternalIdSource = z.infer<typeof ExternalIdSourceSchema>;

/** API POST /admin/works body. */
export const AdminCreateWorkInputSchema = z.object({
  titleRu: z.string().trim().min(1).max(500),
  titleOrig: z.string().trim().min(1).max(500).optional(),
  yearFirst: z.coerce.number().int().min(1).max(3000).optional(),
  descriptionRu: z.string().trim().min(1).max(10_000).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  needsContext: NeedsContextSchema.optional(),
});

export type AdminCreateWorkInput = z.infer<typeof AdminCreateWorkInputSchema>;

/** API PATCH /admin/works/:workId body. */
export const AdminUpdateWorkInputSchema = z.object({
  titleRu: z.string().trim().min(1).max(500).optional(),
  titleOrig: z.string().trim().min(1).max(500).nullable().optional(),
  yearFirst: z.coerce.number().int().min(1).max(3000).nullable().optional(),
  descriptionRu: z.string().trim().min(1).max(10_000).nullable().optional(),
  needsContext: NeedsContextSchema.optional(),
});

export type AdminUpdateWorkInput = z.infer<typeof AdminUpdateWorkInputSchema>;

/** API GET /admin/works query. */
export const AdminListWorksQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'MERGED']).optional(),
  includeDeleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export type AdminListWorksQuery = z.infer<typeof AdminListWorksQuerySchema>;

/** API POST /admin/works/:workId/external-ids body. */
export const AdminCreateExternalIdInputSchema = z.object({
  source: ExternalIdSourceSchema,
  externalKey: z.string().trim().min(1).max(256),
});

export type AdminCreateExternalIdInput = z.infer<
  typeof AdminCreateExternalIdInputSchema
>;

export const AdminExternalIdParamSchema = z.object({
  workId: z.string().trim().min(1).max(128),
  externalId: z.string().trim().min(1).max(128),
});

export type AdminExternalIdParam = z.infer<typeof AdminExternalIdParamSchema>;

/** API POST /admin/authors body. */
export const AdminCreateAuthorInputSchema = z.object({
  nameRu: z.string().trim().min(1).max(500),
  nameOrig: z.string().trim().min(1).max(500).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

export type AdminCreateAuthorInput = z.infer<
  typeof AdminCreateAuthorInputSchema
>;

/** API POST /admin/works/:workId/authors body. */
export const AdminLinkWorkAuthorInputSchema = z.object({
  authorId: z.string().trim().min(1).max(128),
  role: z.string().trim().min(1).max(100).optional(),
  position: z.coerce.number().int().min(0).max(1000).optional(),
});

export type AdminLinkWorkAuthorInput = z.infer<
  typeof AdminLinkWorkAuthorInputSchema
>;

/** API POST /admin/works/:workId/editions body. */
export const AdminCreateEditionInputSchema = z.object({
  language: z.string().trim().min(1).max(16),
  title: z.string().trim().min(1).max(500).optional(),
  translator: z.string().trim().min(1).max(500).optional(),
  publisher: z.string().trim().min(1).max(500).optional(),
  year: z.coerce.number().int().min(1).max(3000).optional(),
  isbn13: z.string().trim().min(13).max(13).optional(),
  isbn10: z.string().trim().min(10).max(10).optional(),
});

export type AdminCreateEditionInput = z.infer<
  typeof AdminCreateEditionInputSchema
>;

/** Web form: create/edit Work (string fields for RHF). */
export const AdminWorkFormSchema = z.object({
  titleRu: z.string().trim().min(1, 'Укажите название').max(500),
  titleOrig: z.string().trim().max(500).optional(),
  yearFirst: z.string().trim().optional(),
  descriptionRu: z.string().trim().max(10_000).optional(),
  needsContext: NeedsContextSchema.optional(),
});

export type AdminWorkForm = z.infer<typeof AdminWorkFormSchema>;

export function toAdminCreateWorkInput(
  form: AdminWorkForm,
): AdminCreateWorkInput {
  const yearRaw = form.yearFirst?.trim();
  return {
    titleRu: form.titleRu,
    titleOrig: form.titleOrig?.trim() || undefined,
    yearFirst: yearRaw ? Number(yearRaw) : undefined,
    descriptionRu: form.descriptionRu?.trim() || undefined,
    needsContext: form.needsContext,
  };
}

export function toAdminUpdateWorkInput(
  form: AdminWorkForm,
): AdminUpdateWorkInput {
  const yearRaw = form.yearFirst?.trim();
  return {
    titleRu: form.titleRu,
    titleOrig: form.titleOrig?.trim() || null,
    yearFirst: yearRaw ? Number(yearRaw) : null,
    descriptionRu: form.descriptionRu?.trim() || null,
    needsContext: form.needsContext,
  };
}

/** Web form: ExternalId. */
export const AdminExternalIdFormSchema = z.object({
  source: ExternalIdSourceSchema,
  externalKey: z.string().trim().min(1, 'Укажите ключ').max(256),
});

export type AdminExternalIdForm = z.infer<typeof AdminExternalIdFormSchema>;
