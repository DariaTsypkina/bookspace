import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UserBookStatus,
  WorkStatus,
  type Tag,
  type UserBook,
  type Work,
} from '@prisma/client';
import type {
  PatchUserBookInput,
  PublicLibraryResponse,
  PublicUserBookDetail,
  UpsertUserBookInput,
  UserBookResponse,
} from '@bookspace/schemas';
import { PrismaService } from '../prisma/prisma.service';
import { filterPublicNotes } from './public-notes';
import { toPublicReadingGoal } from './public-reading-goal';

type UserBookWithWork = UserBook & {
  work: Pick<Work, 'id' | 'slug' | 'titleRu' | 'status' | 'deletedAt'>;
  tags: Array<{ tag: Pick<Tag, 'id' | 'name'> }>;
};

const workSelect = {
  id: true,
  slug: true,
  titleRu: true,
  status: true,
  deletedAt: true,
} as const;

const tagsInclude = {
  include: { tag: { select: { id: true, name: true } } },
  orderBy: { tag: { name: 'asc' as const } },
};

@Injectable()
export class MeLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    input: UpsertUserBookInput,
  ): Promise<UserBookResponse> {
    const work = await this.resolvePublishedWork(input);
    const nextStatus = input.status;
    const existing = await this.prisma.userBook.findUnique({
      where: { userId_workId: { userId, workId: work.id } },
    });

    const finishedAt = this.nextFinishedAt(
      existing?.status,
      nextStatus,
      existing?.finishedAt ?? null,
    );

    const rating =
      input.rating === undefined ? (existing?.rating ?? null) : input.rating;

    const row = await this.prisma.userBook.upsert({
      where: { userId_workId: { userId, workId: work.id } },
      create: {
        userId,
        workId: work.id,
        status: nextStatus,
        rating,
        finishedAt,
      },
      update: {
        status: nextStatus,
        rating,
        finishedAt,
      },
      include: {
        work: { select: workSelect },
        tags: tagsInclude,
      },
    });

    return this.toResponse(row);
  }

  async patch(
    userId: string,
    workSlug: string,
    input: PatchUserBookInput,
  ): Promise<UserBookResponse> {
    const work = await this.findPublishedWorkBySlug(workSlug);
    const existing = await this.prisma.userBook.findUnique({
      where: { userId_workId: { userId, workId: work.id } },
      include: {
        work: { select: workSelect },
        tags: tagsInclude,
      },
    });
    if (!existing) {
      throw new NotFoundException('Запись библиотеки не найдена');
    }

    const nextStatus =
      input.status !== undefined ? input.status : existing.status;
    const rating = input.rating === undefined ? existing.rating : input.rating;
    const finishedAt = this.nextFinishedAt(
      existing.status,
      nextStatus,
      existing.finishedAt,
    );

    const row = await this.prisma.userBook.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        rating,
        finishedAt,
      },
      include: {
        work: { select: workSelect },
        tags: tagsInclude,
      },
    });

    return this.toResponse(row);
  }

  async list(
    userId: string,
    status?: UpsertUserBookInput['status'],
  ): Promise<UserBookResponse[]> {
    const rows = await this.prisma.userBook.findMany({
      where: {
        userId,
        ...(status !== undefined ? { status } : {}),
        work: {
          deletedAt: null,
          status: WorkStatus.PUBLISHED,
        },
      },
      include: {
        work: { select: workSelect },
        tags: tagsInclude,
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
    return rows.map((row) => this.toResponse(row));
  }

  async getByWorkSlug(
    userId: string,
    workSlug: string,
  ): Promise<UserBookResponse | null> {
    const work = await this.prisma.work.findFirst({
      where: {
        slug: workSlug,
        deletedAt: null,
        status: WorkStatus.PUBLISHED,
      },
    });
    if (!work) {
      return null;
    }
    const row = await this.prisma.userBook.findUnique({
      where: { userId_workId: { userId, workId: work.id } },
      include: {
        work: { select: workSelect },
        tags: tagsInclude,
      },
    });
    return row ? this.toResponse(row) : null;
  }

  async listPublicBySlug(slug: string): Promise<PublicLibraryResponse> {
    const user = await this.prisma.user.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const rows = await this.prisma.userBook.findMany({
      where: {
        userId: user.id,
        work: {
          deletedAt: null,
          status: WorkStatus.PUBLISHED,
        },
      },
      include: {
        work: { select: workSelect },
        tags: tagsInclude,
      },
      orderBy: [{ updatedAt: 'desc' }],
    });

    // Note / ReadingGoal models — bd-sf4; контракт: PUBLIC notes + goal only if showOnProfile
    const notes = filterPublicNotes([]);
    const goal = toPublicReadingGoal(null);

    return {
      slug: user.slug,
      items: rows.map((row) => ({
        workSlug: row.work.slug,
        titleRu: row.work.titleRu,
        status: row.status,
        rating: row.rating,
        finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
        tags: row.tags.map((link) => ({ name: link.tag.name })),
      })),
      notes,
      goal,
    };
  }

  async getPublicBySlugAndWorkSlug(
    slug: string,
    workSlug: string,
  ): Promise<PublicUserBookDetail> {
    const user = await this.prisma.user.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

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

    const row = await this.prisma.userBook.findUnique({
      where: { userId_workId: { userId: user.id, workId: work.id } },
      include: {
        work: { select: workSelect },
        tags: tagsInclude,
      },
    });
    if (!row) {
      throw new NotFoundException('Книга не найдена в коллекции');
    }

    return {
      slug: user.slug,
      workSlug: row.work.slug,
      titleRu: row.work.titleRu,
      status: row.status,
      rating: row.rating,
      finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
      tags: row.tags.map((link) => ({ name: link.tag.name })),
      notes: filterPublicNotes([]),
    };
  }

  private async resolvePublishedWork(
    input: UpsertUserBookInput,
  ): Promise<Work> {
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

  private nextFinishedAt(
    prevStatus: UserBookStatus | undefined,
    nextStatus: UserBookStatus,
    prevFinishedAt: Date | null,
  ): Date | null {
    if (nextStatus === UserBookStatus.READ) {
      if (prevStatus === UserBookStatus.READ && prevFinishedAt) {
        return prevFinishedAt;
      }
      return new Date();
    }
    return null;
  }

  private toResponse(row: UserBookWithWork): UserBookResponse {
    return {
      id: row.id,
      userId: row.userId,
      workId: row.workId,
      workSlug: row.work.slug,
      titleRu: row.work.titleRu,
      status: row.status,
      rating: row.rating,
      finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
      tags: row.tags.map((link) => ({
        id: link.tag.id,
        name: link.tag.name,
      })),
    };
  }
}
