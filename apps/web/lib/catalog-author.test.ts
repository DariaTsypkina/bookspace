import { describe, expect, it, vi } from 'vitest';
import {
  CatalogAuthorNotFoundError,
  fetchCatalogAuthor,
} from './catalog-author';

describe('fetchCatalogAuthor', () => {
  it('returns parsed author response from API', async () => {
    const mockResponse = {
      slug: 'dzh-k-rouling',
      nameRu: 'Дж. К. Роулинг',
      nameOrig: 'J. K. Rowling',
      works: [
        {
          slug: 'garri-potter-filosofskiy-kamen',
          titleRu: 'Гарри Поттер и философский камень',
          yearFirst: 1997,
        },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      }),
    );

    const result = await fetchCatalogAuthor('dzh-k-rouling');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/authors/dzh-k-rouling'),
      { cache: 'no-store' },
    );
  });

  it('throws CatalogAuthorNotFoundError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(fetchCatalogAuthor('missing')).rejects.toBeInstanceOf(
      CatalogAuthorNotFoundError,
    );
  });
});
