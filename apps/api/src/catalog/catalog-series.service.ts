import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CatalogSeriesResponse } from './catalog-series.types';

@Injectable()
export class CatalogSeriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string): Promise<CatalogSeriesResponse> {
    const series = await this.prisma.series.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        works: {
          include: {
            work: {
              select: {
                slug: true,
                titleRu: true,
                yearFirst: true,
                status: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!series) {
      throw new NotFoundException();
    }

    const publishedWorks = series.works
      .filter(
        (link) =>
          link.work.deletedAt === null &&
          link.work.status === WorkStatus.PUBLISHED,
      )
      .map((link) => {
        const item: {
          slug: string;
          titleRu: string;
          yearFirst?: number;
          positionInSeries?: number;
        } = {
          slug: link.work.slug,
          titleRu: link.work.titleRu,
        };
        if (link.work.yearFirst != null) {
          item.yearFirst = link.work.yearFirst;
        }
        if (link.positionInSeries != null) {
          item.positionInSeries = link.positionInSeries;
        }
        return item;
      })
      .sort((left, right) => {
        const leftPos = left.positionInSeries;
        const rightPos = right.positionInSeries;
        if (leftPos != null && rightPos != null) {
          if (leftPos !== rightPos) {
            return leftPos - rightPos;
          }
        } else if (leftPos != null) {
          return -1;
        } else if (rightPos != null) {
          return 1;
        }
        return left.titleRu.localeCompare(right.titleRu, 'ru');
      });

    return {
      slug: series.slug,
      nameRu: series.nameRu,
      nameOrig: series.nameOrig ?? undefined,
      works: publishedWorks,
    };
  }
}
