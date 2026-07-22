import { describe, expect, it, vi } from 'vitest';
import {
  CONTEXT_READING_DISCLAIMER,
  fetchCatalogContextReadings,
  hasContextReadings,
} from './catalog-context-reading';

describe('fetchCatalogContextReadings', () => {
  it('returns parsed context readings from API', async () => {
    const mockResponse = {
      items: [
        {
          recommendedWork: {
            slug: 'hobbit',
            titleRu: 'Хоббит',
          },
          importanceRank: 1,
          whyText: 'Вводит в мир фэнтези.',
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

    const result = await fetchCatalogContextReadings(
      'garri-potter-filosofskiy-kamen',
    );

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/catalog/works/garri-potter-filosofskiy-kamen/context-readings',
      ),
      { cache: 'no-store' },
    );
  });

  it('returns empty items on API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const result = await fetchCatalogContextReadings('missing');

    expect(result).toEqual({ items: [] });
  });
});

describe('hasContextReadings', () => {
  it('is false for empty list', () => {
    expect(hasContextReadings([])).toBe(false);
  });

  it('is true when items exist', () => {
    expect(
      hasContextReadings([
        {
          recommendedWork: { slug: 'hobbit', titleRu: 'Хоббит' },
          importanceRank: 1,
          whyText: 'Полезно для контекста.',
        },
      ]),
    ).toBe(true);
  });
});

describe('CONTEXT_READING_DISCLAIMER', () => {
  it('is Russian auto-generated disclaimer text', () => {
    expect(CONTEXT_READING_DISCLAIMER).toMatch(/автоматически/i);
  });
});
