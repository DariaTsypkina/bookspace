import { Controller, Get, Param } from '@nestjs/common';
import { MeShelvesService } from '../me/me-shelves.service';

/** Публичные полки пользователя. */
@Controller('users')
export class PublicShelvesController {
  constructor(private readonly shelves: MeShelvesService) {}

  @Get(':slug/shelves')
  listShelves(@Param('slug') slug: string) {
    return this.shelves.listPublicByUserSlug(slug);
  }

  @Get(':slug/shelves/:shelfSlug')
  getShelf(@Param('slug') slug: string, @Param('shelfSlug') shelfSlug: string) {
    return this.shelves.getPublicByUserAndShelfSlug(slug, shelfSlug);
  }
}
