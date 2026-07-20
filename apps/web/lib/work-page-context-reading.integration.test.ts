import { describe, expect, it, vi } from 'vitest';
import {
  fetchCatalogContextReadings,
  hasContextReadings,
} from './catalog-context-reading';
import { shouldRenderWorkContextReadingSection } from './work-page-context-reading';

describe('work page context reading integration', () => {
  it('does not render section when API returns no items', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ items: [] }),
      }),
    );

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

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ items }),
      }),
    );

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

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ items }),
      }),
    );

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
