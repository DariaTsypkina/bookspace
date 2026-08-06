import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  ContextReadingStatus,
  MatchQueueKind,
  MatchQueueStatus,
  PrismaClient,
  WorkStatus,
} from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'admin-dashboard-e2e';
const createdMatchQueueIds: string[] = [];

type DashboardSummary = {
  matchQueueOpen: number;
  recentContext: number;
  failedJobs: number;
  recentContextDays: number;
};

async function cleanup() {
  const works = await prisma.work.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const workIds = works.map((w) => w.id);

  if (workIds.length > 0) {
    await prisma.contextReading.deleteMany({
      where: {
        OR: [
          { subjectWorkId: { in: workIds } },
          { recommendedWorkId: { in: workIds } },
        ],
      },
    });
  }

  if (createdMatchQueueIds.length > 0) {
    await prisma.matchQueue.deleteMany({
      where: { id: { in: [...createdMatchQueueIds] } },
    });
    createdMatchQueueIds.length = 0;
  }

  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Admin dashboard (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string[];

  beforeAll(async () => {
    process.env.JOBS_SYNC = 'true';
    process.env.E2E_THROTTLE_BYPASS = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-dashboard@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-admin-dashboard@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-dashboard@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const rawCookie = login.headers['set-cookie'];
    adminCookie = Array.isArray(rawCookie)
      ? rawCookie
      : rawCookie
        ? [rawCookie]
        : [];
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'e2e-admin-dashboard@bookspace.local',
            'e2e-admin-dashboard-user@bookspace.local',
          ],
        },
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('GET /admin/dashboard/summary returns numeric counters for admin', async () => {
    const subject = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-subject`,
        titleRu: 'Дашборд субъект',
        status: WorkStatus.PUBLISHED,
      },
    });
    const recommended = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rec`,
        titleRu: 'Дашборд рекомендация',
        status: WorkStatus.PUBLISHED,
      },
    });

    await prisma.contextReading.create({
      data: {
        subjectWorkId: subject.id,
        recommendedWorkId: recommended.id,
        importanceRank: 1,
        whyText: 'Свежий контекст для дашборда.',
        status: ContextReadingStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    const openItem = await prisma.matchQueue.create({
      data: {
        kind: MatchQueueKind.IMPORT_ROW,
        status: MatchQueueStatus.OPEN,
        payload: { testPrefix: TEST_PREFIX, title: 'open item' },
      },
    });
    const resolvedItem = await prisma.matchQueue.create({
      data: {
        kind: MatchQueueKind.IMPORT_ROW,
        status: MatchQueueStatus.RESOLVED,
        payload: { testPrefix: TEST_PREFIX, title: 'resolved item' },
        resolvedWorkId: subject.id,
      },
    });
    createdMatchQueueIds.push(openItem.id, resolvedItem.id);

    const response = await request(app.getHttpServer())
      .get('/admin/dashboard/summary')
      .set('X-E2E', '1')
      .set('Cookie', adminCookie)
      .expect(200);

    const body = response.body as DashboardSummary;
    expect(typeof body.matchQueueOpen).toBe('number');
    expect(typeof body.recentContext).toBe('number');
    expect(typeof body.failedJobs).toBe('number');
    expect(body.recentContextDays).toBe(7);
    expect(body.matchQueueOpen).toBeGreaterThanOrEqual(1);
    expect(body.recentContext).toBeGreaterThanOrEqual(1);
    expect(body.failedJobs).toBeGreaterThanOrEqual(0);
  });

  it('non-admin gets 403 on dashboard summary', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-dashboard-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-dashboard-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const rawCookie = userLogin.headers['set-cookie'];
    const userCookie = Array.isArray(rawCookie)
      ? rawCookie
      : rawCookie
        ? [rawCookie]
        : [];

    await request(app.getHttpServer())
      .get('/admin/dashboard/summary')
      .set('X-E2E', '1')
      .set('Cookie', userCookie)
      .expect(403);
  });

  it('guest without session gets 401 on dashboard summary', async () => {
    await request(app.getHttpServer())
      .get('/admin/dashboard/summary')
      .set('X-E2E', '1')
      .expect(401);
  });
});
