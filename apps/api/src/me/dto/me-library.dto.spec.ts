import {
  AddLibraryItemInputSchema,
  ProfileSlugParamSchema,
} from '@bookspace/schemas';
import { AddLibraryItemDto, ProfileSlugParamDto } from './me-library.dto';

describe('Me library Zod DTO shared schemas', () => {
  it('AddLibraryItemDto accepts optional workId within max length', () => {
    expect(AddLibraryItemDto.schema.safeParse({}).success).toBe(true);
    const withId = AddLibraryItemDto.schema.safeParse({ workId: 'work-1' });
    expect(withId.success).toBe(true);
    if (withId.success) {
      expect(withId.data).toEqual({ workId: 'work-1' });
    }
    expect(
      AddLibraryItemInputSchema.safeParse({ workId: 'work-1' }).success,
    ).toBe(true);
  });

  it('AddLibraryItemDto rejects oversized workId', () => {
    expect(
      AddLibraryItemDto.schema.safeParse({ workId: 'w'.repeat(129) }).success,
    ).toBe(false);
    expect(
      AddLibraryItemInputSchema.safeParse({ workId: 'w'.repeat(129) }).success,
    ).toBe(false);
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
