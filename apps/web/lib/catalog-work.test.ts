import { describe, expect, it, vi } from 'vitest';
import {
  CatalogWorkNotFoundError,
  EDITION_LANGUAGE_LABELS,
  fetchCatalogWork,
  formatEditionLanguage,
} from './catalog-work';

describe('fetchCatalogWork', () => {
  it('returns parsed work response from API', async () => {
    const mockResponse = {
      slug: 'garri-potter',
      titleRu: 'Гарри Поттер',
      authors: [{ slug: 'rouling', nameRu: 'Дж. К. Роулинг' }],
      editions: [{ language: 'ru', translator: 'М. Спивак' }],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      }),
    );

    const result = await fetchCatalogWork('garri-potter');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/works/garri-potter'),
      { cache: 'no-store' },
    );
  });

  it('throws CatalogWorkNotFoundError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(fetchCatalogWork('missing')).rejects.toBeInstanceOf(
      CatalogWorkNotFoundError,
    );
  });

  it('rejects empty slug via shared CatalogEntitySlugParamSchema before fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCatalogWork('   ')).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('formatEditionLanguage', () => {
  it('maps known language codes to Russian labels', () => {
    expect(formatEditionLanguage('ru')).toBe('Русский');
    expect(formatEditionLanguage('en')).toBe('Английский');
  });

  it('falls back to uppercase code for unknown languages', () => {
    expect(formatEditionLanguage('ja')).toBe('JA');
  });
});

describe('EDITION_LANGUAGE_LABELS', () => {
  it('includes common edition languages', () => {
    expect(EDITION_LANGUAGE_LABELS.ru).toBe('Русский');
  });
});
