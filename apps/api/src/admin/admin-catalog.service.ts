import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CatalogEntityStatus,
  ExternalIdEntityType,
  NeedsContext,
  Prisma,
  WorkStatus,
} from '@prisma/client';
import type {
  AdminCreateAuthorInput,
  AdminCreateEditionInput,
  AdminCreateExternalIdInput,
  AdminCreateWorkInput,
  AdminLinkWorkAuthorInput,
  AdminListWorksQuery,
  AdminUpdateWorkInput,
} from '@bookspace/schemas';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

@Injectable()
export class AdminCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listWorks(query: AdminListWorksQuery) {
    const where: Prisma.WorkWhereInput = {};
    if (!query.includeDeleted) {
      where.deletedAt = null;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { titleRu: { contains: query.q, mode: 'insensitive' } },
        { titleOrig: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.work.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        slug: true,
        titleRu: true,
        titleOrig: true,
        yearFirst: true,
        status: true,
        needsContext: true,
        deletedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });
  }

  async getWork(workId: string) {
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      include: {
        authors: {
          include: {
            author: {
              select: {
                id: true,
                slug: true,
                nameRu: true,
                status: true,
                deletedAt: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        editions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!work || work.deletedAt) {
      throw new NotFoundException('Произведение не найдено');
    }

    const externalIds = await this.prisma.externalId.findMany({
      where: {
        entityType: ExternalIdEntityType.WORK,
        entityId: workId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return { ...work, externalIds };
  }

  async createWork(input: AdminCreateWorkInput) {
    const baseSlug = input.slug ?? this.slugify(input.titleRu);
    const slug = await this.ensureUniqueWorkSlug(baseSlug);

    return this.prisma.work.create({
      data: {
        slug,
        titleRu: input.titleRu,
        titleOrig: input.titleOrig,
        yearFirst: input.yearFirst,
        descriptionRu: input.descriptionRu,
        status: WorkStatus.DRAFT,
        needsContext: input.needsContext ?? NeedsContext.UNKNOWN,
      },
    });
  }

  async updateWork(workId: string, input: AdminUpdateWorkInput) {
    await this.requireActiveWork(workId);

    const data: Prisma.WorkUpdateInput = {};
    if (input.titleRu !== undefined) data.titleRu = input.titleRu;
    if (input.titleOrig !== undefined) data.titleOrig = input.titleOrig;
    if (input.yearFirst !== undefined) data.yearFirst = input.yearFirst;
    if (input.descriptionRu !== undefined) {
      data.descriptionRu = input.descriptionRu;
    }
    if (input.needsContext !== undefined) {
      data.needsContext = input.needsContext;
      data.needsContextAdminSetAt = new Date();
    }

    return this.prisma.work.update({
      where: { id: workId },
      data,
    });
  }

  async publishWork(workId: string, actorUserId: string) {
    const work = await this.requireActiveWork(workId);
    if (work.status !== WorkStatus.DRAFT) {
      throw new BadRequestException(
        'Опубликовать можно только произведение в статусе DRAFT',
      );
    }

    const updated = await this.prisma.work.update({
      where: { id: workId },
      data: { status: WorkStatus.PUBLISHED },
    });

    await this.audit.log({
      actorUserId,
      action: AUDIT_ACTION.WORK_PUBLISH,
      entityType: AUDIT_ENTITY.WORK,
      entityId: workId,
      before: {
        status: work.status,
        titleRu: work.titleRu,
      },
      after: {
        status: updated.status,
        titleRu: updated.titleRu,
      },
    });

    return updated;
  }

  async softDeleteWork(workId: string, actorUserId: string) {
    const work = await this.requireActiveWork(workId);

    const updated = await this.prisma.work.update({
      where: { id: workId },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId,
      action: AUDIT_ACTION.WORK_SOFT_DELETE,
      entityType: AUDIT_ENTITY.WORK,
      entityId: workId,
      before: {
        deletedAt: null,
        status: work.status,
        titleRu: work.titleRu,
      },
      after: {
        deletedAt: updated.deletedAt?.toISOString() ?? null,
        status: updated.status,
        titleRu: updated.titleRu,
      },
    });

    return updated;
  }

  async addWorkExternalId(workId: string, input: AdminCreateExternalIdInput) {
    await this.requireActiveWork(workId);

    const existing = await this.prisma.externalId.findUnique({
      where: {
        source_externalKey: {
          source: input.source,
          externalKey: input.externalKey,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Внешний идентификатор с таким source и ключом уже существует',
      );
    }

    return this.prisma.externalId.create({
      data: {
        entityType: ExternalIdEntityType.WORK,
        entityId: workId,
        source: input.source,
        externalKey: input.externalKey,
      },
    });
  }

  async deleteWorkExternalId(workId: string, externalId: string) {
    const row = await this.prisma.externalId.findFirst({
      where: {
        id: externalId,
        entityType: ExternalIdEntityType.WORK,
        entityId: workId,
      },
    });
    if (!row) {
      throw new NotFoundException('Внешний идентификатор не найден');
    }

    await this.prisma.externalId.delete({ where: { id: externalId } });
    return { ok: true as const };
  }

  async listAuthors(q?: string) {
    return this.prisma.author.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { nameRu: { contains: q, mode: 'insensitive' as const } },
                { nameOrig: { contains: q, mode: 'insensitive' as const } },
                { slug: { contains: q, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        slug: true,
        nameRu: true,
        nameOrig: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async createAuthor(input: AdminCreateAuthorInput) {
    const baseSlug = input.slug ?? this.slugify(input.nameRu);
    const slug = await this.ensureUniqueAuthorSlug(baseSlug);

    return this.prisma.author.create({
      data: {
        slug,
        nameRu: input.nameRu,
        nameOrig: input.nameOrig,
        status: CatalogEntityStatus.DRAFT,
      },
    });
  }

  async linkWorkAuthor(workId: string, input: AdminLinkWorkAuthorInput) {
    await this.requireActiveWork(workId);

    const author = await this.prisma.author.findUnique({
      where: { id: input.authorId },
    });
    if (!author || author.deletedAt) {
      throw new NotFoundException('Автор не найден');
    }

    const existing = await this.prisma.workAuthor.findUnique({
      where: {
        workId_authorId: { workId, authorId: input.authorId },
      },
    });
    if (existing) {
      throw new ConflictException('Автор уже привязан к произведению');
    }

    return this.prisma.workAuthor.create({
      data: {
        workId,
        authorId: input.authorId,
        role: input.role,
        position: input.position ?? 0,
      },
    });
  }

  async listEditions(workId: string) {
    await this.requireActiveWork(workId);
    return this.prisma.edition.findMany({
      where: { workId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createEdition(workId: string, input: AdminCreateEditionInput) {
    await this.requireActiveWork(workId);

    return this.prisma.edition.create({
      data: {
        workId,
        language: input.language,
        title: input.title,
        translator: input.translator,
        publisher: input.publisher,
        year: input.year,
        isbn13: input.isbn13,
        isbn10: input.isbn10,
      },
    });
  }

  private async requireActiveWork(workId: string) {
    const work = await this.prisma.work.findUnique({ where: { id: workId } });
    if (!work || work.deletedAt) {
      throw new NotFoundException('Произведение не найдено');
    }
    return work;
  }

  private async ensureUniqueWorkSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 2;
    while (
      await this.prisma.work.findFirst({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    return candidate;
  }

  private async ensureUniqueAuthorSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 2;
    while (
      await this.prisma.author.findFirst({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    return candidate;
  }

  slugify(text: string): string {
    const lowered = text.trim().toLowerCase();
    let out = '';
    for (const char of lowered) {
      if (CYRILLIC_TO_LATIN[char] !== undefined) {
        out += CYRILLIC_TO_LATIN[char];
        continue;
      }
      if (/[a-z0-9]/.test(char)) {
        out += char;
        continue;
      }
      out += '-';
    }
    const normalized = out
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);
    return normalized.length > 0 ? normalized : 'work';
  }
}
