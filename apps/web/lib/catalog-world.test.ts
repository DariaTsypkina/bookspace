import { describe, expect, it, vi } from 'vitest';
import { CatalogWorldNotFoundError, fetchCatalogWorld } from './catalog-world';

describe('fetchCatalogWorld', () => {
  it('returns parsed world response from API', async () => {
    const mockResponse = {
      slug: 'volshebnyy-mir',
      nameRu: 'Волшебный мир',
      nameOrig: 'Wizarding World',
      descriptionRu: 'Мир волшебников и магии.',
      places: [
        {
          slug: 'hogvarts',
          nameRu: 'Хогвартс',
          nameOrig: 'Hogwarts',
        },
      ],
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

    const result = await fetchCatalogWorld('volshebnyy-mir');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/worlds/volshebnyy-mir'),
      { cache: 'no-store' },
    );
  });

  it('throws CatalogWorldNotFoundError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(fetchCatalogWorld('missing')).rejects.toBeInstanceOf(
      CatalogWorldNotFoundError,
    );
  });
});
