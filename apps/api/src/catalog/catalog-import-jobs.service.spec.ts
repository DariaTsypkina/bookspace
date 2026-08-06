import { NotFoundException } from '@nestjs/common';
import { CatalogImportJobsService } from './catalog-import-jobs.service';
import { CatalogImportService } from './catalog-import.service';

describe('CatalogImportJobsService', () => {
  const queue = {
    add: jest.fn(),
    getJob: jest.fn(),
  };
  const importService = {
    runBatch: jest.fn(),
  };
  const audit = {
    log: jest.fn(),
  };

  let service: CatalogImportJobsService;
  const prevJobsSync = process.env.JOBS_SYNC;

  beforeEach(() => {
    jest.clearAllMocks();
    CatalogImportJobsService.clearSyncResults();
    process.env.JOBS_SYNC = 'true';
    service = new CatalogImportJobsService(
      queue as never,
      importService as unknown as CatalogImportService,
      audit as never,
    );
  });

  afterAll(() => {
    if (prevJobsSync === undefined) {
      delete process.env.JOBS_SYNC;
    } else {
      process.env.JOBS_SYNC = prevJobsSync;
    }
    CatalogImportJobsService.clearSyncResults();
  });

  it('runs sync and returns completed with report on get', async () => {
    importService.runBatch.mockResolvedValue({
      created: 1,
      updated: 0,
      queued: 0,
      drafts: 1,
      failed: 0,
    });

    const started = await service.startJob(
      {
        source: 'isbn_list',
        isbns: ['9780306406157'],
        idempotencyKey: 'sync-job-1',
      },
      'admin-1',
    );

    expect(started).toEqual({ jobId: 'sync-job-1', status: 'completed' });
    expect(queue.add).not.toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalled();

    const view = await service.getJob('sync-job-1');
    expect(view).toEqual({
      jobId: 'sync-job-1',
      status: 'completed',
      report: {
        created: 1,
        updated: 0,
        queued: 0,
        drafts: 1,
        failed: 0,
      },
    });
  });

  it('is idempotent for the same idempotencyKey in sync mode', async () => {
    importService.runBatch.mockResolvedValue({
      created: 1,
      updated: 0,
      queued: 0,
      drafts: 1,
      failed: 0,
    });

    await service.startJob(
      {
        source: 'isbn_list',
        isbns: ['9780306406157'],
        idempotencyKey: 'idem-1',
      },
      'admin-1',
    );
    await service.startJob(
      {
        source: 'isbn_list',
        isbns: ['9780306406157'],
        idempotencyKey: 'idem-1',
      },
      'admin-1',
    );

    expect(importService.runBatch).toHaveBeenCalledTimes(1);
  });

  it('throws NotFound for unknown sync job', async () => {
    await expect(service.getJob('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
