import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, noStoreConfig } from './http';
import {
  fetchAdminImportJob,
  matchQueueHref,
  startAdminImportJob,
} from './admin-import';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('admin-import client', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts import job via BFF', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { jobId: 'j1', status: 'completed' },
    });
    await startAdminImportJob({
      source: 'isbn_list',
      isbns: ['9780306406157'],
    });
    expect(api.post).toHaveBeenCalledWith('/api/admin/import/jobs', {
      source: 'isbn_list',
      isbns: ['9780306406157'],
    });
  });

  it('fetches job status via BFF', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        jobId: 'j1',
        status: 'completed',
        report: { created: 1, updated: 0, queued: 0, drafts: 1, failed: 0 },
      },
    });
    await fetchAdminImportJob('j1');
    expect(api.get).toHaveBeenCalledWith(
      '/api/admin/import/jobs/j1',
      noStoreConfig,
    );
  });

  it('builds MatchQueue hrefs', () => {
    expect(matchQueueHref()).toBe('/admin/match-queue');
    expect(matchQueueHref('mq-1')).toBe('/admin/match-queue?id=mq-1');
  });
});
