import { describe, expect, it, vi } from 'vitest';
import {
  fetchRecentContextReadings,
  formatPublishedAt,
  patchContextReading,
  unpublishContextReading,
} from './admin-context';

describe('fetchRecentContextReadings', () => {
  it('loads recent items from admin BFF', async () => {
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

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockItems,
      }),
    );

    const result = await fetchRecentContextReadings(7);

    expect(result.items).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/context/recent?days=7',
      expect.objectContaining({ credentials: 'include' }),
    );
  });
});

describe('patchContextReading', () => {
  it('sends PATCH to admin BFF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'cr-1', whyText: 'Новый' }),
      }),
    );

    await patchContextReading('cr-1', { whyText: 'Новый' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/context/cr-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ whyText: 'Новый' }),
      }),
    );
  });
});

describe('unpublishContextReading', () => {
  it('sends POST unpublish to admin BFF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 'cr-1', status: 'DRAFT' }),
      }),
    );

    await unpublishContextReading('cr-1');

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/context/cr-1/unpublish',
      expect.objectContaining({ method: 'POST' }),
    );
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
