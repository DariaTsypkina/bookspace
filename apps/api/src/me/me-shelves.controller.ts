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
import {
  AddShelfItemDto,
  CreateShelfDto,
  UpdateShelfDto,
} from './dto/me-shelves.dto';
import { MeShelvesService } from './me-shelves.service';

@Controller('me/shelves')
@UseGuards(AuthGuard)
export class MeShelvesController {
  constructor(private readonly shelves: MeShelvesService) {}

  @Post()
  @HttpCode(201)
  create(@CurrentUser() user: SessionUser, @Body() body: CreateShelfDto) {
    return this.shelves.create(user.id, body);
  }

  @Get()
  async list(@CurrentUser() user: SessionUser) {
    return { shelves: await this.shelves.list(user.id) };
  }

  @Get(':shelfId')
  get(@CurrentUser() user: SessionUser, @Param('shelfId') shelfId: string) {
    return this.shelves.get(user.id, shelfId);
  }

  @Patch(':shelfId')
  update(
    @CurrentUser() user: SessionUser,
    @Param('shelfId') shelfId: string,
    @Body() body: UpdateShelfDto,
  ) {
    return this.shelves.update(user.id, shelfId, body);
  }

  @Delete(':shelfId')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: SessionUser,
    @Param('shelfId') shelfId: string,
  ) {
    await this.shelves.remove(user.id, shelfId);
  }

  @Post(':shelfId/items')
  @HttpCode(201)
  addItem(
    @CurrentUser() user: SessionUser,
    @Param('shelfId') shelfId: string,
    @Body() body: AddShelfItemDto,
  ) {
    return this.shelves.addItem(user.id, shelfId, body);
  }

  @Delete(':shelfId/items/:workSlug')
  removeItem(
    @CurrentUser() user: SessionUser,
    @Param('shelfId') shelfId: string,
    @Param('workSlug') workSlug: string,
  ) {
    return this.shelves.removeItem(user.id, shelfId, workSlug);
  }
}
