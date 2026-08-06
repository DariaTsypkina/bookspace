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
  AdminCreateCharacterInput,
  AdminCreateEditionInput,
  AdminCreateExternalIdInput,
  AdminCreatePlaceInput,
  AdminCreateSeriesInput,
  AdminCreateWorldInput,
  AdminCreateWorkInput,
  AdminLinkWorkAuthorInput,
  AdminListCatalogEntitiesQuery,
  AdminListWorksQuery,
  AdminUpdateCharacterInput,
  AdminUpdatePlaceInput,
  AdminUpdateSeriesInput,
  AdminUpdateWorldInput,
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

type NamedEntityKind = 'series' | 'character' | 'world' | 'place';

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

  async listSeries(query: AdminListCatalogEntitiesQuery) {
    return this.listNamedEntities('series', query);
  }

  async getSeries(seriesId: string) {
    return this.requireActiveNamedEntity(
      'series',
      seriesId,
      'Серия не найдена',
    );
  }

  async createSeries(input: AdminCreateSeriesInput) {
    const baseSlug = input.slug ?? this.slugify(input.nameRu, 'series');
    const slug = await this.ensureUniqueNamedSlug('series', baseSlug);
    return this.prisma.series.create({
      data: {
        slug,
        nameRu: input.nameRu,
        nameOrig: input.nameOrig,
        status: CatalogEntityStatus.DRAFT,
      },
    });
  }

  async updateSeries(seriesId: string, input: AdminUpdateSeriesInput) {
    await this.requireActiveNamedEntity('series', seriesId, 'Серия не найдена');
    const data: Prisma.SeriesUpdateInput = {};
    if (input.nameRu !== undefined) data.nameRu = input.nameRu;
    if (input.nameOrig !== undefined) data.nameOrig = input.nameOrig;
    return this.prisma.series.update({ where: { id: seriesId }, data });
  }

  async publishSeries(seriesId: string, actorUserId: string) {
    return this.publishNamedEntity({
      kind: 'series',
      id: seriesId,
      notFound: 'Серия не найдена',
      publishAction: AUDIT_ACTION.SERIES_PUBLISH,
      entityType: AUDIT_ENTITY.SERIES,
      actorUserId,
    });
  }

  async softDeleteSeries(seriesId: string, actorUserId: string) {
    return this.softDeleteNamedEntity({
      kind: 'series',
      id: seriesId,
      notFound: 'Серия не найдена',
      deleteAction: AUDIT_ACTION.SERIES_SOFT_DELETE,
      entityType: AUDIT_ENTITY.SERIES,
      actorUserId,
    });
  }

  async listCharacters(query: AdminListCatalogEntitiesQuery) {
    return this.listNamedEntities('character', query);
  }

  async getCharacter(characterId: string) {
    return this.requireActiveNamedEntity(
      'character',
      characterId,
      'Персонаж не найден',
    );
  }

  async createCharacter(input: AdminCreateCharacterInput) {
    const baseSlug = input.slug ?? this.slugify(input.nameRu, 'character');
    const slug = await this.ensureUniqueNamedSlug('character', baseSlug);
    return this.prisma.character.create({
      data: {
        slug,
        nameRu: input.nameRu,
        nameOrig: input.nameOrig,
        status: CatalogEntityStatus.DRAFT,
      },
    });
  }

  async updateCharacter(characterId: string, input: AdminUpdateCharacterInput) {
    await this.requireActiveNamedEntity(
      'character',
      characterId,
      'Персонаж не найден',
    );
    const data: Prisma.CharacterUpdateInput = {};
    if (input.nameRu !== undefined) data.nameRu = input.nameRu;
    if (input.nameOrig !== undefined) data.nameOrig = input.nameOrig;
    return this.prisma.character.update({ where: { id: characterId }, data });
  }

  async publishCharacter(characterId: string, actorUserId: string) {
    return this.publishNamedEntity({
      kind: 'character',
      id: characterId,
      notFound: 'Персонаж не найден',
      publishAction: AUDIT_ACTION.CHARACTER_PUBLISH,
      entityType: AUDIT_ENTITY.CHARACTER,
      actorUserId,
    });
  }

  async softDeleteCharacter(characterId: string, actorUserId: string) {
    return this.softDeleteNamedEntity({
      kind: 'character',
      id: characterId,
      notFound: 'Персонаж не найден',
      deleteAction: AUDIT_ACTION.CHARACTER_SOFT_DELETE,
      entityType: AUDIT_ENTITY.CHARACTER,
      actorUserId,
    });
  }

  async listWorlds(query: AdminListCatalogEntitiesQuery) {
    return this.listNamedEntities('world', query);
  }

  async getWorld(worldId: string) {
    return this.requireActiveNamedEntity('world', worldId, 'Мир не найден');
  }

  async createWorld(input: AdminCreateWorldInput) {
    const baseSlug = input.slug ?? this.slugify(input.nameRu, 'world');
    const slug = await this.ensureUniqueNamedSlug('world', baseSlug);
    return this.prisma.world.create({
      data: {
        slug,
        nameRu: input.nameRu,
        nameOrig: input.nameOrig,
        descriptionRu: input.descriptionRu,
        status: CatalogEntityStatus.DRAFT,
      },
    });
  }

  async updateWorld(worldId: string, input: AdminUpdateWorldInput) {
    await this.requireActiveNamedEntity('world', worldId, 'Мир не найден');
    const data: Prisma.WorldUpdateInput = {};
    if (input.nameRu !== undefined) data.nameRu = input.nameRu;
    if (input.nameOrig !== undefined) data.nameOrig = input.nameOrig;
    if (input.descriptionRu !== undefined) {
      data.descriptionRu = input.descriptionRu;
    }
    return this.prisma.world.update({ where: { id: worldId }, data });
  }

  async publishWorld(worldId: string, actorUserId: string) {
    return this.publishNamedEntity({
      kind: 'world',
      id: worldId,
      notFound: 'Мир не найден',
      publishAction: AUDIT_ACTION.WORLD_PUBLISH,
      entityType: AUDIT_ENTITY.WORLD,
      actorUserId,
    });
  }

  async softDeleteWorld(worldId: string, actorUserId: string) {
    return this.softDeleteNamedEntity({
      kind: 'world',
      id: worldId,
      notFound: 'Мир не найден',
      deleteAction: AUDIT_ACTION.WORLD_SOFT_DELETE,
      entityType: AUDIT_ENTITY.WORLD,
      actorUserId,
    });
  }

  async listPlaces(query: AdminListCatalogEntitiesQuery) {
    const where: Prisma.PlaceWhereInput = {};
    if (!query.includeDeleted) {
      where.deletedAt = null;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { nameRu: { contains: query.q, mode: 'insensitive' } },
        { nameOrig: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.place.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        slug: true,
        nameRu: true,
        nameOrig: true,
        worldId: true,
        status: true,
        deletedAt: true,
        updatedAt: true,
        createdAt: true,
        world: { select: { id: true, slug: true, nameRu: true } },
      },
    });
  }

  async getPlace(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: {
        world: { select: { id: true, slug: true, nameRu: true, status: true } },
      },
    });
    if (!place || place.deletedAt) {
      throw new NotFoundException('Локация не найдена');
    }
    return place;
  }

  async createPlace(input: AdminCreatePlaceInput) {
    if (input.worldId) {
      await this.requireActiveNamedEntity(
        'world',
        input.worldId,
        'Мир не найден',
      );
    }
    const baseSlug = input.slug ?? this.slugify(input.nameRu, 'place');
    const slug = await this.ensureUniqueNamedSlug('place', baseSlug);
    return this.prisma.place.create({
      data: {
        slug,
        nameRu: input.nameRu,
        nameOrig: input.nameOrig,
        worldId: input.worldId,
        status: CatalogEntityStatus.DRAFT,
      },
    });
  }

  async updatePlace(placeId: string, input: AdminUpdatePlaceInput) {
    await this.requireActiveNamedEntity('place', placeId, 'Локация не найдена');
    if (input.worldId) {
      await this.requireActiveNamedEntity(
        'world',
        input.worldId,
        'Мир не найден',
      );
    }
    const data: Prisma.PlaceUpdateInput = {};
    if (input.nameRu !== undefined) data.nameRu = input.nameRu;
    if (input.nameOrig !== undefined) data.nameOrig = input.nameOrig;
    if (input.worldId !== undefined) {
      data.world =
        input.worldId === null
          ? { disconnect: true }
          : { connect: { id: input.worldId } };
    }
    return this.prisma.place.update({ where: { id: placeId }, data });
  }

  async publishPlace(placeId: string, actorUserId: string) {
    return this.publishNamedEntity({
      kind: 'place',
      id: placeId,
      notFound: 'Локация не найдена',
      publishAction: AUDIT_ACTION.PLACE_PUBLISH,
      entityType: AUDIT_ENTITY.PLACE,
      actorUserId,
    });
  }

  async softDeletePlace(placeId: string, actorUserId: string) {
    return this.softDeleteNamedEntity({
      kind: 'place',
      id: placeId,
      notFound: 'Локация не найдена',
      deleteAction: AUDIT_ACTION.PLACE_SOFT_DELETE,
      entityType: AUDIT_ENTITY.PLACE,
      actorUserId,
    });
  }

  // Prisma model delegates are incompatible as a union; cast for shared helpers.
  private namedDelegate(kind: NamedEntityKind): {
    findMany: (args: never) => Promise<Array<Record<string, unknown>>>;
    findUnique: (args: {
      where: { id: string };
      include?: unknown;
    }) => Promise<{
      id: string;
      slug: string;
      nameRu: string;
      nameOrig: string | null;
      status: CatalogEntityStatus;
      deletedAt: Date | null;
    } | null>;
    findFirst: (args: {
      where: { slug: string };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
    create: (args: never) => Promise<Record<string, unknown>>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<{
      id: string;
      slug: string;
      nameRu: string;
      nameOrig: string | null;
      status: CatalogEntityStatus;
      deletedAt: Date | null;
    }>;
  } {
    switch (kind) {
      case 'series':
        return this.prisma.series as never;
      case 'character':
        return this.prisma.character as never;
      case 'world':
        return this.prisma.world as never;
      case 'place':
        return this.prisma.place as never;
    }
  }

  private async listNamedEntities(
    kind: NamedEntityKind,
    query: AdminListCatalogEntitiesQuery,
  ) {
    const where: Record<string, unknown> = {};
    if (!query.includeDeleted) {
      where.deletedAt = null;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { nameRu: { contains: query.q, mode: 'insensitive' } },
        { nameOrig: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return this.namedDelegate(kind).findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        slug: true,
        nameRu: true,
        nameOrig: true,
        status: true,
        deletedAt: true,
        updatedAt: true,
        createdAt: true,
        ...(kind === 'world' ? { descriptionRu: true } : {}),
        ...(kind === 'place' ? { worldId: true } : {}),
      },
    } as never);
  }

  private async requireActiveNamedEntity(
    kind: NamedEntityKind,
    id: string,
    notFound: string,
  ) {
    const row = await this.namedDelegate(kind).findUnique({ where: { id } });
    if (!row || row.deletedAt) {
      throw new NotFoundException(notFound);
    }
    return row;
  }

  private async publishNamedEntity(args: {
    kind: NamedEntityKind;
    id: string;
    notFound: string;
    publishAction: (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
    entityType: string;
    actorUserId: string;
  }) {
    const row = await this.requireActiveNamedEntity(
      args.kind,
      args.id,
      args.notFound,
    );
    if (row.status !== CatalogEntityStatus.DRAFT) {
      throw new BadRequestException(
        'Опубликовать можно только сущность в статусе DRAFT',
      );
    }

    const updated = await this.namedDelegate(args.kind).update({
      where: { id: args.id },
      data: { status: CatalogEntityStatus.PUBLISHED },
    });

    await this.audit.log({
      actorUserId: args.actorUserId,
      action: args.publishAction,
      entityType: args.entityType,
      entityId: args.id,
      before: { status: row.status, nameRu: row.nameRu },
      after: { status: updated.status, nameRu: updated.nameRu },
    });

    return updated;
  }

  private async softDeleteNamedEntity(args: {
    kind: NamedEntityKind;
    id: string;
    notFound: string;
    deleteAction: (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
    entityType: string;
    actorUserId: string;
  }) {
    const row = await this.requireActiveNamedEntity(
      args.kind,
      args.id,
      args.notFound,
    );

    const updated = await this.namedDelegate(args.kind).update({
      where: { id: args.id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: args.actorUserId,
      action: args.deleteAction,
      entityType: args.entityType,
      entityId: args.id,
      before: {
        deletedAt: null,
        status: row.status,
        nameRu: row.nameRu,
      },
      after: {
        deletedAt: updated.deletedAt?.toISOString() ?? null,
        status: updated.status,
        nameRu: updated.nameRu,
      },
    });

    return updated;
  }

  private async ensureUniqueNamedSlug(
    kind: NamedEntityKind,
    base: string,
  ): Promise<string> {
    let candidate = base;
    let n = 2;
    while (
      await this.namedDelegate(kind).findFirst({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    return candidate;
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

  slugify(text: string, fallback = 'work'): string {
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
    return normalized.length > 0 ? normalized : fallback;
  }
}
