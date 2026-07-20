import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { ContextReadingStatus, PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { AUDIT_ACTION } from '../src/audit/audit.constants';

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
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
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
    expect(beforePublic.body.items).toHaveLength(1);

    await request(app.getHttpServer())
      .post(`/admin/context/${reading.id}/unpublish`)
      .set('Cookie', adminCookie)
      .expect(201);

    const afterPublic = await request(app.getHttpServer())
      .get(`/catalog/works/${subject.slug}/context-readings`)
      .expect(200);
    expect(afterPublic.body.items).toHaveLength(0);

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

    expect(response.body.status).toBe(ContextReadingStatus.REJECTED);

    const audit = await prisma.auditLog.findFirst({
      where: {
        entityId: reading.id,
        action: AUDIT_ACTION.CONTEXT_REJECT,
      },
    });
    expect(audit).not.toBeNull();
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
