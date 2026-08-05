import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkStatus, type Tag, type UserBook, type Work } from '@prisma/client';
import type {
  AssignTagInput,
  CreateTagInput,
  TagResponse,
  UpdateTagInput,
  UserBookResponse,
} from '@bookspace/schemas';
import { PrismaService } from '../prisma/prisma.service';

type UserBookWithWorkAndTags = UserBook & {
  work: Pick<Work, 'id' | 'slug' | 'titleRu' | 'status' | 'deletedAt'>;
  tags: Array<{ tag: Tag }>;
};

@Injectable()
export class MeTagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateTagInput): Promise<TagResponse> {
    const name = input.name;
    const existing = await this.prisma.tag.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) {
      throw new ConflictException('Тег с таким именем уже есть');
    }

    const row = await this.prisma.tag.create({
      data: { userId, name },
    });
    return this.toTagResponse(row);
  }

  async list(userId: string): Promise<TagResponse[]> {
    const rows = await this.prisma.tag.findMany({
      where: { userId },
      orderBy: [{ name: 'asc' }],
    });
    return rows.map((row) => this.toTagResponse(row));
  }

  async update(
    userId: string,
    tagId: string,
    input: UpdateTagInput,
  ): Promise<TagResponse> {
    const existing = await this.findOwnedTag(userId, tagId);
    if (input.name !== existing.name) {
      const clash = await this.prisma.tag.findUnique({
        where: { userId_name: { userId, name: input.name } },
      });
      if (clash) {
        throw new ConflictException('Тег с таким именем уже есть');
      }
    }

    const row = await this.prisma.tag.update({
      where: { id: existing.id },
      data: { name: input.name },
    });
    return this.toTagResponse(row);
  }

  async remove(userId: string, tagId: string): Promise<void> {
    const existing = await this.findOwnedTag(userId, tagId);
    await this.prisma.tag.delete({ where: { id: existing.id } });
  }

  async assignToWork(
    userId: string,
    workSlug: string,
    input: AssignTagInput,
  ): Promise<UserBookResponse> {
    const userBook = await this.findOwnedUserBookByWorkSlug(userId, workSlug);
    const tag = await this.resolveTagForAssign(userId, input);

    await this.prisma.userBookTag.upsert({
      where: {
        userBookId_tagId: { userBookId: userBook.id, tagId: tag.id },
      },
      create: { userBookId: userBook.id, tagId: tag.id },
      update: {},
    });

    return this.getUserBookWithTags(userBook.id);
  }

  async unassignFromWork(
    userId: string,
    workSlug: string,
    tagId: string,
  ): Promise<UserBookResponse> {
    const userBook = await this.findOwnedUserBookByWorkSlug(userId, workSlug);
    await this.findOwnedTag(userId, tagId);
    await this.prisma.userBookTag.deleteMany({
      where: { userBookId: userBook.id, tagId },
    });
    return this.getUserBookWithTags(userBook.id);
  }

  async listForWork(userId: string, workSlug: string): Promise<TagResponse[]> {
    const userBook = await this.findOwnedUserBookByWorkSlug(userId, workSlug);
    const rows = await this.prisma.userBookTag.findMany({
      where: { userBookId: userBook.id },
      include: { tag: true },
      orderBy: { tag: { name: 'asc' } },
    });
    return rows.map((row) => this.toTagResponse(row.tag));
  }

  private async resolveTagForAssign(
    userId: string,
    input: AssignTagInput,
  ): Promise<Tag> {
    if (input.tagId) {
      return this.findOwnedTag(userId, input.tagId);
    }
    if (input.name) {
      const existing = await this.prisma.tag.findUnique({
        where: { userId_name: { userId, name: input.name } },
      });
      if (existing) {
        return existing;
      }
      return this.prisma.tag.create({
        data: { userId, name: input.name },
      });
    }
    throw new BadRequestException('Укажите tagId или name');
  }

  private async findOwnedTag(userId: string, tagId: string): Promise<Tag> {
    const row = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
    });
    if (!row) {
      throw new NotFoundException('Тег не найден');
    }
    return row;
  }

  private async findOwnedUserBookByWorkSlug(
    userId: string,
    workSlug: string,
  ): Promise<UserBook> {
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

    const userBook = await this.prisma.userBook.findUnique({
      where: { userId_workId: { userId, workId: work.id } },
    });
    if (!userBook) {
      throw new BadRequestException(
        'Сначала добавьте книгу в коллекцию, затем назначьте тег',
      );
    }
    return userBook;
  }

  private async getUserBookWithTags(
    userBookId: string,
  ): Promise<UserBookResponse> {
    const row = await this.prisma.userBook.findUniqueOrThrow({
      where: { id: userBookId },
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
        tags: {
          include: { tag: true },
          orderBy: { tag: { name: 'asc' } },
        },
      },
    });
    return this.toUserBookResponse(row);
  }

  private toTagResponse(row: Tag): TagResponse {
    return { id: row.id, name: row.name };
  }

  private toUserBookResponse(row: UserBookWithWorkAndTags): UserBookResponse {
    return {
      id: row.id,
      userId: row.userId,
      workId: row.workId,
      workSlug: row.work.slug,
      titleRu: row.work.titleRu,
      status: row.status,
      rating: row.rating,
      finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
      tags: row.tags.map((link) => this.toTagResponse(link.tag)),
    };
  }
}
