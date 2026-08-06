import {
  AddLibraryItemInputSchema,
  PatchUserBookInputSchema,
  ProfileSlugParamSchema,
  UpsertUserBookInputSchema,
  UserBookStatusSchema,
} from '@bookspace/schemas';
import {
  AddLibraryItemDto,
  PatchUserBookDto,
  ProfileSlugParamDto,
  UpsertUserBookDto,
} from './me-library.dto';

describe('Me library Zod DTO shared schemas', () => {
  it('UserBookStatusSchema accepts WANT|READING|READ|ABANDONED only', () => {
    for (const status of ['WANT', 'READING', 'READ', 'ABANDONED'] as const) {
      expect(UserBookStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(UserBookStatusSchema.safeParse('DROPPED').success).toBe(false);
    expect(UserBookStatusSchema.safeParse('').success).toBe(false);
  });

  it('UpsertUserBookDto requires status and workId or workSlug; rating 1–10', () => {
    expect(UpsertUserBookDto.schema.safeParse({}).success).toBe(false);
    expect(
      UpsertUserBookDto.schema.safeParse({ workSlug: 'war-and-peace' }).success,
    ).toBe(false);

    const bySlug = UpsertUserBookDto.schema.safeParse({
      workSlug: 'war-and-peace',
      status: 'READING',
      rating: 8,
    });
    expect(bySlug.success).toBe(true);
    if (bySlug.success) {
      expect(bySlug.data).toEqual({
        workSlug: 'war-and-peace',
        status: 'READING',
        rating: 8,
      });
    }

    const byId = UpsertUserBookInputSchema.safeParse({
      workId: 'work-1',
      status: 'WANT',
    });
    expect(byId.success).toBe(true);
    if (byId.success) {
      expect(byId.data.status).toBe('WANT');
      expect(byId.data.workId).toBe('work-1');
      expect(byId.data.rating).toBeUndefined();
    }

    expect(
      UpsertUserBookInputSchema.safeParse({
        workSlug: 'x',
        status: 'READ',
        rating: 0,
      }).success,
    ).toBe(false);
    expect(
      UpsertUserBookInputSchema.safeParse({
        workSlug: 'x',
        status: 'READ',
        rating: 11,
      }).success,
    ).toBe(false);
    expect(
      UpsertUserBookInputSchema.safeParse({
        workSlug: 'x',
        status: 'READ',
        rating: 10,
      }).success,
    ).toBe(true);
  });

  it('Upsert rejects oversized workId / workSlug', () => {
    expect(
      UpsertUserBookDto.schema.safeParse({
        workId: 'w'.repeat(129),
        status: 'WANT',
      }).success,
    ).toBe(false);
    expect(
      UpsertUserBookInputSchema.safeParse({
        workSlug: 's'.repeat(201),
        status: 'WANT',
      }).success,
    ).toBe(false);
  });

  it('AddLibraryItemDto aliases UpsertUserBook (status required)', () => {
    expect(
      AddLibraryItemDto.schema.safeParse({ workId: 'work-1' }).success,
    ).toBe(false);
    expect(
      AddLibraryItemInputSchema.safeParse({
        workSlug: 'demo',
        status: 'ABANDONED',
        rating: null,
      }).success,
    ).toBe(true);
  });

  it('PatchUserBookDto requires status and/or rating', () => {
    expect(PatchUserBookDto.schema.safeParse({}).success).toBe(false);
    expect(PatchUserBookDto.schema.safeParse({ status: 'READ' }).success).toBe(
      true,
    );
    expect(PatchUserBookDto.schema.safeParse({ rating: 5 }).success).toBe(true);
    expect(PatchUserBookInputSchema.safeParse({ rating: null }).success).toBe(
      true,
    );
    expect(PatchUserBookInputSchema.safeParse({ rating: 12 }).success).toBe(
      false,
    );
  });

  it('ProfileSlugParamDto accepts non-empty trimmed slug', () => {
    const result = ProfileSlugParamDto.schema.safeParse({
      slug: '  demo-reader  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ slug: 'demo-reader' });
    }
    expect(
      ProfileSlugParamSchema.safeParse({ slug: 'demo-reader' }).success,
    ).toBe(true);
  });

  it('ProfileSlugParamDto rejects empty or oversized slug', () => {
    expect(ProfileSlugParamDto.schema.safeParse({ slug: '' }).success).toBe(
      false,
    );
    expect(ProfileSlugParamDto.schema.safeParse({ slug: '   ' }).success).toBe(
      false,
    );
    expect(
      ProfileSlugParamSchema.safeParse({ slug: 'a'.repeat(201) }).success,
    ).toBe(false);
  });
});
