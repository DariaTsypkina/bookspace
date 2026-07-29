import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ContextReadingStatus, PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { AUDIT_ACTION } from '../src/audit/audit.constants';
import { configureApp } from '../src/bootstrap';
import type {
  AdminContextReadingItem,
  PublicContextReadingItem,
} from '../src/context/admin-context.types';

type ValidationErrorResponse = {
  statusCode: number;
  error: string;
  code: 'VALIDATION_FAILED';
  errors: Array<{ code: string; path: string; message: string }>;
};

const prisma = new PrismaClient();
const TEST_PREFIX = 'admin-context-e2e';

async function cleanup() {
  const works = await prisma.work.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const workIds = works.map((w) => w.id);

  if (workIds.length > 0) {
    await prisma.auditLog.deleteMany({
      where: {
        entityId: {
          in: (
            await prisma.contextReading.findMany({
              where: { subjectWorkId: { in: workIds } },
              select: { id: true },
            })
          ).map((r) => r.id),
        },
      },
    });
    await prisma.contextReading.deleteMany({
      where: { subjectWorkId: { in: workIds } },
    });
  }

  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Admin context (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string[];
  let adminUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-admin-context@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const adminUser = await prisma.user.update({
      where: { email: 'e2e-admin-context@bookspace.local' },
      data: { role: 'ADMIN' },
    });
    adminUserId = adminUser.id;

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-admin-context@bookspace.local',
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
      where: { email: 'e2e-admin-context@bookspace.local' },
    });
    await app.close();
    await prisma.$disconnect();
  });

  async function seedPublishedReading() {
    const subject = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-subject`,
        titleRu: 'Субъектная книга',
        status: WorkStatus.PUBLISHED,
      },
    });
    const recommended = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-recommended`,
        titleRu: 'Рекомендованная книга',
        status: WorkStatus.PUBLISHED,
      },
    });
    const reading = await prisma.contextReading.create({
      data: {
        subjectWorkId: subject.id,
        recommendedWorkId: recommended.id,
        importanceRank: 2,
        whyText: 'Исходный текст для понимания.',
        status: ContextReadingStatus.PUBLISHED,
        sourceUrl: 'https://ru.wikipedia.org/wiki/Test',
        sourceSnippet: 'Краткий фрагмент',
        llmModel: 'fake-llm',
        publishedAt: new Date(),
      },
    });
    return { subject, recommended, reading };
  }

  it('GET /admin/context/recent lists recent auto-published readings', async () => {
    const { reading } = await seedPublishedReading();

    const response = await request(app.getHttpServer())
      .get('/admin/context/recent')
      .set('Cookie', adminCookie)
      .expect(200);

    const body = response.body as {
      items: Array<{ id: string; sourceUrl: string | null }>;
    };
    expect(body.items.some((item) => item.id === reading.id)).toBe(true);
    expect(
      body.items.find((item) => item.id === reading.id)?.sourceUrl,
    ).toContain('wikipedia.org');
  });

  it('PATCH /admin/context/:id updates why/rank and writes audit', async () => {
    const { reading } = await seedPublishedReading();

    const response = await request(app.getHttpServer())
      .patch(`/admin/context/${reading.id}`)
      .set('Cookie', adminCookie)
      .send({ whyText: 'Обновлённый текст', importanceRank: 1 })
      .expect(200);

    expect(response.body).toMatchObject({
      id: reading.id,
      whyText: 'Обновлённый текст',
      importanceRank: 1,
    });

    const audit = await prisma.auditLog.findFirst({
      where: {
        entityId: reading.id,
        action: AUDIT_ACTION.CONTEXT_UPDATE,
        actorUserId: adminUserId,
      },
    });
    expect(audit).not.toBeNull();
  });

  it('POST unpublish removes public block and writes audit', async () => {
    const { subject, reading } = await seedPublishedReading();

    const beforePublic = await request(app.getHttpServer())
      .get(`/catalog/works/${subject.slug}/context-readings`)
      .expect(200);
    const beforeBody = beforePublic.body as {
      items: PublicContextReadingItem[];
    };
    expect(beforeBody.items).toHaveLength(1);

    await request(app.getHttpServer())
      .post(`/admin/context/${reading.id}/unpublish`)
      .set('Cookie', adminCookie)
      .expect(201);

    const afterPublic = await request(app.getHttpServer())
      .get(`/catalog/works/${subject.slug}/context-readings`)
      .expect(200);
    const afterBody = afterPublic.body as {
      items: PublicContextReadingItem[];
    };
    expect(afterBody.items).toHaveLength(0);

    const audit = await prisma.auditLog.findFirst({
      where: {
        entityId: reading.id,
        action: AUDIT_ACTION.CONTEXT_UNPUBLISH,
      },
    });
    expect(audit).not.toBeNull();
  });

  it('POST reject marks reading rejected with audit', async () => {
    const { reading } = await seedPublishedReading();

    const response = await request(app.getHttpServer())
      .post(`/admin/context/${reading.id}/reject`)
      .set('Cookie', adminCookie)
      .expect(201);

    const body = response.body as AdminContextReadingItem;
    expect(body.status).toBe(ContextReadingStatus.REJECTED);

    const audit = await prisma.auditLog.findFirst({
      where: {
        entityId: reading.id,
        action: AUDIT_ACTION.CONTEXT_REJECT,
      },
    });
    expect(audit).not.toBeNull();
  });

  it('PATCH /admin/context/:id rejects invalid importanceRank with VALIDATION_FAILED', async () => {
    const { reading } = await seedPublishedReading();

    const response = await request(app.getHttpServer())
      .patch(`/admin/context/${reading.id}`)
      .set('Cookie', adminCookie)
      .send({ importanceRank: 100 })
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');
    const rankIssue = body.errors.find(
      (issue) => issue.path === 'importanceRank',
    );
    expect(rankIssue).toBeDefined();
    expect(rankIssue?.code.length).toBeGreaterThan(0);
    expect(rankIssue?.message.length).toBeGreaterThan(0);
  });

  it('GET /admin/context/recent rejects days outside 1..90 with VALIDATION_FAILED', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/context/recent')
      .query({ days: 0 })
      .set('Cookie', adminCookie)
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.errors.some((issue) => issue.path === 'days')).toBe(true);
  });

  it('POST extract rejects non-boolean force with VALIDATION_FAILED', async () => {
    const { subject } = await seedPublishedReading();

    const response = await request(app.getHttpServer())
      .post(`/admin/works/${subject.id}/context/extract`)
      .set('Cookie', adminCookie)
      .send({ force: 'yes' })
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.errors.some((issue) => issue.path === 'force')).toBe(true);
  });

  it('non-admin cannot access admin context routes', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-admin-context-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-admin-context-user@bookspace.local',
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
      .get('/admin/context/recent')
      .set('Cookie', userCookie)
      .expect(403);

    await prisma.user.deleteMany({
      where: { email: 'e2e-admin-context-user@bookspace.local' },
    });
  });
});
