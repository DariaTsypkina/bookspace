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

/** Тег пользователя (владелец). */
export const TagNameSchema = z.string().trim().min(1).max(100);

export const TagResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type TagResponse = z.infer<typeof TagResponseSchema>;

/** Создать тег. */
export const CreateTagInputSchema = z.object({
  name: TagNameSchema,
});

export type CreateTagInput = z.infer<typeof CreateTagInputSchema>;

/** Переименовать тег. */
export const UpdateTagInputSchema = z.object({
  name: TagNameSchema,
});

export type UpdateTagInput = z.infer<typeof UpdateTagInputSchema>;

/**
 * Назначить тег на UserBook: существующий `tagId` или создать/найти по `name`.
 */
export const AssignTagInputSchema = z
  .object({
    tagId: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .optional()
      .transform((value) =>
        value === undefined || value.length === 0 ? undefined : value,
      ),
    name: TagNameSchema.optional(),
  })
  .refine((data) => data.tagId !== undefined || data.name !== undefined, {
    message: 'Укажите tagId или name',
    path: ['tagId'],
  });

export type AssignTagInput = z.infer<typeof AssignTagInputSchema>;

/** Элемент публичной коллекции. */
export const PublicUserBookItemSchema = z.object({
  workSlug: z.string(),
  titleRu: z.string(),
  status: UserBookStatusSchema,
  rating: UserBookRatingSchema.nullable(),
  finishedAt: z.string().datetime().nullable(),
  tags: z.array(z.object({ name: z.string() })),
});

export type PublicUserBookItem = z.infer<typeof PublicUserBookItemSchema>;

/** Note.visibility — публичные заметки на профиле только PUBLIC. */
export const NoteVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);

export type NoteVisibility = z.infer<typeof NoteVisibilitySchema>;

export const NoteTypeSchema = z.enum(['NOTE', 'QUOTE']);

export type NoteType = z.infer<typeof NoteTypeSchema>;

/** Публичная заметка/цитата (без PRIVATE). */
export const PublicNoteItemSchema = z.object({
  id: z.string(),
  type: NoteTypeSchema,
  body: z.string(),
  workSlug: z.string().optional(),
  pageRef: z.string().nullable().optional(),
});

export type PublicNoteItem = z.infer<typeof PublicNoteItemSchema>;

/**
 * Цель чтения на публичном профиле.
 * Появляется только если `showOnProfile === true` (иначе API отдаёт `null`).
 */
export const PublicReadingGoalSchema = z.object({
  year: z.number().int(),
  targetCount: z.number().int().positive(),
  progressCount: z.number().int().nonnegative(),
});

export type PublicReadingGoal = z.infer<typeof PublicReadingGoalSchema>;

export const PublicLibraryResponseSchema = z.object({
  slug: z.string(),
  items: z.array(PublicUserBookItemSchema),
  /** Только visibility=PUBLIC; пустой массив пока нет модели Note. */
  notes: z.array(PublicNoteItemSchema),
  /** null если цели нет или showOnProfile=false. */
  goal: PublicReadingGoalSchema.nullable(),
});

export type PublicLibraryResponse = z.infer<typeof PublicLibraryResponseSchema>;

/**
 * GET `/users/:slug/library/works/:workSlug` —
 * книга в контексте владельца профиля (статус/оценка/теги + PUBLIC notes).
 */
export const PublicUserBookDetailSchema = z.object({
  slug: z.string(),
  workSlug: z.string(),
  titleRu: z.string(),
  status: UserBookStatusSchema,
  rating: UserBookRatingSchema.nullable(),
  finishedAt: z.string().datetime().nullable(),
  tags: z.array(z.object({ name: z.string() })),
  notes: z.array(PublicNoteItemSchema),
});

export type PublicUserBookDetail = z.infer<typeof PublicUserBookDetailSchema>;

export const UserBookResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workId: z.string(),
  workSlug: z.string(),
  titleRu: z.string(),
  status: UserBookStatusSchema,
  rating: UserBookRatingSchema.nullable(),
  finishedAt: z.string().datetime().nullable(),
  tags: z.array(TagResponseSchema),
});

export type UserBookResponse = z.infer<typeof UserBookResponseSchema>;

/**
 * GET `/me/library` — список коллекции владельца.
 * Query `status` опционален (WANT|READING|READ|ABANDONED).
 */
export const MeLibraryListQuerySchema = z.object({
  status: z
    .union([UserBookStatusSchema, z.literal('')])
    .optional()
    .transform((value) =>
      value === undefined || value === '' ? undefined : value,
    ),
});

export type MeLibraryListQuery = z.infer<typeof MeLibraryListQuerySchema>;

export const MeLibraryListResponseSchema = z.object({
  items: z.array(UserBookResponseSchema),
});

export type MeLibraryListResponse = z.infer<typeof MeLibraryListResponseSchema>;

/** Создать полку: title обязателен; slug генерируется на сервере, если не задан. */
export const CreateShelfInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) =>
      value === undefined || value.length === 0 ? undefined : value,
    ),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .transform((value) =>
      value === undefined || value.length === 0 ? undefined : value,
    ),
});

export type CreateShelfInput = z.infer<typeof CreateShelfInputSchema>;

/** PATCH полки: хотя бы одно поле. description: null — сбросить. */
export const UpdateShelfInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .optional()
      .transform((value) => {
        if (value === undefined) return undefined;
        if (value === null) return null;
        return value.length === 0 ? null : value;
      }),
    slug: z.string().trim().min(1).max(200).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.slug !== undefined,
    {
      message: 'Укажите title, description и/или slug',
      path: ['title'],
    },
  );

export type UpdateShelfInput = z.infer<typeof UpdateShelfInputSchema>;

/** Добавить книгу на полку (из коллекции владельца). */
export const AddShelfItemInputSchema = z
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
  })
  .refine((data) => data.workId !== undefined || data.workSlug !== undefined, {
    message: 'Укажите workId или workSlug',
    path: ['workId'],
  });

export type AddShelfItemInput = z.infer<typeof AddShelfItemInputSchema>;

export const ShelfItemResponseSchema = z.object({
  workId: z.string(),
  workSlug: z.string(),
  titleRu: z.string(),
  position: z.number().int().nullable(),
});

export type ShelfItemResponse = z.infer<typeof ShelfItemResponseSchema>;

export const ShelfResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  itemCount: z.number().int().nonnegative(),
  items: z.array(ShelfItemResponseSchema).optional(),
});

export type ShelfResponse = z.infer<typeof ShelfResponseSchema>;

export const PublicShelfSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  itemCount: z.number().int().nonnegative(),
});

export type PublicShelfSummary = z.infer<typeof PublicShelfSummarySchema>;

export const PublicShelvesResponseSchema = z.object({
  slug: z.string(),
  shelves: z.array(PublicShelfSummarySchema),
});

export type PublicShelvesResponse = z.infer<typeof PublicShelvesResponseSchema>;

export const PublicShelfDetailSchema = z.object({
  slug: z.string(),
  shelfSlug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  items: z.array(
    z.object({
      workSlug: z.string(),
      titleRu: z.string(),
    }),
  ),
});

export type PublicShelfDetail = z.infer<typeof PublicShelfDetailSchema>;
