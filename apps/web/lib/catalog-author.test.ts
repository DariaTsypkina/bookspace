import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  CatalogAuthorNotFoundError,
  fetchCatalogAuthor,
} from './catalog-author';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('fetchCatalogAuthor', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogAuthor('dzh-k-rouling');

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/authors/dzh-k-rouling'),
      noStoreConfig,
    );
  });

  it('throws CatalogAuthorNotFoundError on 404', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(404, 'Not Found'));

    await expect(fetchCatalogAuthor('missing')).rejects.toBeInstanceOf(
      CatalogAuthorNotFoundError,
    );
  });
});
