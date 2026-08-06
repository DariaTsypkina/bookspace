import {
  AdminWorkIdParamSchema,
  AdminWorkNeedsContextPatchInputSchema,
  CatalogEntitySlugParamSchema,
} from '@bookspace/schemas';
import {
  AdminWorkIdParamDto,
  AdminWorkNeedsContextPatchDto,
  CatalogEntitySlugParamDto,
} from './catalog-entity.dto';

describe('Catalog entity Zod DTO shared schemas', () => {
  it('CatalogEntitySlugParamDto accepts non-empty trimmed slug', () => {
    const result = CatalogEntitySlugParamDto.schema.safeParse({
      slug: '  garri-potter  ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ slug: 'garri-potter' });
    }
    expect(
      CatalogEntitySlugParamSchema.safeParse({ slug: 'garri-potter' }).success,
    ).toBe(true);
  });

  it('CatalogEntitySlugParamDto rejects empty or oversized slug', () => {
    expect(
      CatalogEntitySlugParamDto.schema.safeParse({ slug: '' }).success,
    ).toBe(false);
    expect(
      CatalogEntitySlugParamDto.schema.safeParse({ slug: '   ' }).success,
    ).toBe(false);
    expect(
      CatalogEntitySlugParamSchema.safeParse({
        slug: 'a'.repeat(201),
      }).success,
    ).toBe(false);
  });

  it('AdminWorkNeedsContextPatchDto accepts NeedsContext enum values', () => {
    for (const needsContext of ['UNKNOWN', 'YES', 'NO'] as const) {
      const result = AdminWorkNeedsContextPatchDto.schema.safeParse({
        needsContext,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ needsContext });
      }
    }
    expect(
      AdminWorkNeedsContextPatchInputSchema.safeParse({ needsContext: 'YES' })
        .success,
    ).toBe(true);
  });

  it('AdminWorkNeedsContextPatchDto rejects invalid needsContext', () => {
    expect(
      AdminWorkNeedsContextPatchDto.schema.safeParse({ needsContext: 'MAYBE' })
        .success,
    ).toBe(false);
    expect(AdminWorkNeedsContextPatchInputSchema.safeParse({}).success).toBe(
      false,
    );
    expect(
      AdminWorkNeedsContextPatchInputSchema.safeParse({
        needsContext: 'yes',
      }).success,
    ).toBe(false);
  });

  it('AdminWorkIdParamDto accepts non-empty trimmed workId', () => {
    const result = AdminWorkIdParamDto.schema.safeParse({
      workId: '  work-123  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ workId: 'work-123' });
    }
    expect(
      AdminWorkIdParamSchema.safeParse({ workId: 'work-123' }).success,
    ).toBe(true);
  });

  it('AdminWorkIdParamDto rejects empty or oversized workId', () => {
    expect(AdminWorkIdParamDto.schema.safeParse({ workId: '' }).success).toBe(
      false,
    );
    expect(
      AdminWorkIdParamSchema.safeParse({ workId: 'w'.repeat(129) }).success,
    ).toBe(false);
  });
});
