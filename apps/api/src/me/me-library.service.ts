import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UserBookStatus,
  WorkStatus,
  type UserBook,
  type Work,
} from '@prisma/client';
import type {
  PatchUserBookInput,
  PublicLibraryResponse,
  UpsertUserBookInput,
  UserBookResponse,
} from '@bookspace/schemas';
import { PrismaService } from '../prisma/prisma.service';

type UserBookWithWork = UserBook & {
  work: Pick<Work, 'id' | 'slug' | 'titleRu' | 'status' | 'deletedAt'>;
};

@Injectable()
export class MeLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    input: UpsertUserBookInput,
  ): Promise<UserBookResponse> {
    const work = await this.resolvePublishedWork(input);
    const nextStatus = input.status as UserBookStatus;
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
    });
    if (!existing) {
      throw new NotFoundException('Запись библиотеки не найдена');
    }

    const nextStatus =
      input.status !== undefined
        ? (input.status as UserBookStatus)
        : existing.status;
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
    });

    return this.toResponse(row);
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
      orderBy: [{ updatedAt: 'desc' }],
    });

    return {
      slug: user.slug,
      items: rows.map((row) => ({
        workSlug: row.work.slug,
        titleRu: row.work.titleRu,
        status: row.status,
        rating: row.rating,
        finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
      })),
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
    };
  }
}
