import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  fetchRecentContextReadings,
  formatPublishedAt,
  patchContextReading,
  rejectContextReading,
  unpublishContextReading,
} from './admin-context';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
    },
  };
});

describe('fetchRecentContextReadings', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads recent items from admin BFF via api', async () => {
    const mockItems = {
      items: [
        {
          id: 'cr-1',
          subjectWork: { id: 'w1', slug: 's', titleRu: 'S' },
          recommendedWork: { id: 'w2', slug: 'r', titleRu: 'R' },
          importanceRank: 1,
          whyText: 'Текст',
          status: 'PUBLISHED' as const,
          sourceUrl: null,
          sourceSnippet: null,
          llmModel: null,
          llmRunId: null,
          publishedAt: '2026-07-20T10:00:00.000Z',
          createdAt: '2026-07-20T10:00:00.000Z',
          updatedAt: '2026-07-20T10:00:00.000Z',
        },
      ],
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockItems });

    const result = await fetchRecentContextReadings(7);

    expect(result.items).toHaveLength(1);
    expect(api.get).toHaveBeenCalledWith(
      '/api/admin/context/recent?days=7',
      noStoreConfig,
    );
  });

  it('rethrows ApiError from api on failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(403, 'Forbidden'));

    await expect(fetchRecentContextReadings(7)).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ApiError &&
        err.status === 403 &&
        err.message === 'Forbidden',
    );
  });
});

describe('patchContextReading', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends PATCH via api to admin BFF', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { id: 'cr-1', whyText: 'Новый' },
    });

    await patchContextReading('cr-1', { whyText: 'Новый' });

    expect(api.patch).toHaveBeenCalledWith('/api/admin/context/cr-1', {
      whyText: 'Новый',
    });
  });

  it('rethrows ApiError from api on failure', async () => {
    vi.mocked(api.patch).mockRejectedValue(
      new ApiError(400, 'whyText обязателен'),
    );

    await expect(
      patchContextReading('cr-1', { whyText: '' }),
    ).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ApiError &&
        err.status === 400 &&
        err.message === 'whyText обязателен',
    );
  });
});

describe('unpublishContextReading', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends POST unpublish via api to admin BFF', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'cr-1', status: 'DRAFT' },
    });

    await unpublishContextReading('cr-1');

    expect(api.post).toHaveBeenCalledWith('/api/admin/context/cr-1/unpublish');
  });
});

describe('rejectContextReading', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends POST reject via api to admin BFF', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'cr-1', status: 'REJECTED' },
    });

    await rejectContextReading('cr-1');

    expect(api.post).toHaveBeenCalledWith('/api/admin/context/cr-1/reject');
  });
});

describe('formatPublishedAt', () => {
  it('formats ISO date in ru locale', () => {
    expect(formatPublishedAt('2026-07-20T12:00:00.000Z')).toMatch(/2026/);
  });

  it('returns dash for null', () => {
    expect(formatPublishedAt(null)).toBe('—');
  });
});
