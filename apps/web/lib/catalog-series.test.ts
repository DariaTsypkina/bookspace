import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  CatalogSeriesNotFoundError,
  fetchCatalogSeries,
} from './catalog-series';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('fetchCatalogSeries', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed series response from API', async () => {
    const mockResponse = {
      slug: 'garri-potter',
      nameRu: 'Гарри Поттер',
      nameOrig: 'Harry Potter',
      works: [
        {
          slug: 'garri-potter-filosofskiy-kamen',
          titleRu: 'Гарри Поттер и философский камень',
          yearFirst: 1997,
          positionInSeries: 1,
        },
      ],
      readingOrder: [
        {
          step: 1,
          slug: 'garri-potter-filosofskiy-kamen',
          titleRu: 'Гарри Поттер и философский камень',
        },
      ],
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogSeries('garri-potter');

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/series/garri-potter'),
      noStoreConfig,
    );
  });

  it('throws CatalogSeriesNotFoundError on 404', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(404, 'Not Found'));

    await expect(fetchCatalogSeries('missing')).rejects.toBeInstanceOf(
      CatalogSeriesNotFoundError,
    );
  });
});
