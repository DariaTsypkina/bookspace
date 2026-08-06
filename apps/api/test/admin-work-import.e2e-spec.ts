import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { CatalogImportJobsService } from '../src/catalog/catalog-import-jobs.service';

const prisma = new PrismaClient();
const TEST_PREFIX = 'admin-import-e2e';

async function cleanup() {
  const works = await prisma.work.findMany({
    where: {
      OR: [
        { slug: { startsWith: TEST_PREFIX } },
        { titleRu: { startsWith: 'ISBN 978' } },
        { titleRu: { contains: TEST_PREFIX } },
      ],
    },
    select: { id: true },
  });
  const workIds = works.map((w) => w.id);

  if (workIds.length > 0) {
    await prisma.externalId.deleteMany({
      where: { entityType: 'WORK', entityId: { in: workIds } },
    });
    await prisma.edition.deleteMany({ where: { workId: { in: workIds } } });
    await prisma.auditLog.deleteMany({
      where: { entityType: 'Work', entityId: { in: workIds } },
    });
  }

  await prisma.matchQueue.deleteMany({
    where: {
      kind: 'IMPORT_ROW',
      payload: { path: ['titleRu'], string_contains: TEST_PREFIX },
    },
  });

  await prisma.work.deleteMany({
    where: { id: { in: workIds } },
  });

  await prisma.auditLog.deleteMany({
    where: { action: 'CATALOG_IMPORT_START' },
  });
}

describe('Admin catalog import (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string[];
  let userCookie: string[];

  beforeAll(async () => {
    process.env.JOBS_SYNC = 'true';
    process.env.E2E_THROTTLE_BYPASS = 'true';
    CatalogImportJobsService.clearSyncResults();

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
        email: 'e2e-admin-import@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-admin-import@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-import@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const adminRaw = adminLogin.headers['set-cookie'];
    adminCookie = Array.isArray(adminRaw)
      ? adminRaw
      : adminRaw
        ? [adminRaw]
        : [];

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-import-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-import-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const userRaw = userLogin.headers['set-cookie'];
    userCookie = Array.isArray(userRaw) ? userRaw : userRaw ? [userRaw] : [];
  });

  beforeEach(async () => {
    CatalogImportJobsService.clearSyncResults();
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'e2e-admin-import@bookspace.local',
            'e2e-admin-import-user@bookspace.local',
          ],
        },
      },
    });
    CatalogImportJobsService.clearSyncResults();
    await app.close();
    await prisma.$disconnect();
  });

  it('admin starts isbn_list job and reads report', async () => {
    const isbn = '9780306406157';
    const start = await request(app.getHttpServer())
      .post('/admin/import/jobs')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({
        source: 'isbn_list',
        isbns: [isbn],
        idempotencyKey: `${TEST_PREFIX}-isbn-1`,
      })
      .expect(201);

    const startBody = start.body as { jobId: string; status: string };
    expect(startBody.jobId).toBe(`${TEST_PREFIX}-isbn-1`);
    expect(startBody.status).toBe('completed');

    const status = await request(app.getHttpServer())
      .get(`/admin/import/jobs/${TEST_PREFIX}-isbn-1`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .expect(200);

    const statusBody = status.body as {
      status: string;
      report: {
        created: number;
        updated: number;
        queued: number;
        drafts: number;
        failed: number;
      };
    };
    expect(statusBody.status).toBe('completed');
    expect(statusBody.report).toMatchObject({
      created: 1,
      updated: 0,
      queued: 0,
      drafts: 1,
      failed: 0,
    });

    const work = await prisma.work.findFirst({
      where: { titleRu: `ISBN ${isbn}` },
    });
    expect(work).toBeTruthy();
    expect(work!.status).toBe('DRAFT');
  });

  it('admin queues MatchQueue for row without ids', async () => {
    const start = await request(app.getHttpServer())
      .post('/admin/import/jobs')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({
        source: 'json_upload',
        rows: [{ titleRu: `${TEST_PREFIX} unmatched` }],
        idempotencyKey: `${TEST_PREFIX}-queue-1`,
      })
      .expect(201);

    const startBody = start.body as { jobId: string; status: string };
    expect(startBody.status).toBe('completed');

    const status = await request(app.getHttpServer())
      .get(`/admin/import/jobs/${startBody.jobId}`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .expect(200);

    const statusBody = status.body as {
      report: { queued: number; matchQueueIds: string[] };
    };
    expect(statusBody.report.queued).toBe(1);
    expect(statusBody.report.matchQueueIds).toHaveLength(1);
  });

  it('non-admin receives 403', async () => {
    await request(app.getHttpServer())
      .post('/admin/import/jobs')
      .set('Cookie', userCookie)
      .set('X-E2E', '1')
      .send({
        source: 'isbn_list',
        isbns: ['9780306406157'],
      })
      .expect(403);

    await request(app.getHttpServer())
      .get('/admin/import/jobs/any')
      .set('Cookie', userCookie)
      .set('X-E2E', '1')
      .expect(403);
  });
});
