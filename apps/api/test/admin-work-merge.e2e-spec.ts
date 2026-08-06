import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  ExternalIdEntityType,
  PrismaClient,
  UserBookStatus,
  WorkStatus,
} from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { AUDIT_ACTION } from '../src/audit/audit.constants';

const prisma = new PrismaClient();
const TEST_PREFIX = 'admin-work-merge-e2e';

async function cleanup() {
  const works = await prisma.work.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const workIds = works.map((w) => w.id);
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'e2e-admin-merge@bookspace.local',
          'e2e-admin-merge-user@bookspace.local',
          'e2e-admin-merge-reader@bookspace.local',
        ],
      },
    },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);

  if (userIds.length > 0) {
    await prisma.userBook.deleteMany({ where: { userId: { in: userIds } } });
  }

  if (workIds.length > 0) {
    await prisma.externalId.deleteMany({
      where: {
        entityType: ExternalIdEntityType.WORK,
        entityId: { in: workIds },
      },
    });
    await prisma.auditLog.deleteMany({
      where: { entityType: 'Work', entityId: { in: workIds } },
    });
    await prisma.userBook.deleteMany({ where: { workId: { in: workIds } } });
  }

  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Admin work merge (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string[];
  let userCookie: string[];
  let readerId: string;

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
        email: 'e2e-admin-merge@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-admin-merge@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-merge@bookspace.local',
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
        email: 'e2e-admin-merge-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-merge-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const userRaw = userLogin.headers['set-cookie'];
    userCookie = Array.isArray(userRaw) ? userRaw : userRaw ? [userRaw] : [];

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-merge-reader@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const reader = await prisma.user.findUniqueOrThrow({
      where: { email: 'e2e-admin-merge-reader@bookspace.local' },
    });
    readerId = reader.id;
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
            'e2e-admin-merge@bookspace.local',
            'e2e-admin-merge-user@bookspace.local',
            'e2e-admin-merge-reader@bookspace.local',
          ],
        },
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /admin/works/merge merges UserBook + ExternalId and writes audit (admin 200)', async () => {
    const canonical = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-canon`,
        titleRu: 'Канон Merge',
        status: WorkStatus.PUBLISHED,
      },
    });
    const duplicate = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-dup`,
        titleRu: 'Дубль Merge',
        status: WorkStatus.DRAFT,
      },
    });

    await prisma.userBook.create({
      data: {
        userId: readerId,
        workId: duplicate.id,
        status: UserBookStatus.READ,
      },
    });

    await prisma.externalId.create({
      data: {
        entityType: ExternalIdEntityType.WORK,
        entityId: duplicate.id,
        source: 'openlibrary',
        externalKey: `${TEST_PREFIX}-ol`,
      },
    });

    const res = await request(app.getHttpServer())
      .post('/admin/works/merge')
      .set('X-E2E', '1')
      .set('Cookie', adminCookie)
      .send({
        canonicalId: canonical.id,
        duplicateIds: [duplicate.id],
      })
      .expect(201);

    expect(res.body).toEqual({
      canonicalId: canonical.id,
      mergedIds: [duplicate.id],
    });

    const merged = await prisma.work.findUniqueOrThrow({
      where: { id: duplicate.id },
    });
    expect(merged.status).toBe(WorkStatus.MERGED);
    expect(merged.mergedIntoId).toBe(canonical.id);

    const books = await prisma.userBook.findMany({
      where: { userId: readerId },
    });
    expect(books).toHaveLength(1);
    expect(books[0].workId).toBe(canonical.id);

    const ext = await prisma.externalId.findMany({
      where: {
        entityType: ExternalIdEntityType.WORK,
        entityId: canonical.id,
      },
    });
    expect(ext).toHaveLength(1);
    expect(ext[0].externalKey).toBe(`${TEST_PREFIX}-ol`);

    const audit = await prisma.auditLog.findFirst({
      where: {
        action: AUDIT_ACTION.WORK_MERGE,
        entityId: canonical.id,
      },
    });
    expect(audit).toBeTruthy();
  });

  it('POST /admin/works/merge returns 403 for non-admin', async () => {
    const canonical = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-canon-403`,
        titleRu: 'Канон 403',
        status: WorkStatus.PUBLISHED,
      },
    });
    const duplicate = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-dup-403`,
        titleRu: 'Дубль 403',
        status: WorkStatus.DRAFT,
      },
    });

    await request(app.getHttpServer())
      .post('/admin/works/merge')
      .set('X-E2E', '1')
      .set('Cookie', userCookie)
      .send({
        canonicalId: canonical.id,
        duplicateIds: [duplicate.id],
      })
      .expect(403);
  });
});
