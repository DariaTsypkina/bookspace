import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CatalogAuthorResponse } from './catalog-author.types';

@Injectable()
export class CatalogAuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string): Promise<CatalogAuthorResponse> {
    const author = await this.prisma.author.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        works: {
          orderBy: { position: 'asc' },
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

    if (!author) {
      throw new NotFoundException();
    }

    const publishedWorks = author.works
      .filter(
        (link) =>
          link.work.deletedAt === null &&
          link.work.status === WorkStatus.PUBLISHED,
      )
      .map((link) => ({
        slug: link.work.slug,
        titleRu: link.work.titleRu,
        yearFirst: link.work.yearFirst ?? undefined,
      }))
      .sort((left, right) => left.titleRu.localeCompare(right.titleRu, 'ru'));

    return {
      slug: author.slug,
      nameRu: author.nameRu,
      nameOrig: author.nameOrig ?? undefined,
      works: publishedWorks,
    };
  }
}
