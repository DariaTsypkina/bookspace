import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  CatalogCharacterNotFoundError,
  fetchCatalogCharacter,
} from './catalog-character';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

const catalogCharacterSource = readFileSync(
  path.join(__dirname, 'catalog-character.ts'),
  'utf8',
);

describe('fetchCatalogCharacter', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await fetchCatalogCharacter('garri-potter');

    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/catalog/characters/garri-potter'),
      noStoreConfig,
    );
  });

  it('throws CatalogCharacterNotFoundError on 404', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(404, 'Not Found'));

    await expect(fetchCatalogCharacter('missing')).rejects.toBeInstanceOf(
      CatalogCharacterNotFoundError,
    );
  });
});
