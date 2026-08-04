import { z } from 'zod';

/** UserBook.status — статус книги в коллекции читателя. */
export const UserBookStatusSchema = z.enum([
  'WANT',
  'READING',
  'READ',
  'ABANDONED',
]);

export type UserBookStatus = z.infer<typeof UserBookStatusSchema>;

/** Оценка 1–10; `null` — сбросить. */
export const UserBookRatingSchema = z.number().int().min(1).max(10);

/**
 * Body upsert статуса/оценки.
 * Идентификация произведения: `workSlug` (предпочтительно для UI) или `workId`.
 */
export const UpsertUserBookInputSchema = z
  .object({
    workId: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .optional()
      .transform((value) =>
        value === undefined || value.length === 0 ? undefined : value,
      ),
    workSlug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional()
      .transform((value) =>
        value === undefined || value.length === 0 ? undefined : value,
      ),
    status: UserBookStatusSchema,
    rating: UserBookRatingSchema.nullable().optional(),
  })
  .refine((data) => data.workId !== undefined || data.workSlug !== undefined, {
    message: 'Укажите workId или workSlug',
    path: ['workId'],
  });

export type UpsertUserBookInput = z.infer<typeof UpsertUserBookInputSchema>;

/**
 * PUT `/me/library/works/:workSlug` — upsert по slug (status обязателен).
 */
export const PutUserBookBySlugInputSchema = z.object({
  status: UserBookStatusSchema,
  rating: UserBookRatingSchema.nullable().optional(),
});

export type PutUserBookBySlugInput = z.infer<
  typeof PutUserBookBySlugInputSchema
>;

/**
 * PATCH body: частичное обновление (хотя бы одно поле).
 * Path: `/me/library/works/:workSlug`.
 */
export const PatchUserBookInputSchema = z
  .object({
    status: UserBookStatusSchema.optional(),
    rating: UserBookRatingSchema.nullable().optional(),
  })
  .refine((data) => data.status !== undefined || data.rating !== undefined, {
    message: 'Укажите status и/или rating',
    path: ['status'],
  });

export type PatchUserBookInput = z.infer<typeof PatchUserBookInputSchema>;

/** @deprecated stub — используйте UpsertUserBookInputSchema */
export const AddLibraryItemInputSchema = UpsertUserBookInputSchema;

export type AddLibraryItemInput = UpsertUserBookInput;

/** Path params for public profile `/u/[slug]`. */
export const ProfileSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export type ProfileSlugParam = z.infer<typeof ProfileSlugParamSchema>;

/** Элемент публичной коллекции. */
export const PublicUserBookItemSchema = z.object({
  workSlug: z.string(),
  titleRu: z.string(),
  status: UserBookStatusSchema,
  rating: UserBookRatingSchema.nullable(),
  finishedAt: z.string().datetime().nullable(),
});

export type PublicUserBookItem = z.infer<typeof PublicUserBookItemSchema>;

export const PublicLibraryResponseSchema = z.object({
  slug: z.string(),
  items: z.array(PublicUserBookItemSchema),
});

export type PublicLibraryResponse = z.infer<typeof PublicLibraryResponseSchema>;

export const UserBookResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workId: z.string(),
  workSlug: z.string(),
  titleRu: z.string(),
  status: UserBookStatusSchema,
  rating: UserBookRatingSchema.nullable(),
  finishedAt: z.string().datetime().nullable(),
});

export type UserBookResponse = z.infer<typeof UserBookResponseSchema>;
