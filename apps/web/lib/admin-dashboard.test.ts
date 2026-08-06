import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, noStoreConfig } from './http';
import {
  ADMIN_DASHBOARD_QUICK_ACTIONS,
  fetchAdminDashboardSummary,
} from './admin-dashboard';

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

describe('fetchAdminDashboardSummary', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads summary counters from admin BFF via api', async () => {
    const mockSummary = {
      matchQueueOpen: 4,
      recentContext: 2,
      failedJobs: 1,
      recentContextDays: 7,
    };
    vi.mocked(api.get).mockResolvedValue({ data: mockSummary });

    const result = await fetchAdminDashboardSummary(7);

    expect(result).toEqual(mockSummary);
    expect(api.get).toHaveBeenCalledWith(
      '/api/admin/dashboard/summary?days=7',
      noStoreConfig,
    );
  });

  it('rethrows ApiError from api on failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(403, 'Forbidden'));

    await expect(fetchAdminDashboardSummary()).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ApiError &&
        err.status === 403 &&
        err.message === 'Forbidden',
    );
  });
});

describe('ADMIN_DASHBOARD_QUICK_ACTIONS', () => {
  it('links to future admin sections without Button asChild', () => {
    expect(ADMIN_DASHBOARD_QUICK_ACTIONS.map((a) => a.href)).toEqual([
      '/admin/catalog',
      '/admin/import',
      '/admin/rankings',
      '/admin/context',
    ]);
  });
});
