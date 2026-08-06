import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'admin-catalog-e2e';

async function cleanup() {
  const works = await prisma.work.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const workIds = works.map((w) => w.id);

  if (workIds.length > 0) {
    await prisma.externalId.deleteMany({
      where: {
        entityType: 'WORK',
        entityId: { in: workIds },
      },
    });
    await prisma.edition.deleteMany({ where: { workId: { in: workIds } } });
    await prisma.workAuthor.deleteMany({ where: { workId: { in: workIds } } });
    await prisma.auditLog.deleteMany({
      where: { entityType: 'Work', entityId: { in: workIds } },
    });
  }

  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.author.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Admin catalog CRUD (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string[];
  let userCookie: string[];

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
        email: 'e2e-admin-catalog@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-admin-catalog@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-catalog@bookspace.local',
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
        email: 'e2e-admin-catalog-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-catalog-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const userRaw = userLogin.headers['set-cookie'];
    userCookie = Array.isArray(userRaw) ? userRaw : userRaw ? [userRaw] : [];
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
            'e2e-admin-catalog@bookspace.local',
            'e2e-admin-catalog-user@bookspace.local',
          ],
        },
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('admin creates DRAFT, publishes, attaches ExternalId; soft-delete hides from public', async () => {
    const create = await request(app.getHttpServer())
      .post('/admin/works')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({
        titleRu: 'Тестовая книга каталога',
        slug: `${TEST_PREFIX}-book`,
        yearFirst: 2020,
      })
      .expect(201);

    const created = create.body as {
      id: string;
      status: WorkStatus;
      slug: string;
    };
    expect(created.status).toBe(WorkStatus.DRAFT);
    expect(created.slug).toBe(`${TEST_PREFIX}-book`);
    const workId = created.id;

    await request(app.getHttpServer())
      .patch(`/admin/works/${workId}`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ descriptionRu: 'Краткое описание', needsContext: 'YES' })
      .expect(200);

    const ext = await request(app.getHttpServer())
      .post(`/admin/works/${workId}/external-ids`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ source: 'openlibrary', externalKey: `${TEST_PREFIX}-OL1` })
      .expect(201);

    const extBody = ext.body as { externalKey: string };
    expect(extBody.externalKey).toBe(`${TEST_PREFIX}-OL1`);

    const published = await request(app.getHttpServer())
      .post(`/admin/works/${workId}/publish`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .expect(201);

    const publishedBody = published.body as { status: WorkStatus };
    expect(publishedBody.status).toBe(WorkStatus.PUBLISHED);

    const publicOk = await request(app.getHttpServer())
      .get(`/catalog/works/${TEST_PREFIX}-book`)
      .set('X-E2E', '1')
      .expect(200);
    const publicBody = publicOk.body as { titleRu: string };
    expect(publicBody.titleRu).toBe('Тестовая книга каталога');

    await request(app.getHttpServer())
      .delete(`/admin/works/${workId}`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .expect(200);

    await request(app.getHttpServer())
      .get(`/catalog/works/${TEST_PREFIX}-book`)
      .set('X-E2E', '1')
      .expect(404);
  });

  it('non-admin gets 403 on admin catalog endpoints', async () => {
    await request(app.getHttpServer())
      .get('/admin/works')
      .set('Cookie', userCookie)
      .set('X-E2E', '1')
      .expect(403);

    await request(app.getHttpServer())
      .post('/admin/works')
      .set('Cookie', userCookie)
      .set('X-E2E', '1')
      .send({ titleRu: 'Запрещено' })
      .expect(403);
  });

  it('admin can create author and link to work; create edition', async () => {
    const work = await request(app.getHttpServer())
      .post('/admin/works')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({
        titleRu: 'Книга с автором',
        slug: `${TEST_PREFIX}-with-author`,
      })
      .expect(201);

    const author = await request(app.getHttpServer())
      .post('/admin/authors')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({
        nameRu: 'Тестовый Автор',
        slug: `${TEST_PREFIX}-author`,
      })
      .expect(201);

    const workBody = work.body as { id: string };
    const authorBody = author.body as { id: string };

    await request(app.getHttpServer())
      .post(`/admin/works/${workBody.id}/authors`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ authorId: authorBody.id, role: 'author' })
      .expect(201);

    const edition = await request(app.getHttpServer())
      .post(`/admin/works/${workBody.id}/editions`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ language: 'ru', title: 'Издание RU' })
      .expect(201);

    const editionBody = edition.body as { language: string };
    expect(editionBody.language).toBe('ru');

    const detail = await request(app.getHttpServer())
      .get(`/admin/works/${workBody.id}`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .expect(200);

    const detailBody = detail.body as {
      authors: unknown[];
      editions: unknown[];
    };
    expect(detailBody.authors).toHaveLength(1);
    expect(detailBody.editions).toHaveLength(1);
  });
});
