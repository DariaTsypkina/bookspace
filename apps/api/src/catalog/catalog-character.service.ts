import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CatalogCharacterResponse } from './catalog-character.types';

@Injectable()
export class CatalogCharacterService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string): Promise<CatalogCharacterResponse> {
    const character = await this.prisma.character.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        appearances: {
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
        relationsFrom: {
          include: {
            toCharacter: {
              select: {
                slug: true,
                nameRu: true,
                status: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!character) {
      throw new NotFoundException();
    }

    const appearances = character.appearances
      .filter(
        (appearance) =>
          appearance.work.deletedAt === null &&
          appearance.work.status === WorkStatus.PUBLISHED,
      )
      .map((appearance) => ({
        slug: appearance.work.slug,
        titleRu: appearance.work.titleRu,
        yearFirst: appearance.work.yearFirst ?? undefined,
      }))
      .sort((left, right) => left.titleRu.localeCompare(right.titleRu, 'ru'));

    const relations = character.relationsFrom
      .filter(
        (relation) =>
          relation.toCharacter.deletedAt === null &&
          relation.toCharacter.status === 'PUBLISHED',
      )
      .map((relation) => ({
        slug: relation.toCharacter.slug,
        nameRu: relation.toCharacter.nameRu,
        type: relation.type,
      }))
      .sort((left, right) => left.nameRu.localeCompare(right.nameRu, 'ru'));

    return {
      slug: character.slug,
      nameRu: character.nameRu,
      nameOrig: character.nameOrig ?? undefined,
      appearances,
      relations,
    };
  }
}
