import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './http';
import {
  fetchCatalogContextReadings,
  hasContextReadings,
} from './catalog-context-reading';
import { shouldRenderWorkContextReadingSection } from './work-page-context-reading';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('work page context reading integration', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not render section when API returns no items', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } });

    const { items } = await fetchCatalogContextReadings(
      'garri-potter-filosofskiy-kamen',
    );

    expect(hasContextReadings(items)).toBe(false);
    expect(shouldRenderWorkContextReadingSection(items)).toBe(false);
  });

  it('renders section when API returns published readings', async () => {
    const items = [
      {
        recommendedWork: { slug: 'hobbit', titleRu: 'Хоббит' },
        importanceRank: 1,
        whyText: 'Рекомендуется для понимания мира.',
      },
    ];

    vi.mocked(api.get).mockResolvedValue({ data: { items } });

    const response = await fetchCatalogContextReadings('some-work');

    expect(hasContextReadings(response.items)).toBe(true);
    expect(shouldRenderWorkContextReadingSection(response.items)).toBe(true);
  });

  it('does not expose source fields in public API response', async () => {
    const items = [
      {
        recommendedWork: { slug: 'hobbit', titleRu: 'Хоббит' },
        importanceRank: 1,
        whyText: 'Полезный контекст.',
      },
    ];

    vi.mocked(api.get).mockResolvedValue({ data: { items } });

    const { items: responseItems } =
      await fetchCatalogContextReadings('some-work');

    for (const item of responseItems) {
      expect(item).not.toHaveProperty('sourceUrl');
      expect(item).not.toHaveProperty('sourceSnippet');
      expect(item).not.toHaveProperty('model');
      expect(item).not.toHaveProperty('snippet');
    }
  });
});
