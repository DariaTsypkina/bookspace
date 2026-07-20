import { Injectable } from '@nestjs/common';
import { ContextReadingStatus, WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicContextReadingItem } from '../context/admin-context.types';

@Injectable()
export class CatalogContextReadingService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedForWorkSlug(
    slug: string,
  ): Promise<{ items: PublicContextReadingItem[] }> {
    const work = await this.prisma.work.findFirst({
      where: {
        slug,
        status: WorkStatus.PUBLISHED,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!work) {
      return { items: [] };
    }

    const readings = await this.prisma.contextReading.findMany({
      where: {
        subjectWorkId: work.id,
        status: ContextReadingStatus.PUBLISHED,
      },
      include: {
        recommendedWork: {
          select: { slug: true, titleRu: true, status: true, deletedAt: true },
        },
      },
      orderBy: { importanceRank: 'asc' },
    });

    const items = readings
      .filter(
        (reading) =>
          reading.recommendedWork.deletedAt === null &&
          reading.recommendedWork.status === WorkStatus.PUBLISHED,
      )
      .map((reading) => ({
        recommendedWork: {
          slug: reading.recommendedWork.slug,
          titleRu: reading.recommendedWork.titleRu,
        },
        importanceRank: reading.importanceRank,
        whyText: reading.whyText,
      }));

    return { items };
  }
}
