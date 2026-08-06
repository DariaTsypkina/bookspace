import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExternalIdEntityType, Prisma, WorkStatus } from '@prisma/client';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { PrismaService } from '../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class AdminWorkMergeService {
  constructor(private readonly prisma: PrismaService) {}

  async mergeWorks(
    canonicalId: string,
    duplicateIds: string[],
    actorUserId: string,
  ) {
    const uniqueDupes = [...new Set(duplicateIds)];
    if (uniqueDupes.length === 0) {
      throw new BadRequestException(
        'Укажите хотя бы один дубликат для объединения',
      );
    }
    if (uniqueDupes.includes(canonicalId)) {
      throw new BadRequestException(
        'Каноническое произведение не может быть среди дубликатов',
      );
    }

    const allIds = [canonicalId, ...uniqueDupes];
    const works = await this.prisma.work.findMany({
      where: { id: { in: allIds } },
      select: {
        id: true,
        slug: true,
        titleRu: true,
        status: true,
        deletedAt: true,
        mergedIntoId: true,
      },
    });

    if (works.length !== allIds.length) {
      const found = new Set(works.map((w) => w.id));
      const missing = allIds.filter((id) => !found.has(id));
      throw new NotFoundException(
        `Произведения не найдены: ${missing.join(', ')}`,
      );
    }

    for (const work of works) {
      if (work.deletedAt) {
        throw new BadRequestException(
          `Произведение «${work.titleRu}» скрыто и не может участвовать в merge`,
        );
      }
      if (work.status === WorkStatus.MERGED || work.mergedIntoId) {
        throw new BadRequestException(
          `Произведение «${work.titleRu}» уже объединено и не может участвовать в merge`,
        );
      }
    }

    const before = {
      canonicalId,
      duplicates: works
        .filter((w) => w.id !== canonicalId)
        .map((w) => ({
          id: w.id,
          slug: w.slug,
          titleRu: w.titleRu,
          status: w.status,
        })),
    };

    await this.prisma.$transaction(async (tx) => {
      await this.reassignUserBooks(tx, canonicalId, uniqueDupes);
      await this.reassignContextReadings(tx, canonicalId, uniqueDupes);
      await this.reassignExternalIds(tx, canonicalId, uniqueDupes);
      await this.reassignCompositeLinks(tx, canonicalId, uniqueDupes);
      await this.reassignWorkRelations(tx, canonicalId, uniqueDupes);

      await tx.edition.updateMany({
        where: { workId: { in: uniqueDupes } },
        data: { workId: canonicalId },
      });

      await tx.matchQueue.updateMany({
        where: { resolvedWorkId: { in: uniqueDupes } },
        data: { resolvedWorkId: canonicalId },
      });

      for (const dupId of uniqueDupes) {
        await tx.work.update({
          where: { id: dupId },
          data: {
            status: WorkStatus.MERGED,
            mergedIntoId: canonicalId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: AUDIT_ACTION.WORK_MERGE,
          entityType: AUDIT_ENTITY.WORK,
          entityId: canonicalId,
          before,
          after: {
            canonicalId,
            mergedIds: uniqueDupes,
            duplicatesStatus: WorkStatus.MERGED,
          },
        },
      });
    });

    return {
      canonicalId,
      mergedIds: uniqueDupes,
    };
  }

  /**
   * Simple candidates: same ExternalId key overlap, or title/author fuzzy via title contains.
   */
  async findMergeCandidates(workId: string) {
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        titleRu: true,
        titleOrig: true,
        status: true,
        deletedAt: true,
        mergedIntoId: true,
        authors: {
          select: { authorId: true },
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
      select: { source: true, externalKey: true },
    });

    const overlapEntityIds =
      externalIds.length > 0
        ? (
            await this.prisma.externalId.findMany({
              where: {
                entityType: ExternalIdEntityType.WORK,
                entityId: { not: workId },
                OR: externalIds.map((e) => ({
                  source: e.source,
                  externalKey: e.externalKey,
                })),
              },
              select: { entityId: true },
            })
          ).map((e) => e.entityId)
        : [];

    const authorIds = work.authors.map((a) => a.authorId);
    const titleToken = work.titleRu.trim().slice(0, 40);

    const or: Prisma.WorkWhereInput[] = [];
    if (overlapEntityIds.length > 0) {
      or.push({ id: { in: [...new Set(overlapEntityIds)] } });
    }
    if (titleToken.length >= 3) {
      or.push({
        titleRu: { contains: titleToken, mode: 'insensitive' },
      });
    }
    if (authorIds.length > 0) {
      or.push({
        authors: { some: { authorId: { in: authorIds } } },
      });
    }
    if (or.length === 0) {
      return [];
    }

    const candidates = await this.prisma.work.findMany({
      where: {
        id: { not: workId },
        deletedAt: null,
        status: { not: WorkStatus.MERGED },
        mergedIntoId: null,
        OR: or,
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titleRu: true,
        titleOrig: true,
        yearFirst: true,
        status: true,
        authors: {
          select: {
            author: { select: { id: true, nameRu: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    return candidates;
  }

  private async reassignUserBooks(
    tx: Tx,
    canonicalId: string,
    duplicateIds: string[],
  ) {
    const dupBooks = await tx.userBook.findMany({
      where: { workId: { in: duplicateIds } },
    });
    if (dupBooks.length === 0) return;

    const canonBooks = await tx.userBook.findMany({
      where: {
        workId: canonicalId,
        userId: { in: [...new Set(dupBooks.map((b) => b.userId))] },
      },
    });
    const canonByUser = new Set(canonBooks.map((b) => b.userId));

    for (const book of dupBooks) {
      if (canonByUser.has(book.userId)) {
        // Keep canonical row; drop duplicate (tags cascade).
        await tx.userBook.delete({ where: { id: book.id } });
      } else {
        await tx.userBook.update({
          where: { id: book.id },
          data: { workId: canonicalId },
        });
        canonByUser.add(book.userId);
      }
    }
  }

  private async reassignContextReadings(
    tx: Tx,
    canonicalId: string,
    duplicateIds: string[],
  ) {
    const dupSet = new Set(duplicateIds);

    // subjectWorkId → canonical
    const asSubject = await tx.contextReading.findMany({
      where: { subjectWorkId: { in: duplicateIds } },
    });
    for (const row of asSubject) {
      const newSubject = canonicalId;
      const newRecommended = dupSet.has(row.recommendedWorkId)
        ? canonicalId
        : row.recommendedWorkId;

      if (newSubject === newRecommended) {
        await tx.contextReading.delete({ where: { id: row.id } });
        continue;
      }

      const conflict = await tx.contextReading.findUnique({
        where: {
          subjectWorkId_recommendedWorkId: {
            subjectWorkId: newSubject,
            recommendedWorkId: newRecommended,
          },
        },
      });
      if (conflict && conflict.id !== row.id) {
        await tx.contextReading.delete({ where: { id: row.id } });
      } else {
        await tx.contextReading.update({
          where: { id: row.id },
          data: {
            subjectWorkId: newSubject,
            recommendedWorkId: newRecommended,
          },
        });
      }
    }

    // remaining recommendedWorkId → canonical
    const asRecommended = await tx.contextReading.findMany({
      where: { recommendedWorkId: { in: duplicateIds } },
    });
    for (const row of asRecommended) {
      const newRecommended = canonicalId;
      if (row.subjectWorkId === newRecommended) {
        await tx.contextReading.delete({ where: { id: row.id } });
        continue;
      }
      const conflict = await tx.contextReading.findUnique({
        where: {
          subjectWorkId_recommendedWorkId: {
            subjectWorkId: row.subjectWorkId,
            recommendedWorkId: newRecommended,
          },
        },
      });
      if (conflict && conflict.id !== row.id) {
        await tx.contextReading.delete({ where: { id: row.id } });
      } else {
        await tx.contextReading.update({
          where: { id: row.id },
          data: { recommendedWorkId: newRecommended },
        });
      }
    }
  }

  private async reassignExternalIds(
    tx: Tx,
    canonicalId: string,
    duplicateIds: string[],
  ) {
    const dupExt = await tx.externalId.findMany({
      where: {
        entityType: ExternalIdEntityType.WORK,
        entityId: { in: duplicateIds },
      },
    });
    if (dupExt.length === 0) return;

    const canonExt = await tx.externalId.findMany({
      where: {
        entityType: ExternalIdEntityType.WORK,
        entityId: canonicalId,
      },
    });
    const canonKeys = new Set(
      canonExt.map((e) => `${e.source}::${e.externalKey}`),
    );

    for (const ext of dupExt) {
      const key = `${ext.source}::${ext.externalKey}`;
      if (canonKeys.has(key)) {
        await tx.externalId.delete({ where: { id: ext.id } });
      } else {
        await tx.externalId.update({
          where: { id: ext.id },
          data: { entityId: canonicalId },
        });
        canonKeys.add(key);
      }
    }
  }

  private async reassignCompositeLinks(
    tx: Tx,
    canonicalId: string,
    duplicateIds: string[],
  ) {
    await this.moveComposite(
      tx,
      'workAuthor',
      'workId',
      'authorId',
      canonicalId,
      duplicateIds,
    );
    await this.moveComposite(
      tx,
      'workSeries',
      'workId',
      'seriesId',
      canonicalId,
      duplicateIds,
    );
    await this.moveComposite(
      tx,
      'workPlace',
      'workId',
      'placeId',
      canonicalId,
      duplicateIds,
    );
    await this.moveComposite(
      tx,
      'characterAppearance',
      'workId',
      'characterId',
      canonicalId,
      duplicateIds,
    );
    await this.moveComposite(
      tx,
      'shelfItem',
      'workId',
      'shelfId',
      canonicalId,
      duplicateIds,
    );
  }

  private async moveComposite(
    tx: Tx,
    model:
      | 'workAuthor'
      | 'workSeries'
      | 'workPlace'
      | 'characterAppearance'
      | 'shelfItem',
    workField: 'workId',
    otherField: string,
    canonicalId: string,
    duplicateIds: string[],
  ) {
    const delegate = tx[model] as {
      findMany: (args: unknown) => Promise<Array<Record<string, unknown>>>;
      delete: (args: unknown) => Promise<unknown>;
      create: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };

    const rows = await delegate.findMany({
      where: { [workField]: { in: duplicateIds } },
    });
    if (rows.length === 0) return;

    const canonRows = await delegate.findMany({
      where: { [workField]: canonicalId },
    });
    const canonOthers = new Set(canonRows.map((r) => String(r[otherField])));

    for (const row of rows) {
      const other = String(row[otherField]);
      if (canonOthers.has(other)) {
        await delegate.delete({
          where: this.compositeWhere(model, row),
        });
        continue;
      }

      if (model === 'shelfItem') {
        await delegate.update({
          where: { id: row.id },
          data: { workId: canonicalId },
        });
      } else {
        await delegate.delete({
          where: this.compositeWhere(model, row),
        });
        await delegate.create({
          data: this.compositeCreateData(model, row, canonicalId),
        });
      }
      canonOthers.add(other);
    }
  }

  private compositeCreateData(
    model:
      | 'workAuthor'
      | 'workSeries'
      | 'workPlace'
      | 'characterAppearance'
      | 'shelfItem',
    row: Record<string, unknown>,
    canonicalId: string,
  ): Record<string, unknown> {
    switch (model) {
      case 'workAuthor':
        return {
          workId: canonicalId,
          authorId: row.authorId,
          role: row.role ?? null,
          position: row.position ?? 0,
        };
      case 'workSeries':
        return {
          workId: canonicalId,
          seriesId: row.seriesId,
          positionInSeries: row.positionInSeries ?? null,
        };
      case 'workPlace':
        return {
          workId: canonicalId,
          placeId: row.placeId,
        };
      case 'characterAppearance':
        return {
          workId: canonicalId,
          characterId: row.characterId,
        };
      default:
        return { workId: canonicalId };
    }
  }

  private compositeWhere(
    model:
      | 'workAuthor'
      | 'workSeries'
      | 'workPlace'
      | 'characterAppearance'
      | 'shelfItem',
    row: Record<string, unknown>,
  ): Record<string, unknown> {
    switch (model) {
      case 'workAuthor':
        return {
          workId_authorId: {
            workId: row.workId,
            authorId: row.authorId,
          },
        };
      case 'workSeries':
        return {
          workId_seriesId: {
            workId: row.workId,
            seriesId: row.seriesId,
          },
        };
      case 'workPlace':
        return {
          workId_placeId: {
            workId: row.workId,
            placeId: row.placeId,
          },
        };
      case 'characterAppearance':
        return {
          characterId_workId: {
            characterId: row.characterId,
            workId: row.workId,
          },
        };
      case 'shelfItem':
        return { id: row.id };
      default:
        return { id: row.id };
    }
  }

  private async reassignWorkRelations(
    tx: Tx,
    canonicalId: string,
    duplicateIds: string[],
  ) {
    const dupSet = new Set(duplicateIds);
    const relations = await tx.workRelation.findMany({
      where: {
        OR: [
          { fromWorkId: { in: duplicateIds } },
          { toWorkId: { in: duplicateIds } },
        ],
      },
    });

    for (const rel of relations) {
      const newFrom = dupSet.has(rel.fromWorkId) ? canonicalId : rel.fromWorkId;
      const newTo = dupSet.has(rel.toWorkId) ? canonicalId : rel.toWorkId;

      await tx.workRelation.delete({
        where: {
          fromWorkId_toWorkId_type: {
            fromWorkId: rel.fromWorkId,
            toWorkId: rel.toWorkId,
            type: rel.type,
          },
        },
      });

      if (newFrom === newTo) {
        continue;
      }

      const existing = await tx.workRelation.findUnique({
        where: {
          fromWorkId_toWorkId_type: {
            fromWorkId: newFrom,
            toWorkId: newTo,
            type: rel.type,
          },
        },
      });
      if (!existing) {
        await tx.workRelation.create({
          data: {
            fromWorkId: newFrom,
            toWorkId: newTo,
            type: rel.type,
            readingOrder: rel.readingOrder,
          },
        });
      }
    }
  }
}
