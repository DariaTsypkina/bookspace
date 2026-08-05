import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkStatus,
  type Shelf,
  type ShelfItem,
  type Work,
} from '@prisma/client';
import type {
  AddShelfItemInput,
  CreateShelfInput,
  PublicShelfDetail,
  PublicShelvesResponse,
  ShelfResponse,
  UpdateShelfInput,
} from '@bookspace/schemas';
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

type ShelfItemWithWork = ShelfItem & {
  work: Pick<Work, 'id' | 'slug' | 'titleRu' | 'status' | 'deletedAt'>;
};

type ShelfWithItems = Shelf & {
  items: ShelfItemWithWork[];
};

@Injectable()
export class MeShelvesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    input: CreateShelfInput,
  ): Promise<ShelfResponse> {
    const baseSlug = input.slug?.trim()
      ? this.normalizeSlug(input.slug)
      : this.slugifyTitle(input.title);
    const slug = await this.allocateUniqueSlug(userId, baseSlug);

    const row = await this.prisma.shelf.create({
      data: {
        userId,
        slug,
        title: input.title,
        description: input.description ?? null,
      },
      include: this.itemInclude(),
    });

    return this.toResponse(row, true);
  }

  async list(userId: string): Promise<ShelfResponse[]> {
    const rows = await this.prisma.shelf.findMany({
      where: { userId },
      include: this.itemInclude(),
      orderBy: [{ updatedAt: 'desc' }],
    });
    return rows.map((row) => this.toResponse(row, false));
  }

  async get(userId: string, shelfId: string): Promise<ShelfResponse> {
    const row = await this.findOwnedShelf(userId, shelfId);
    return this.toResponse(row, true);
  }

  async update(
    userId: string,
    shelfId: string,
    input: UpdateShelfInput,
  ): Promise<ShelfResponse> {
    const existing = await this.findOwnedShelf(userId, shelfId);

    let nextSlug = existing.slug;
    if (input.slug !== undefined) {
      const normalized = this.normalizeSlug(input.slug);
      if (normalized !== existing.slug) {
        nextSlug = await this.allocateUniqueSlug(userId, normalized, shelfId);
      }
    }

    const row = await this.prisma.shelf.update({
      where: { id: existing.id },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        description:
          input.description !== undefined ? input.description : undefined,
        slug: nextSlug,
      },
      include: this.itemInclude(),
    });

    return this.toResponse(row, true);
  }

  async remove(userId: string, shelfId: string): Promise<void> {
    const existing = await this.findOwnedShelf(userId, shelfId);
    await this.prisma.shelf.delete({ where: { id: existing.id } });
  }

  async addItem(
    userId: string,
    shelfId: string,
    input: AddShelfItemInput,
  ): Promise<ShelfResponse> {
    const shelf = await this.findOwnedShelf(userId, shelfId);
    const work = await this.resolvePublishedWork(input);

    const inCollection = await this.prisma.userBook.findUnique({
      where: { userId_workId: { userId, workId: work.id } },
    });
    if (!inCollection) {
      throw new BadRequestException(
        'Сначала добавьте книгу в коллекцию, затем на полку',
      );
    }

    await this.prisma.shelfItem.upsert({
      where: {
        shelfId_workId: { shelfId: shelf.id, workId: work.id },
      },
      create: {
        shelfId: shelf.id,
        workId: work.id,
      },
      update: {},
    });

    return this.get(userId, shelf.id);
  }

  async removeItem(
    userId: string,
    shelfId: string,
    workSlug: string,
  ): Promise<ShelfResponse> {
    const shelf = await this.findOwnedShelf(userId, shelfId);
    const work = await this.findPublishedWorkBySlug(workSlug);
    await this.prisma.shelfItem.deleteMany({
      where: { shelfId: shelf.id, workId: work.id },
    });
    return this.get(userId, shelf.id);
  }

  async listPublicByUserSlug(slug: string): Promise<PublicShelvesResponse> {
    const user = await this.prisma.user.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const rows = await this.prisma.shelf.findMany({
      where: { userId: user.id },
      include: {
        items: {
          where: {
            work: { deletedAt: null, status: WorkStatus.PUBLISHED },
          },
          select: { id: true },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });

    return {
      slug: user.slug,
      shelves: rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        description: row.description,
        itemCount: row.items.length,
      })),
    };
  }

  async getPublicByUserAndShelfSlug(
    userSlug: string,
    shelfSlug: string,
  ): Promise<PublicShelfDetail> {
    const user = await this.prisma.user.findFirst({
      where: { slug: userSlug, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const shelf = await this.prisma.shelf.findUnique({
      where: {
        userId_slug: { userId: user.id, slug: shelfSlug },
      },
      include: {
        items: {
          where: {
            work: { deletedAt: null, status: WorkStatus.PUBLISHED },
          },
          include: {
            work: {
              select: {
                id: true,
                slug: true,
                titleRu: true,
                status: true,
                deletedAt: true,
              },
            },
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!shelf) {
      throw new NotFoundException('Полка не найдена');
    }

    return {
      slug: user.slug,
      shelfSlug: shelf.slug,
      title: shelf.title,
      description: shelf.description,
      items: shelf.items.map((item) => ({
        workSlug: item.work.slug,
        titleRu: item.work.titleRu,
      })),
    };
  }

  private async findOwnedShelf(
    userId: string,
    shelfId: string,
  ): Promise<ShelfWithItems> {
    const row = await this.prisma.shelf.findFirst({
      where: { id: shelfId, userId },
      include: this.itemInclude(),
    });
    if (!row) {
      throw new NotFoundException('Полка не найдена');
    }
    return row;
  }

  private itemInclude() {
    return {
      items: {
        where: {
          work: { deletedAt: null, status: WorkStatus.PUBLISHED },
        },
        include: {
          work: {
            select: {
              id: true,
              slug: true,
              titleRu: true,
              status: true,
              deletedAt: true,
            },
          },
        },
        orderBy: [{ position: 'asc' as const }, { createdAt: 'asc' as const }],
      },
    };
  }

  private toResponse(row: ShelfWithItems, withItems: boolean): ShelfResponse {
    const items = row.items.map((item) => ({
      workId: item.workId,
      workSlug: item.work.slug,
      titleRu: item.work.titleRu,
      position: item.position,
    }));
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      itemCount: items.length,
      ...(withItems ? { items } : {}),
    };
  }

  private async resolvePublishedWork(input: AddShelfItemInput): Promise<Work> {
    if (input.workId) {
      const work = await this.prisma.work.findFirst({
        where: {
          id: input.workId,
          deletedAt: null,
          status: WorkStatus.PUBLISHED,
        },
      });
      if (!work) {
        throw new NotFoundException('Произведение не найдено');
      }
      return work;
    }
    if (input.workSlug) {
      return this.findPublishedWorkBySlug(input.workSlug);
    }
    throw new BadRequestException('Укажите workId или workSlug');
  }

  private async findPublishedWorkBySlug(workSlug: string): Promise<Work> {
    const work = await this.prisma.work.findFirst({
      where: {
        slug: workSlug,
        deletedAt: null,
        status: WorkStatus.PUBLISHED,
      },
    });
    if (!work) {
      throw new NotFoundException('Произведение не найдено');
    }
    return work;
  }

  slugifyTitle(title: string): string {
    const lowered = title.trim().toLowerCase();
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
    return normalized.length > 0 ? normalized : 'polka';
  }

  normalizeSlug(slug: string): string {
    const normalized = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);
    if (!normalized) {
      throw new BadRequestException('Некорректный slug полки');
    }
    return normalized;
  }

  private async allocateUniqueSlug(
    userId: string,
    base: string,
    exceptShelfId?: string,
  ): Promise<string> {
    let candidate = base;
    let suffix = 2;
    while (true) {
      const taken = await this.prisma.shelf.findUnique({
        where: { userId_slug: { userId, slug: candidate } },
        select: { id: true },
      });
      if (!taken || taken.id === exceptShelfId) {
        return candidate;
      }
      candidate = `${base}-${suffix}`.slice(0, 200);
      suffix += 1;
    }
  }
}
