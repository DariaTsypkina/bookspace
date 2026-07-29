import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import { CatalogPlaceNotFoundError, fetchCatalogPlace } from './catalog-place';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('fetchCatalogPlace', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogPlace('hogvarts');

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/places/hogvarts'),
      noStoreConfig,
    );
  });

  it('throws CatalogPlaceNotFoundError on 404', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(404, 'Not Found'));

    await expect(fetchCatalogPlace('missing')).rejects.toBeInstanceOf(
      CatalogPlaceNotFoundError,
    );
  });
});
