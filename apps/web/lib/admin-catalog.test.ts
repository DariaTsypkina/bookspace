import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  createAdminWork,
  fetchAdminWorks,
  publishAdminWork,
  softDeleteAdminWork,
  addAdminWorkExternalId,
  statusLabel,
} from './admin-catalog';

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

describe('admin-catalog client', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.delete).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lists works via BFF', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    await fetchAdminWorks('война');
    expect(api.get).toHaveBeenCalledWith(
      '/api/admin/works?q=%D0%B2%D0%BE%D0%B9%D0%BD%D0%B0',
      noStoreConfig,
    );
  });

  it('creates, publishes and soft-deletes a work', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'w1', status: 'DRAFT', titleRu: 'Книга' },
    });
    await createAdminWork({ titleRu: 'Книга' });
    expect(api.post).toHaveBeenCalledWith('/api/admin/works', {
      titleRu: 'Книга',
    });

    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'w1', status: 'PUBLISHED' },
    });
    await publishAdminWork('w1');
    expect(api.post).toHaveBeenCalledWith('/api/admin/works/w1/publish');

    vi.mocked(api.delete).mockResolvedValue({
      data: { id: 'w1', deletedAt: '2026-08-06' },
    });
    await softDeleteAdminWork('w1');
    expect(api.delete).toHaveBeenCalledWith('/api/admin/works/w1');
  });

  it('adds ExternalId via BFF', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'e1', source: 'openlibrary', externalKey: 'OL1' },
    });
    await addAdminWorkExternalId('w1', {
      source: 'openlibrary',
      externalKey: 'OL1',
    });
    expect(api.post).toHaveBeenCalledWith('/api/admin/works/w1/external-ids', {
      source: 'openlibrary',
      externalKey: 'OL1',
    });
  });

  it('rethrows ApiError', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(403, 'Forbidden'));
    await expect(fetchAdminWorks()).rejects.toBeInstanceOf(ApiError);
  });

  it('maps status labels to Russian', () => {
    expect(statusLabel('DRAFT')).toBe('Черновик');
    expect(statusLabel('PUBLISHED')).toBe('Опубликовано');
  });
});
