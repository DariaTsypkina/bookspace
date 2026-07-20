import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CatalogWorldResponse } from './catalog-world.types';

@Injectable()
export class CatalogWorldService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string): Promise<CatalogWorldResponse> {
    const world = await this.prisma.world.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        places: {
          where: {
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
        },
      },
    });

    if (!world) {
      throw new NotFoundException();
    }

    const places = world.places
      .map((place) => ({
        slug: place.slug,
        nameRu: place.nameRu,
        nameOrig: place.nameOrig ?? undefined,
      }))
      .sort((left, right) => left.nameRu.localeCompare(right.nameRu, 'ru'));

    const worksBySlug = new Map<
      string,
      { slug: string; titleRu: string; yearFirst?: number }
    >();

    for (const place of world.places) {
      for (const link of place.works) {
        if (
          link.work.deletedAt !== null ||
          link.work.status !== WorkStatus.PUBLISHED
        ) {
          continue;
        }

        worksBySlug.set(link.work.slug, {
          slug: link.work.slug,
          titleRu: link.work.titleRu,
          yearFirst: link.work.yearFirst ?? undefined,
        });
      }
    }

    const works = [...worksBySlug.values()].sort((left, right) =>
      left.titleRu.localeCompare(right.titleRu, 'ru'),
    );

    return {
      slug: world.slug,
      nameRu: world.nameRu,
      nameOrig: world.nameOrig ?? undefined,
      descriptionRu: world.descriptionRu ?? undefined,
      places,
      works,
    };
  }
}
