import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  CatalogWorkNotFoundError,
  EDITION_LANGUAGE_LABELS,
  fetchCatalogWork,
  formatEditionLanguage,
  WORK_RELATION_LABELS,
} from './catalog-work';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe('fetchCatalogWork', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed work response from API', async () => {
    const mockResponse = {
      slug: 'garri-potter',
      titleRu: 'Гарри Поттер',
      authors: [{ slug: 'rouling', nameRu: 'Дж. К. Роулинг' }],
      editions: [{ language: 'ru', translator: 'М. Спивак' }],
      relations: [
        {
          slug: 'garri-potter-taynaya-komnata',
          titleRu: 'Гарри Поттер и Тайная комната',
          type: 'SEQUEL' as const,
        },
      ],
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogWork('garri-potter');

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/works/garri-potter'),
      noStoreConfig,
    );
  });

  it('throws CatalogWorkNotFoundError on 404', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(404, 'Not Found'));

    await expect(fetchCatalogWork('missing')).rejects.toBeInstanceOf(
      CatalogWorkNotFoundError,
    );
  });

  it('rejects empty slug via shared CatalogEntitySlugParamSchema before fetch', async () => {
    await expect(fetchCatalogWork('   ')).rejects.toThrow();
    expect(api.get).not.toHaveBeenCalled();
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

describe('WORK_RELATION_LABELS', () => {
  it('maps all WorkRelation types to distinct Russian labels', () => {
    expect(WORK_RELATION_LABELS.SEQUEL).toBe('Продолжение');
    expect(WORK_RELATION_LABELS.PREQUEL).toBe('Предыстория');
    expect(WORK_RELATION_LABELS.RELATED).toBe('Связано');
    expect(WORK_RELATION_LABELS.ADAPTATION).toBe('Адаптация');
    const labels = Object.values(WORK_RELATION_LABELS);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
