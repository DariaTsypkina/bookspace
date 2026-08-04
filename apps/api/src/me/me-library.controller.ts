import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { SessionUser } from '../auth/auth.service';
import {
  PatchUserBookDto,
  PutUserBookBySlugDto,
  UpsertUserBookDto,
} from './dto/me-library.dto';
import { AssignTagDto } from './dto/me-tags.dto';
import { MeLibraryService } from './me-library.service';
import { MeTagsService } from './me-tags.service';

@Controller('me/library')
@UseGuards(AuthGuard)
export class MeLibraryController {
  constructor(
    private readonly library: MeLibraryService,
    private readonly tags: MeTagsService,
  ) {}

  /** Upsert статуса/оценки (workId или workSlug в body). */
  @Post('items')
  @HttpCode(201)
  upsertItem(
    @CurrentUser() user: SessionUser,
    @Body() body: UpsertUserBookDto,
  ) {
    return this.library.upsert(user.id, body);
  }

  /** Upsert по slug произведения. */
  @Put('works/:workSlug')
  upsertBySlug(
    @CurrentUser() user: SessionUser,
    @Param('workSlug') workSlug: string,
    @Body() body: PutUserBookBySlugDto,
  ) {
    return this.library.upsert(user.id, {
      workId: undefined,
      workSlug,
      status: body.status,
      rating: body.rating,
    });
  }

  @Patch('works/:workSlug')
  patchBySlug(
    @CurrentUser() user: SessionUser,
    @Param('workSlug') workSlug: string,
    @Body() body: PatchUserBookDto,
  ) {
    return this.library.patch(user.id, workSlug, body);
  }

  @Get('works/:workSlug')
  async getBySlug(
    @CurrentUser() user: SessionUser,
    @Param('workSlug') workSlug: string,
  ) {
    const item = await this.library.getByWorkSlug(user.id, workSlug);
    return { item };
  }

  @Get('works/:workSlug/tags')
  async listTags(
    @CurrentUser() user: SessionUser,
    @Param('workSlug') workSlug: string,
  ) {
    return { tags: await this.tags.listForWork(user.id, workSlug) };
  }

  @Post('works/:workSlug/tags')
  @HttpCode(201)
  assignTag(
    @CurrentUser() user: SessionUser,
    @Param('workSlug') workSlug: string,
    @Body() body: AssignTagDto,
  ) {
    return this.tags.assignToWork(user.id, workSlug, body);
  }

  @Delete('works/:workSlug/tags/:tagId')
  unassignTag(
    @CurrentUser() user: SessionUser,
    @Param('workSlug') workSlug: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tags.unassignFromWork(user.id, workSlug, tagId);
  }
}
