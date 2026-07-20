import { describe, expect, it, vi } from 'vitest';
import {
  CatalogCharacterNotFoundError,
  fetchCatalogCharacter,
} from './catalog-character';

describe('fetchCatalogCharacter', () => {
  it('returns parsed character response from API', async () => {
    const mockResponse = {
      slug: 'garri-potter',
      nameRu: 'Гарри Поттер',
      nameOrig: 'Harry Potter',
      appearances: [
        {
          slug: 'garri-potter-filosofskiy-kamen',
          titleRu: 'Гарри Поттер и философский камень',
          yearFirst: 1997,
        },
      ],
      relations: [
        {
          slug: 'germiona-greindzher',
          nameRu: 'Гермиона Грейнджер',
          type: 'FRIEND',
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

    const result = await fetchCatalogCharacter('garri-potter');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/characters/garri-potter'),
      { cache: 'no-store' },
    );
  });

  it('throws CatalogCharacterNotFoundError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(fetchCatalogCharacter('missing')).rejects.toBeInstanceOf(
      CatalogCharacterNotFoundError,
    );
  });
});
