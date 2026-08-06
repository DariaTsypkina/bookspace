import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  CONTEXT_READING_DISCLAIMER,
  fetchCatalogContextReadings,
  hasContextReadings,
} from './catalog-context-reading';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('fetchCatalogContextReadings', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogContextReadings(
      'garri-potter-filosofskiy-kamen',
    );

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining(
        '/catalog/works/garri-potter-filosofskiy-kamen/context-readings',
      ),
      noStoreConfig,
    );
  });

  it('returns empty items on API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(500, 'Server error'));

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
