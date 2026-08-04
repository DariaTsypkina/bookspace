import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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

    return {
      slug: work.slug,
      titleRu: work.titleRu,
      titleOrig: work.titleOrig ?? undefined,
      yearFirst: work.yearFirst ?? undefined,
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
    };
  }
}
