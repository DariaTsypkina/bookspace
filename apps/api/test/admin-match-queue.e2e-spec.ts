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
import type { AdminMatchQueueItem } from '@bookspace/schemas';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'mq-e2e';

const createdQueueIds: string[] = [];
const createdWorkIds: string[] = [];

async function cleanup() {
  if (createdWorkIds.length > 0) {
    await prisma.contextReading.deleteMany({
      where: {
        OR: [
          { subjectWorkId: { in: createdWorkIds } },
          { recommendedWorkId: { in: createdWorkIds } },
        ],
      },
    });
    await prisma.edition.deleteMany({
      where: { workId: { in: createdWorkIds } },
    });
    await prisma.work.deleteMany({ where: { id: { in: createdWorkIds } } });
    createdWorkIds.length = 0;
  }
  if (createdQueueIds.length > 0) {
    await prisma.matchQueue.deleteMany({
      where: { id: { in: createdQueueIds } },
    });
    createdQueueIds.length = 0;
  }
}

describe('Admin match queue (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string[];

  beforeAll(async () => {
    process.env.E2E_THROTTLE_BYPASS = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await prisma.user.deleteMany({
      where: { email: 'e2e-admin-mq@bookspace.local' },
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-mq@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-admin-mq@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-mq@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const adminRaw = adminLogin.headers['set-cookie'];
    adminCookie = Array.isArray(adminRaw)
      ? adminRaw
      : adminRaw
        ? [adminRaw]
        : [];
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.user.deleteMany({
      where: { email: 'e2e-admin-mq@bookspace.local' },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('lists OPEN items and resolves IMPORT_ROW to existing work', async () => {
    const target = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-target`,
        titleRu: `${TEST_PREFIX} Книга`,
        status: WorkStatus.PUBLISHED,
      },
    });
    createdWorkIds.push(target.id);

    const item = await prisma.matchQueue.create({
      data: {
        kind: MatchQueueKind.IMPORT_ROW,
        status: MatchQueueStatus.OPEN,
        payload: {
          titleRu: `${TEST_PREFIX} Книга`,
          isbn13: '9781234567890',
        },
      },
    });
    createdQueueIds.push(item.id);

    const listRes = await request(app.getHttpServer())
      .get('/admin/match-queue')
      .set('Cookie', adminCookie)
      .expect(200);

    const listBody = listRes.body as AdminMatchQueueItem[];
    expect(Array.isArray(listBody)).toBe(true);
    const found = listBody.find((row) => row.id === item.id);
    expect(found).toBeDefined();
    expect(found?.suggestions.length).toBeGreaterThan(0);

    const resolveRes = await request(app.getHttpServer())
      .post(`/admin/match-queue/${item.id}/resolve`)
      .set('Cookie', adminCookie)
      .send({ workId: target.id })
      .expect(201);

    const resolveBody = resolveRes.body as AdminMatchQueueItem & {
      followUp?: { importRowApplied?: boolean };
    };
    expect(resolveBody.status).toBe(MatchQueueStatus.RESOLVED);
    expect(resolveBody.resolvedWorkId).toBe(target.id);
    expect(resolveBody.followUp?.importRowApplied).toBe(true);

    const edition = await prisma.edition.findUnique({
      where: { isbn13: '9781234567890' },
    });
    expect(edition?.workId).toBe(target.id);
  });

  it('creates DRAFT and publishes context for CONTEXT_CANDIDATE', async () => {
    const subject = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-subject`,
        titleRu: `${TEST_PREFIX} Субъект`,
        status: WorkStatus.PUBLISHED,
      },
    });
    createdWorkIds.push(subject.id);

    const item = await prisma.matchQueue.create({
      data: {
        kind: MatchQueueKind.CONTEXT_CANDIDATE,
        status: MatchQueueStatus.OPEN,
        payload: {
          subjectWorkId: subject.id,
          title: `${TEST_PREFIX} Рекомендация`,
          importanceRank: 1,
          whyTextRu: 'Связь по мотивам',
        },
      },
    });
    createdQueueIds.push(item.id);

    const draftRes = await request(app.getHttpServer())
      .post(`/admin/match-queue/${item.id}/create-draft`)
      .set('Cookie', adminCookie)
      .send({})
      .expect(201);

    const draftBody = draftRes.body as AdminMatchQueueItem;
    expect(draftBody.status).toBe(MatchQueueStatus.RESOLVED);
    expect(draftBody.resolvedWork?.status).toBe(WorkStatus.DRAFT);
    const draftWorkId = draftBody.resolvedWorkId;
    expect(draftWorkId).toBeTruthy();
    createdWorkIds.push(draftWorkId!);

    const reading = await prisma.contextReading.findFirst({
      where: {
        subjectWorkId: subject.id,
        recommendedWorkId: draftWorkId!,
        status: ContextReadingStatus.PUBLISHED,
      },
    });
    expect(reading).not.toBeNull();
  });

  it('dismisses OPEN item', async () => {
    const item = await prisma.matchQueue.create({
      data: {
        kind: MatchQueueKind.IMPORT_ROW,
        status: MatchQueueStatus.OPEN,
        payload: { titleRu: `${TEST_PREFIX} dismiss` },
      },
    });
    createdQueueIds.push(item.id);

    const res = await request(app.getHttpServer())
      .post(`/admin/match-queue/${item.id}/dismiss`)
      .set('Cookie', adminCookie)
      .send({})
      .expect(201);

    const dismissBody = res.body as AdminMatchQueueItem;
    expect(dismissBody.status).toBe(MatchQueueStatus.DISMISSED);
  });
});
