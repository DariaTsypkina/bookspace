import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  ContextReadingStatus,
  MatchQueueKind,
  MatchQueueStatus,
  NeedsContext,
  PrismaClient,
  WorkStatus,
} from '@prisma/client';
import { AppModule } from '../src/app.module';
import { MAX_SOURCE_SNIPPET_LENGTH } from '../src/context/context.constants';
import { FakeLlmProvider } from '../src/llm/fake-llm.provider';
import { LLM_PROVIDER } from '../src/llm/llm.provider';

const prisma = new PrismaClient();
const TEST_PREFIX = 'context-extract-e2e';

async function cleanup() {
  const works = await prisma.work.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const workIds = works.map((w) => w.id);

  if (workIds.length > 0) {
    await prisma.contextReading.deleteMany({
      where: { subjectWorkId: { in: workIds } },
    });
    await prisma.matchQueue.deleteMany({
      where: {
        kind: MatchQueueKind.CONTEXT_CANDIDATE,
      },
    });
  }

  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Context extract pipeline (e2e)', () => {
  let app: INestApplication<App>;
  let fakeLlm: FakeLlmProvider;
  let adminCookie: string[];

  beforeAll(async () => {
    process.env.JOBS_SYNC = 'true';

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
        email: 'e2e-context-extract-admin@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-context-extract-admin@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-context-extract-admin@bookspace.local',
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
      where: { email: 'e2e-context-extract-admin@bookspace.local' },
    });
    await app.close();
    await prisma.$disconnect();
  });

  async function createSubjectWork() {
    return prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-subject`,
        titleRu: 'Преступление и наказание',
        titleOrig: 'Crime and Punishment',
        yearFirst: 1866,
        status: WorkStatus.PUBLISHED,
        needsContext: NeedsContext.YES,
        needsContextAdminSetAt: new Date(),
      },
    });
  }

  async function createRecommendedWork() {
    return prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-recommended`,
        titleRu: 'Записки из подполья',
        titleOrig: 'Notes from Underground',
        yearFirst: 1864,
        status: WorkStatus.PUBLISHED,
      },
    });
  }

  it('POST extract autopublishes matched ContextReading', async () => {
    const subject = await createSubjectWork();
    const recommended = await createRecommendedWork();

    fakeLlm.setExtractHandler(() => ({
      disclaimer_ok: true,
      candidates: [
        {
          title: 'Notes from Underground',
          author: 'Ф. М. Достоевский',
          year: 1864,
          importance_rank: 1,
          why_text_ru: 'Предшествующий психологический этюд.',
          evidence_quote: 'подпольный человек',
        },
      ],
    }));

    const response = await request(app.getHttpServer())
      .post(`/admin/works/${subject.id}/context/extract`)
      .set('Cookie', adminCookie)
      .send({})
      .expect(201);

    expect(response.body).toMatchObject({
      published: 1,
      queued: 0,
      skipped: false,
    });

    const reading = await prisma.contextReading.findFirst({
      where: {
        subjectWorkId: subject.id,
        recommendedWorkId: recommended.id,
      },
    });
    expect(reading?.status).toBe(ContextReadingStatus.PUBLISHED);
    expect(reading?.whyText).toBe('Предшествующий психологический этюд.');
    expect(reading?.sourceSnippet).toBeTruthy();
    if (reading?.sourceSnippet) {
      expect(reading.sourceSnippet.length).toBeLessThanOrEqual(
        MAX_SOURCE_SNIPPET_LENGTH,
      );
    }
  });

  it('POST extract queues unmatched candidates', async () => {
    const subject = await createSubjectWork();
    await createRecommendedWork();

    fakeLlm.setExtractHandler(() => ({
      disclaimer_ok: true,
      candidates: [
        {
          title: 'Totally Unknown Book',
          author: 'Nobody',
          year: null,
          importance_rank: 2,
          why_text_ru: 'Не найдено в каталоге.',
          evidence_quote: null,
        },
      ],
    }));

    const response = await request(app.getHttpServer())
      .post(`/admin/works/${subject.id}/context/extract`)
      .set('Cookie', adminCookie)
      .send({})
      .expect(201);

    expect(response.body).toMatchObject({
      published: 0,
      queued: 1,
      skipped: false,
    });

    const queueItem = await prisma.matchQueue.findFirst({
      where: {
        kind: MatchQueueKind.CONTEXT_CANDIDATE,
        status: MatchQueueStatus.OPEN,
      },
    });
    expect(queueItem).toBeTruthy();
    const payload = queueItem?.payload as {
      subjectWorkId: string;
      title: string;
    };
    expect(payload.subjectWorkId).toBe(subject.id);
    expect(payload.title).toBe('Totally Unknown Book');
  });

  it('POST extract skips when needsContext is not YES', async () => {
    const subject = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-no-context`,
        titleRu: 'Обычная книга',
        status: WorkStatus.PUBLISHED,
        needsContext: NeedsContext.NO,
        needsContextAdminSetAt: new Date(),
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/admin/works/${subject.id}/context/extract`)
      .set('Cookie', adminCookie)
      .send({})
      .expect(201);

    expect(response.body).toMatchObject({
      published: 0,
      queued: 0,
      skipped: true,
      reason: 'not_eligible',
    });
  });
});
