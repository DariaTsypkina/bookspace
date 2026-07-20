import { describe, expect, it, vi } from 'vitest';
import {
  CATALOG_ENTITY_TYPE_LABELS,
  fetchCatalogSearch,
} from './catalog-search';

describe('fetchCatalogSearch', () => {
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

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const result = await fetchCatalogSearch('гарри');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/search?q='),
      { cache: 'no-store' },
    );
  });
});

describe('CATALOG_ENTITY_TYPE_LABELS', () => {
  it('maps entity types to Russian labels', () => {
    expect(CATALOG_ENTITY_TYPE_LABELS.WORK).toBe('Произведение');
    expect(CATALOG_ENTITY_TYPE_LABELS.AUTHOR).toBe('Автор');
  });
});
