import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  AdminContextReadingIdParamSchema,
  AdminWorkIdParamSchema,
  CollectionSlugParamSchema,
  CollectionStatusSchema,
  ExternalRankingMatchStatusSchema,
  RankingSlugParamSchema,
  RankingStatusSchema,
  RankingsAggregatePublishInputSchema,
  RankingsImportSourceInputSchema,
} from '@bookspace/schemas';

describe('Rankings/Collections/Admin Zod shared contracts (bd-0t0.10)', () => {
  const adminWorkSource = readFileSync(
    path.join(__dirname, 'admin-work.controller.ts'),
    'utf8',
  );
  const adminContextSource = readFileSync(
    path.join(__dirname, '../context/admin-context.controller.ts'),
    'utf8',
  );
  const adminContextDtoSource = readFileSync(
    path.join(__dirname, '../context/dto/admin-context.dto.ts'),
    'utf8',
  );
  const catalogEntityDtoSource = readFileSync(
    path.join(__dirname, '../catalog/dto/catalog-entity.dto.ts'),
    'utf8',
  );

  it('exports rankings/collections status and slug contracts', () => {
    for (const status of ['DRAFT', 'PUBLISHED'] as const) {
      expect(RankingStatusSchema.safeParse(status).success).toBe(true);
      expect(CollectionStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(RankingStatusSchema.safeParse('ARCHIVED').success).toBe(false);
    expect(CollectionStatusSchema.safeParse('REJECTED').success).toBe(false);

    expect(
      RankingSlugParamSchema.safeParse({ slug: 'top-100-classics' }).success,
    ).toBe(true);
    expect(RankingSlugParamSchema.safeParse({ slug: '' }).success).toBe(false);
    expect(
      CollectionSlugParamSchema.safeParse({ slug: 'silver-age' }).success,
    ).toBe(true);
    expect(CollectionSlugParamSchema.safeParse({ slug: '   ' }).success).toBe(
      false,
    );

    for (const status of ['MATCHED', 'UNMATCHED', 'IGNORED'] as const) {
      expect(ExternalRankingMatchStatusSchema.safeParse(status).success).toBe(
        true,
      );
    }
    expect(ExternalRankingMatchStatusSchema.safeParse('PENDING').success).toBe(
      false,
    );
  });

  it('exports future rankings job input contracts', () => {
    expect(
      RankingsImportSourceInputSchema.safeParse({ sourceKey: 'greatest-books' })
        .success,
    ).toBe(true);
    expect(
      RankingsImportSourceInputSchema.safeParse({ sourceKey: '' }).success,
    ).toBe(false);
    expect(
      RankingsAggregatePublishInputSchema.safeParse({
        themeKey: 'ww2',
        topN: '50',
      }).success,
    ).toBe(true);
    expect(
      RankingsAggregatePublishInputSchema.safeParse({ themeKey: '' }).success,
    ).toBe(false);
    expect(
      RankingsAggregatePublishInputSchema.safeParse({
        themeKey: 'ww2',
        topN: 0,
      }).success,
    ).toBe(false);
  });

  it('exports admin path param contracts', () => {
    expect(
      AdminWorkIdParamSchema.safeParse({
        workId: '550e8400-e29b-41d4-a716-446655440000',
      }).success,
    ).toBe(true);
    expect(AdminWorkIdParamSchema.safeParse({ workId: '' }).success).toBe(
      false,
    );
    expect(
      AdminContextReadingIdParamSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }).success,
    ).toBe(true);
    expect(
      AdminContextReadingIdParamSchema.safeParse({ id: '  ' }).success,
    ).toBe(false);
  });

  it('admin controllers use Zod path DTOs and no class-validator', () => {
    expect(adminWorkSource).toMatch(/AdminWorkIdParamDto/);
    expect(adminWorkSource).not.toMatch(/@Param\('workId'\)/);
    expect(adminContextSource).toMatch(/AdminContextReadingIdParamDto/);
    expect(adminContextSource).not.toMatch(/@Param\('id'\)/);
    expect(adminContextDtoSource).toMatch(/AdminContextReadingIdParamDto/);
    expect(catalogEntityDtoSource).toMatch(/AdminWorkIdParamDto/);

    for (const source of [
      adminWorkSource,
      adminContextSource,
      adminContextDtoSource,
      catalogEntityDtoSource,
    ]) {
      expect(source).not.toMatch(/class-validator/);
      expect(source).not.toMatch(/@IsString/);
      expect(source).not.toMatch(/@IsOptional/);
    }
  });
});
