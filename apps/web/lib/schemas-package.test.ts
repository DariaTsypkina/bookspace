import { describe, expect, it } from 'vitest';
import {
  AddLibraryItemInputSchema,
  AdminContextExtractInputSchema,
  AdminContextListRecentQuerySchema,
  AdminContextPatchFormSchema,
  AdminContextPatchInputSchema,
  AdminContextPublishInputSchema,
  AdminContextReadingIdParamSchema,
  AdminWorkIdParamSchema,
  CatalogSearchQuerySchema,
  CharacterRelationTypeSchema,
  CollectionSlugParamSchema,
  CollectionStatusSchema,
  ExternalRankingMatchStatusSchema,
  LoginInputSchema,
  ProfileSlugParamSchema,
  RankingSlugParamSchema,
  RankingStatusSchema,
  RankingsAggregatePublishInputSchema,
  RankingsImportSourceInputSchema,
  SearchBooksInputSchema,
  SearchQueryFormSchema,
  SpoilersConsentInputSchema,
  SpoilersOkCookieValueSchema,
  WorkRelationTypeSchema,
} from '@bookspace/schemas';

describe('@bookspace/schemas export contract', () => {
  it('exports auth/search/admin-context input schemas', () => {
    expect(
      LoginInputSchema.safeParse({
        email: 'user@example.com',
        password: 'Strong123!',
      }).success,
    ).toBe(true);
    expect(
      SearchBooksInputSchema.safeParse({
        query: 'Мастер и Маргарита',
        limit: 10,
      }).success,
    ).toBe(true);
    expect(
      AdminContextPublishInputSchema.safeParse({
        workId: 'work_123',
        sourceUrl: 'https://example.org/context',
        model: 'gpt-5-mini',
      }).success,
    ).toBe(true);
    expect(SearchQueryFormSchema.safeParse({ query: '' }).success).toBe(true);
    expect(
      CatalogSearchQuerySchema.safeParse({ q: 'гарри', limit: 10 }).success,
    ).toBe(true);
    expect(
      AdminContextListRecentQuerySchema.safeParse({ days: '7' }).success,
    ).toBe(true);
    expect(
      AdminContextPatchInputSchema.safeParse({
        whyText: 'Обновлённый текст',
        importanceRank: '2',
      }).success,
    ).toBe(true);
    expect(
      AdminContextPatchFormSchema.safeParse({
        whyText: 'Почему стоит прочитать',
        importanceRank: '1',
      }).success,
    ).toBe(true);
    expect(
      AdminContextExtractInputSchema.safeParse({ async: true, force: false })
        .success,
    ).toBe(true);
    expect(AddLibraryItemInputSchema.safeParse({}).success).toBe(false);
    expect(
      AddLibraryItemInputSchema.safeParse({
        workId: 'work-1',
        status: 'WANT',
      }).success,
    ).toBe(true);
    expect(
      ProfileSlugParamSchema.safeParse({ slug: 'demo-reader' }).success,
    ).toBe(true);
    expect(SpoilersOkCookieValueSchema.safeParse('1').success).toBe(true);
    expect(SpoilersConsentInputSchema.safeParse({ value: '1' }).success).toBe(
      true,
    );
    expect(CharacterRelationTypeSchema.safeParse('FRIEND').success).toBe(true);
    expect(WorkRelationTypeSchema.safeParse('SEQUEL').success).toBe(true);
    expect(RankingStatusSchema.safeParse('PUBLISHED').success).toBe(true);
    expect(RankingSlugParamSchema.safeParse({ slug: 'top-100' }).success).toBe(
      true,
    );
    expect(ExternalRankingMatchStatusSchema.safeParse('MATCHED').success).toBe(
      true,
    );
    expect(
      RankingsImportSourceInputSchema.safeParse({ sourceKey: 'guardian' })
        .success,
    ).toBe(true);
    expect(
      RankingsAggregatePublishInputSchema.safeParse({ themeKey: 'classics' })
        .success,
    ).toBe(true);
    expect(CollectionStatusSchema.safeParse('DRAFT').success).toBe(true);
    expect(
      CollectionSlugParamSchema.safeParse({ slug: 'silver-age' }).success,
    ).toBe(true);
    expect(AdminWorkIdParamSchema.safeParse({ workId: 'work-1' }).success).toBe(
      true,
    );
    expect(
      AdminContextReadingIdParamSchema.safeParse({ id: 'reading-1' }).success,
    ).toBe(true);
  });

  it('rejects invalid payloads', () => {
    expect(
      LoginInputSchema.safeParse({ email: 'not-email', password: '123' })
        .success,
    ).toBe(false);
    expect(SearchBooksInputSchema.safeParse({ query: 'ab' }).success).toBe(
      false,
    );
    expect(SearchQueryFormSchema.safeParse({ query: 'ab' }).success).toBe(
      false,
    );
    expect(CatalogSearchQuerySchema.safeParse({ q: 'ab' }).success).toBe(false);
    expect(
      AdminContextPublishInputSchema.safeParse({
        workId: '',
        sourceUrl: 'notaurl',
        model: '',
      }).success,
    ).toBe(false);
    expect(
      AdminContextListRecentQuerySchema.safeParse({ days: '0' }).success,
    ).toBe(false);
    expect(
      AdminContextPatchInputSchema.safeParse({ importanceRank: 100 }).success,
    ).toBe(false);
    expect(
      AdminContextPatchFormSchema.safeParse({
        whyText: '',
        importanceRank: '1',
      }).success,
    ).toBe(false);
    expect(
      AdminContextPatchFormSchema.safeParse({
        whyText: 'ok',
        importanceRank: '100',
      }).success,
    ).toBe(false);
    expect(
      AdminContextExtractInputSchema.safeParse({ async: 'yes' }).success,
    ).toBe(false);
    expect(
      AddLibraryItemInputSchema.safeParse({ workId: 'w'.repeat(129) }).success,
    ).toBe(false);
    expect(ProfileSlugParamSchema.safeParse({ slug: '' }).success).toBe(false);
    expect(
      ProfileSlugParamSchema.safeParse({ slug: 'a'.repeat(201) }).success,
    ).toBe(false);
    expect(SpoilersOkCookieValueSchema.safeParse('0').success).toBe(false);
    expect(SpoilersConsentInputSchema.safeParse({ value: 'yes' }).success).toBe(
      false,
    );
    expect(CharacterRelationTypeSchema.safeParse('ALLY').success).toBe(false);
    expect(WorkRelationTypeSchema.safeParse('SPINOFF').success).toBe(false);
    expect(RankingStatusSchema.safeParse('ARCHIVED').success).toBe(false);
    expect(RankingSlugParamSchema.safeParse({ slug: '' }).success).toBe(false);
    expect(ExternalRankingMatchStatusSchema.safeParse('PENDING').success).toBe(
      false,
    );
    expect(
      RankingsImportSourceInputSchema.safeParse({ sourceKey: '' }).success,
    ).toBe(false);
    expect(
      RankingsAggregatePublishInputSchema.safeParse({
        themeKey: 'x',
        topN: 0,
      }).success,
    ).toBe(false);
    expect(CollectionStatusSchema.safeParse('REJECTED').success).toBe(false);
    expect(CollectionSlugParamSchema.safeParse({ slug: '  ' }).success).toBe(
      false,
    );
    expect(AdminWorkIdParamSchema.safeParse({ workId: '' }).success).toBe(
      false,
    );
    expect(AdminContextReadingIdParamSchema.safeParse({ id: '' }).success).toBe(
      false,
    );
  });
});
