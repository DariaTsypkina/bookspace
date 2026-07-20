import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CatalogPlaceResponse } from './catalog-place.types';

@Injectable()
export class CatalogPlaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string): Promise<CatalogPlaceResponse> {
    const place = await this.prisma.place.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        world: {
          select: {
            slug: true,
            nameRu: true,
            nameOrig: true,
            status: true,
            deletedAt: true,
          },
        },
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

    if (!place) {
      throw new NotFoundException();
    }

    const world =
      place.world &&
      place.world.deletedAt === null &&
      place.world.status === 'PUBLISHED'
        ? {
            slug: place.world.slug,
            nameRu: place.world.nameRu,
            nameOrig: place.world.nameOrig ?? undefined,
          }
        : undefined;

    const works = place.works
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
      slug: place.slug,
      nameRu: place.nameRu,
      nameOrig: place.nameOrig ?? undefined,
      world,
      works,
    };
  }
}
