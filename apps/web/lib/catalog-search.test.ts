import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, noStoreConfig } from './http';
import {
  CATALOG_ENTITY_TYPE_LABELS,
  fetchCatalogSearch,
} from './catalog-search';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('fetchCatalogSearch', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed search response from API', async () => {
    const mockResponse = {
      query: 'гарри',
      items: [
        {
          type: 'WORK' as const,
          id: 'work-1',
          slug: 'garri-potter',
          title: 'Гарри Поттер',
          path: '/books/garri-potter',
        },
      ],
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogSearch('гарри');

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/search?q='),
      noStoreConfig,
    );
  });
});

describe('CATALOG_ENTITY_TYPE_LABELS', () => {
  it('maps entity types to Russian labels', () => {
    expect(CATALOG_ENTITY_TYPE_LABELS.WORK).toBe('Произведение');
    expect(CATALOG_ENTITY_TYPE_LABELS.AUTHOR).toBe('Автор');
  });
});
