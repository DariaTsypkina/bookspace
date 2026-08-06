import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildReadingOrderSteps } from './catalog-reading-order';
import type { CatalogWorkResponse } from './catalog-work.types';

@Injectable()
export class CatalogWorkService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string): Promise<CatalogWorkResponse> {
    const work = await this.prisma.work.findFirst({
      where: {
        slug,
        status: WorkStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        authors: {
          orderBy: { position: 'asc' },
          include: {
            author: {
              select: { slug: true, nameRu: true, deletedAt: true },
            },
          },
        },
        seriesLinks: {
          include: {
            series: {
              select: {
                id: true,
                slug: true,
                nameRu: true,
                deletedAt: true,
                status: true,
              },
            },
          },
        },
        editions: {
          orderBy: [{ language: 'asc' }, { year: 'asc' }],
        },
        relationsFrom: {
          include: {
            toWork: {
              select: {
                slug: true,
                titleRu: true,
                status: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!work) {
      throw new NotFoundException();
    }

    const publishedAuthors = work.authors
      .filter((link) => link.author.deletedAt === null)
      .map((link) => ({
        slug: link.author.slug,
        nameRu: link.author.nameRu,
      }));

    const seriesLink = work.seriesLinks.find(
      (link) =>
        link.series.deletedAt === null && link.series.status === 'PUBLISHED',
    );

    const relations = work.relationsFrom
      .filter(
        (relation) =>
          relation.toWork.deletedAt === null &&
          relation.toWork.status === WorkStatus.PUBLISHED,
      )
      .map((relation) => ({
        slug: relation.toWork.slug,
        titleRu: relation.toWork.titleRu,
        type: relation.type,
      }))
      .sort((left, right) => left.titleRu.localeCompare(right.titleRu, 'ru'));

    const readingOrder = await this.buildReadingOrder(work, seriesLink);

    const descriptionRu = work.descriptionRu?.trim() || undefined;

    return {
      slug: work.slug,
      titleRu: work.titleRu,
      titleOrig: work.titleOrig ?? undefined,
      yearFirst: work.yearFirst ?? undefined,
      descriptionRu,
      authors: publishedAuthors,
      series: seriesLink
        ? {
            slug: seriesLink.series.slug,
            nameRu: seriesLink.series.nameRu,
            positionInSeries: seriesLink.positionInSeries ?? undefined,
          }
        : undefined,
      editions: work.editions.map((edition) => ({
        language: edition.language,
        translator: edition.translator ?? undefined,
        isbn13: edition.isbn13 ?? undefined,
        publisher: edition.publisher ?? undefined,
        year: edition.year ?? undefined,
      })),
      relations,
      readingOrder,
    };
  }

  private async buildReadingOrder(
    work: {
      id: string;
      slug: string;
      titleRu: string;
      relationsFrom: Array<{
        readingOrder: number | null;
        toWork: {
          slug: string;
          titleRu: string;
          status: WorkStatus;
          deletedAt: Date | null;
        };
      }>;
    },
    seriesLink:
      | {
          positionInSeries: number | null;
          series: { id: string };
        }
      | undefined,
  ) {
    if (seriesLink) {
      const seriesWorks = await this.prisma.workSeries.findMany({
        where: {
          seriesId: seriesLink.series.id,
          positionInSeries: { not: null },
          work: {
            status: WorkStatus.PUBLISHED,
            deletedAt: null,
          },
        },
        include: {
          work: {
            select: { slug: true, titleRu: true },
          },
        },
      });

      return buildReadingOrderSteps(
        seriesWorks.map((link) => ({
          slug: link.work.slug,
          titleRu: link.work.titleRu,
          order: link.positionInSeries as number,
        })),
      );
    }

    const orderedRelations = work.relationsFrom.filter(
      (relation) =>
        relation.readingOrder != null &&
        relation.toWork.deletedAt === null &&
        relation.toWork.status === WorkStatus.PUBLISHED,
    );

    if (orderedRelations.length === 0) {
      return [];
    }

    const minRelatedOrder = Math.min(
      ...orderedRelations.map((relation) => relation.readingOrder as number),
    );

    return buildReadingOrderSteps([
      {
        slug: work.slug,
        titleRu: work.titleRu,
        order: Math.min(1, minRelatedOrder - 1),
      },
      ...orderedRelations.map((relation) => ({
        slug: relation.toWork.slug,
        titleRu: relation.toWork.titleRu,
        order: relation.readingOrder as number,
      })),
    ]);
  }
}
