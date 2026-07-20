import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { NeedsContext, PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { isExtractEligible } from '../src/context/context-eligibility';
import { FakeLlmProvider } from '../src/llm/fake-llm.provider';
import { LLM_PROVIDER } from '../src/llm/llm.provider';

const prisma = new PrismaClient();
const TEST_PREFIX = 'context-needs-classify-e2e';

async function cleanupWorks() {
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

async function cleanupUsers() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'e2e-context-admin@bookspace.local',
          'e2e-context-user@bookspace.local',
        ],
      },
    },
  });
}

describe('Context needs classify (e2e)', () => {
  let app: INestApplication<App>;
  let fakeLlm: FakeLlmProvider;
  let adminCookie: string[];

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

    fakeLlm = app.get<FakeLlmProvider>(LLM_PROVIDER);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-context-admin@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-context-admin@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-context-admin@bookspace.local',
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
    await cleanupWorks();
    fakeLlm.setHandler(() => ({
      needs_context: true,
      confidence: 0.95,
      reason: 'philosophical classic',
    }));
  });

  afterAll(async () => {
    await cleanupWorks();
    await cleanupUsers();
    await app.close();
    await prisma.$disconnect();
  });

  async function createWork() {
    return prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work`,
        titleRu: 'Идиот',
        titleOrig: 'The Idiot',
        yearFirst: 1869,
        status: WorkStatus.PUBLISHED,
      },
    });
  }

  it('PATCH /admin/works/:id/needs-context sets admin YES', async () => {
    const work = await createWork();

    const response = await request(app.getHttpServer())
      .patch(`/admin/works/${work.id}/needs-context`)
      .set('Cookie', adminCookie)
      .send({ needsContext: 'YES' })
      .expect(200);

    expect(response.body).toEqual({ needsContext: 'YES' });

    const stored = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(stored.needsContext).toBe(NeedsContext.YES);
    expect(stored.needsContextAdminSetAt).not.toBeNull();
  });

  it('admin NO is preserved after classify job', async () => {
    const work = await createWork();

    await request(app.getHttpServer())
      .patch(`/admin/works/${work.id}/needs-context`)
      .set('Cookie', adminCookie)
      .send({ needsContext: 'NO' })
      .expect(200);

    const classify = await request(app.getHttpServer())
      .post(`/admin/works/${work.id}/context/classify`)
      .set('Cookie', adminCookie)
      .expect(201);

    expect(classify.body).toMatchObject({
      needsContext: 'NO',
      skipped: true,
    });

    const stored = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(stored.needsContext).toBe(NeedsContext.NO);
  });

  it('POST classify sets UNKNOWN on low confidence', async () => {
    fakeLlm.setHandler(() => ({
      needs_context: true,
      confidence: 0.4,
      reason: 'uncertain',
    }));
    const work = await createWork();

    const response = await request(app.getHttpServer())
      .post(`/admin/works/${work.id}/context/classify`)
      .set('Cookie', adminCookie)
      .expect(201);

    expect(response.body).toMatchObject({
      needsContext: 'UNKNOWN',
      skipped: false,
    });
  });

  it('POST classify sets YES enabling extract eligibility', async () => {
    const work = await createWork();

    const response = await request(app.getHttpServer())
      .post(`/admin/works/${work.id}/context/classify`)
      .set('Cookie', adminCookie)
      .expect(201);

    const body = response.body as { needsContext: NeedsContext };
    expect(body.needsContext).toBe('YES');
    expect(isExtractEligible(body.needsContext)).toBe(true);
  });

  it('rejects non-admin with 403', async () => {
    const work = await createWork();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-context-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-context-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/admin/works/${work.id}/needs-context`)
      .set('Cookie', userLogin.headers['set-cookie'] ?? [])
      .send({ needsContext: 'NO' })
      .expect(403);

    await prisma.user.delete({
      where: { email: 'e2e-context-user@bookspace.local' },
    });
  });
});
