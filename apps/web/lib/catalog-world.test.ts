import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import { CatalogWorldNotFoundError, fetchCatalogWorld } from './catalog-world';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('fetchCatalogWorld', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogWorld('volshebnyy-mir');

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/worlds/volshebnyy-mir'),
      noStoreConfig,
    );
  });

  it('throws CatalogWorldNotFoundError on 404', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(404, 'Not Found'));

    await expect(fetchCatalogWorld('missing')).rejects.toBeInstanceOf(
      CatalogWorldNotFoundError,
    );
  });
});
