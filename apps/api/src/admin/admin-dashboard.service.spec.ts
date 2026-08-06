import { ContextReadingStatus, MatchQueueStatus, Prisma } from '@prisma/client';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  const prisma = {
    matchQueue: { count: jest.fn() },
    contextReading: { count: jest.fn() },
  };
  const contextQueue = {
    getFailedCount: jest.fn(),
  };

  let service: AdminDashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminDashboardService(prisma as never, contextQueue as never);
  });

  it('aggregates open match queue, recent context and failed jobs', async () => {
    prisma.matchQueue.count.mockResolvedValue(5);
    prisma.contextReading.count.mockResolvedValue(3);
    contextQueue.getFailedCount.mockResolvedValue(2);

    const summary = await service.getSummary();

    expect(prisma.matchQueue.count).toHaveBeenCalledWith({
      where: { status: MatchQueueStatus.OPEN },
    });
    expect(prisma.contextReading.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ContextReadingStatus.PUBLISHED,
          publishedAt: expect.objectContaining({
            gte: expect.any(Date) as Date,
          }) as Prisma.DateTimeFilter,
        }) as Prisma.ContextReadingWhereInput,
      }) as Prisma.ContextReadingCountArgs,
    );
    expect(summary).toEqual({
      matchQueueOpen: 5,
      recentContext: 3,
      failedJobs: 2,
      recentContextDays: 7,
    });
  });

  it('defaults the recent context window to 7 days', async () => {
    prisma.matchQueue.count.mockResolvedValue(0);
    prisma.contextReading.count.mockResolvedValue(0);
    contextQueue.getFailedCount.mockResolvedValue(0);

    const before = Date.now();
    await service.getSummary();
    const after = Date.now();

    const calls = prisma.contextReading.count.mock.calls as Array<
      [{ where: { publishedAt: { gte: Date } } }]
    >;
    const call = calls[0][0];
    const gte = call.where.publishedAt.gte.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(gte).toBeGreaterThanOrEqual(before - sevenDaysMs - 1000);
    expect(gte).toBeLessThanOrEqual(after - sevenDaysMs + 1000);
  });

  it('honours a custom days window', async () => {
    prisma.matchQueue.count.mockResolvedValue(0);
    prisma.contextReading.count.mockResolvedValue(0);
    contextQueue.getFailedCount.mockResolvedValue(0);

    const summary = await service.getSummary({ days: 30 });

    expect(summary.recentContextDays).toBe(30);
  });

  it('treats an unavailable queue (no Redis) as zero failed jobs', async () => {
    prisma.matchQueue.count.mockResolvedValue(1);
    prisma.contextReading.count.mockResolvedValue(1);
    contextQueue.getFailedCount.mockRejectedValue(new Error('ECONNREFUSED'));

    const summary = await service.getSummary();

    expect(summary.failedJobs).toBe(0);
    expect(summary.matchQueueOpen).toBe(1);
  });
});
