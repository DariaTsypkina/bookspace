import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NeedsContext, PrismaClient, WorkStatus } from '@prisma/client';
import { FakeLlmProvider } from '../llm/fake-llm.provider';
import { LLM_PROVIDER } from '../llm/llm.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { ContextClassifyService } from './context-classify.service';
import { isExtractEligible } from './context-eligibility';

const prisma = new PrismaClient();
const TEST_PREFIX = 'context-classify-spec';

async function cleanup() {
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

async function createWork(
  overrides: {
    needsContext?: NeedsContext;
    needsContextAdminSetAt?: Date | null;
  } = {},
) {
  return prisma.work.create({
    data: {
      slug: `${TEST_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      titleRu: 'Братья Карамазовы',
      titleOrig: 'The Brothers Karamazov',
      yearFirst: 1880,
      status: WorkStatus.PUBLISHED,
      needsContext: overrides.needsContext ?? NeedsContext.UNKNOWN,
      needsContextAdminSetAt: overrides.needsContextAdminSetAt ?? null,
    },
  });
}

describe('ContextClassifyService', () => {
  let service: ContextClassifyService;
  let fakeLlm: FakeLlmProvider;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        ContextClassifyService,
        FakeLlmProvider,
        { provide: LLM_PROVIDER, useExisting: FakeLlmProvider },
      ],
    }).compile();

    service = module.get(ContextClassifyService);
    fakeLlm = module.get<FakeLlmProvider>(LLM_PROVIDER);
  });

  beforeEach(async () => {
    await cleanup();
    fakeLlm.setHandler(() => ({
      needs_context: true,
      confidence: 0.95,
      reason: 'dense philosophical novel',
    }));
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('sets YES when LLM returns high confidence needs_context=true', async () => {
    const work = await createWork();

    const result = await service.classifyWork(work.id);

    expect(result).toMatchObject({
      needsContext: NeedsContext.YES,
      skipped: false,
    });
    const updated = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(updated.needsContext).toBe(NeedsContext.YES);
  });

  it('sets NO when LLM returns high confidence needs_context=false', async () => {
    fakeLlm.setHandler(() => ({
      needs_context: false,
      confidence: 0.9,
      reason: 'light reading',
    }));
    const work = await createWork();

    const result = await service.classifyWork(work.id);

    expect(result.needsContext).toBe(NeedsContext.NO);
    const updated = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(updated.needsContext).toBe(NeedsContext.NO);
  });

  it('sets UNKNOWN when confidence is below threshold', async () => {
    fakeLlm.setHandler(() => ({
      needs_context: true,
      confidence: 0.5,
      reason: 'uncertain',
    }));
    const work = await createWork();

    const result = await service.classifyWork(work.id);

    expect(result.needsContext).toBe(NeedsContext.UNKNOWN);
    const updated = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(updated.needsContext).toBe(NeedsContext.UNKNOWN);
  });

  it('does not overwrite admin NO after classify job', async () => {
    fakeLlm.setHandler(() => ({
      needs_context: true,
      confidence: 0.99,
      reason: 'model wants YES',
    }));
    const work = await createWork({
      needsContext: NeedsContext.NO,
      needsContextAdminSetAt: new Date(),
    });

    const result = await service.classifyWork(work.id);

    expect(result).toMatchObject({
      needsContext: NeedsContext.NO,
      skipped: true,
    });
    const updated = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(updated.needsContext).toBe(NeedsContext.NO);
  });

  it('does not overwrite admin YES after classify job', async () => {
    fakeLlm.setHandler(() => ({
      needs_context: false,
      confidence: 0.99,
      reason: 'model wants NO',
    }));
    const work = await createWork({
      needsContext: NeedsContext.YES,
      needsContextAdminSetAt: new Date(),
    });

    const result = await service.classifyWork(work.id);

    expect(result).toMatchObject({
      needsContext: NeedsContext.YES,
      skipped: true,
    });
  });

  it('throws NotFoundException for missing work', async () => {
    await expect(
      service.classifyWork('00000000-0000-0000-0000-000000000000'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('isExtractEligible', () => {
  it('returns true only for YES', () => {
    expect(isExtractEligible(NeedsContext.YES)).toBe(true);
    expect(isExtractEligible(NeedsContext.NO)).toBe(false);
    expect(isExtractEligible(NeedsContext.UNKNOWN)).toBe(false);
  });
});

describe('ContextClassifyService admin patch', () => {
  let service: ContextClassifyService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        ContextClassifyService,
        FakeLlmProvider,
        { provide: LLM_PROVIDER, useExisting: FakeLlmProvider },
      ],
    }).compile();
    service = module.get(ContextClassifyService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('sets admin lock on YES/NO patch', async () => {
    const work = await createWork();

    await service.setAdminNeedsContext(work.id, NeedsContext.NO);

    const updated = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(updated.needsContext).toBe(NeedsContext.NO);
    expect(updated.needsContextAdminSetAt).not.toBeNull();
  });

  it('clears admin lock on UNKNOWN patch', async () => {
    const work = await createWork({
      needsContext: NeedsContext.NO,
      needsContextAdminSetAt: new Date(),
    });

    await service.setAdminNeedsContext(work.id, NeedsContext.UNKNOWN);

    const updated = await prisma.work.findUniqueOrThrow({
      where: { id: work.id },
    });
    expect(updated.needsContext).toBe(NeedsContext.UNKNOWN);
    expect(updated.needsContextAdminSetAt).toBeNull();
  });
});
