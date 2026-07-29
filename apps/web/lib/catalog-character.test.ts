import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  CatalogCharacterNotFoundError,
  fetchCatalogCharacter,
} from './catalog-character';

const catalogCharacterSource = readFileSync(
  path.join(__dirname, 'catalog-character.ts'),
  'utf8',
);

describe('fetchCatalogCharacter', () => {
  it('imports CharacterRelationType from shared schemas (bd-0t0.9)', () => {
    expect(catalogCharacterSource).toMatch(/from ['"]@bookspace\/schemas['"]/);
    expect(catalogCharacterSource).toMatch(/CharacterRelationType/);
    expect(catalogCharacterSource).not.toMatch(
      /export type CharacterRelationType = 'FRIEND'/,
    );
  });

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
