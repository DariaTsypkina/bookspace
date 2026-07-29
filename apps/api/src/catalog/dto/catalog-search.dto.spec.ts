import { CatalogSearchQuerySchema } from '@bookspace/schemas';
import { CatalogSearchQueryDto } from './catalog-search.dto';

describe('CatalogSearchQueryDto shared schema', () => {
  it('accepts empty or missing q for hints response', () => {
    expect(CatalogSearchQueryDto.schema.safeParse({}).success).toBe(true);
    expect(CatalogSearchQueryDto.schema.safeParse({ q: '' }).success).toBe(
      true,
    );
    expect(CatalogSearchQuerySchema.safeParse({ q: '' }).success).toBe(true);
  });

  it('accepts valid non-empty q and optional limit', () => {
    const result = CatalogSearchQueryDto.schema.safeParse({
      q: 'гарри',
      limit: '10',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ q: 'гарри', limit: 10 });
    }
  });

  it('rejects q shorter than 3 characters when non-empty', () => {
    const result = CatalogSearchQueryDto.schema.safeParse({ q: 'ab' });

    expect(result.success).toBe(false);
    expect(CatalogSearchQuerySchema.safeParse({ q: 'ab' }).success).toBe(false);
  });

  it('rejects limit outside 1..50', () => {
    expect(
      CatalogSearchQueryDto.schema.safeParse({ q: 'valid', limit: '0' })
        .success,
    ).toBe(false);
    expect(
      CatalogSearchQueryDto.schema.safeParse({ q: 'valid', limit: '51' })
        .success,
    ).toBe(false);
  });
});
