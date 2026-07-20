import { describe, expect, it, vi } from 'vitest';
import { CatalogPlaceNotFoundError, fetchCatalogPlace } from './catalog-place';

describe('fetchCatalogPlace', () => {
  it('returns parsed place response from API', async () => {
    const mockResponse = {
      slug: 'hogvarts',
      nameRu: 'Хогвартс',
      nameOrig: 'Hogwarts',
      world: {
        slug: 'volshebnyy-mir',
        nameRu: 'Волшебный мир',
        nameOrig: 'Wizarding World',
      },
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

    const result = await fetchCatalogPlace('hogvarts');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/places/hogvarts'),
      { cache: 'no-store' },
    );
  });

  it('throws CatalogPlaceNotFoundError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(fetchCatalogPlace('missing')).rejects.toBeInstanceOf(
      CatalogPlaceNotFoundError,
    );
  });
});
