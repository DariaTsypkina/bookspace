import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  createAdminSeries,
  fetchAdminCatalogEntities,
  publishAdminCatalogEntity,
  softDeleteAdminCatalogEntity,
  entityStatusLabel,
  publicPathForEntity,
} from './admin-catalog-entities';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('admin-catalog-entities client', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.delete).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lists series via BFF', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    await fetchAdminCatalogEntities('series', 'дюна');
    expect(api.get).toHaveBeenCalledWith(
      '/api/admin/series?q=%D0%B4%D1%8E%D0%BD%D0%B0',
      noStoreConfig,
    );
  });

  it('creates, publishes and soft-deletes a series', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 's1', status: 'DRAFT', nameRu: 'Дюна' },
    });
    await createAdminSeries({ nameRu: 'Дюна' });
    expect(api.post).toHaveBeenCalledWith('/api/admin/series', {
      nameRu: 'Дюна',
    });

    vi.mocked(api.post).mockResolvedValue({
      data: { id: 's1', status: 'PUBLISHED' },
    });
    await publishAdminCatalogEntity('series', 's1');
    expect(api.post).toHaveBeenCalledWith('/api/admin/series/s1/publish');

    vi.mocked(api.delete).mockResolvedValue({
      data: { id: 's1', deletedAt: '2026-08-06' },
    });
    await softDeleteAdminCatalogEntity('series', 's1');
    expect(api.delete).toHaveBeenCalledWith('/api/admin/series/s1');
  });

  it('rethrows ApiError', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(403, 'Forbidden'));
    await expect(
      fetchAdminCatalogEntities('characters'),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('maps status and public paths', () => {
    expect(entityStatusLabel('DRAFT')).toBe('Черновик');
    expect(publicPathForEntity('worlds', 'arrakis')).toBe('/worlds/arrakis');
  });
});
