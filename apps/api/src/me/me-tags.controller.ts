import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { SessionUser } from '../auth/auth.service';
import { CreateTagDto, UpdateTagDto } from './dto/me-tags.dto';
import { MeTagsService } from './me-tags.service';

@Controller('me/tags')
@UseGuards(AuthGuard)
export class MeTagsController {
  constructor(private readonly tags: MeTagsService) {}

  @Post()
  @HttpCode(201)
  create(@CurrentUser() user: SessionUser, @Body() body: CreateTagDto) {
    return this.tags.create(user.id, body);
  }

  @Get()
  async list(@CurrentUser() user: SessionUser) {
    return { tags: await this.tags.list(user.id) };
  }

  @Patch(':tagId')
  update(
    @CurrentUser() user: SessionUser,
    @Param('tagId') tagId: string,
    @Body() body: UpdateTagDto,
  ) {
    return this.tags.update(user.id, tagId, body);
  }

  @Delete(':tagId')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: SessionUser,
    @Param('tagId') tagId: string,
  ) {
    await this.tags.remove(user.id, tagId);
  }
}
