import {
  AdminContextExtractInputSchema,
  AdminContextListRecentQuerySchema,
  AdminContextPatchInputSchema,
} from '@bookspace/schemas';
import {
  AdminContextExtractDto,
  AdminContextListRecentQueryDto,
  AdminContextPatchDto,
} from './admin-context.dto';

describe('Admin context Zod DTO shared schemas', () => {
  it('ListRecentQueryDto accepts optional days in 1..90 with coerce', () => {
    expect(AdminContextListRecentQueryDto.schema.safeParse({}).success).toBe(
      true,
    );
    const result = AdminContextListRecentQueryDto.schema.safeParse({
      days: '14',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ days: 14 });
    }
    expect(
      AdminContextListRecentQuerySchema.safeParse({ days: 0 }).success,
    ).toBe(false);
    expect(
      AdminContextListRecentQuerySchema.safeParse({ days: 91 }).success,
    ).toBe(false);
  });

  it('PatchDto accepts whyText / importanceRank and coerces rank', () => {
    const result = AdminContextPatchDto.schema.safeParse({
      whyText: '  Новый текст  ',
      importanceRank: '3',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        whyText: 'Новый текст',
        importanceRank: 3,
      });
    }
    expect(
      AdminContextPatchInputSchema.safeParse({ importanceRank: 0 }).success,
    ).toBe(false);
    expect(
      AdminContextPatchInputSchema.safeParse({ whyText: '' }).success,
    ).toBe(false);
  });

  it('ExtractDto accepts optional boolean flags', () => {
    expect(AdminContextExtractDto.schema.safeParse({}).success).toBe(true);
    expect(
      AdminContextExtractDto.schema.safeParse({ async: true, force: false })
        .success,
    ).toBe(true);
    expect(
      AdminContextExtractInputSchema.safeParse({ force: 'true' }).success,
    ).toBe(false);
  });
});
